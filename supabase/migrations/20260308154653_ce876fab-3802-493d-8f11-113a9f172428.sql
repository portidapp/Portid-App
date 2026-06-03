
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  tagline TEXT,
  description TEXT,
  vision TEXT,
  mission TEXT,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  website TEXT,
  google_review TEXT,
  location TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'button_click')),
  button_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profiles" ON public.profiles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles viewable by slug" ON public.profiles FOR SELECT USING (true);

-- Media policies
CREATE POLICY "Users can manage media for their profiles" ON public.media FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = media.profile_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Public media viewable" ON public.media FOR SELECT USING (true);

-- Analytics policies (anyone can insert for tracking, owners can read)
CREATE POLICY "Anyone can insert analytics" ON public.analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Profile owners can view analytics" ON public.analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = analytics.profile_id AND profiles.user_id = auth.uid())
);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-assets', 'profile-assets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view profile assets" ON storage.objects FOR SELECT USING (bucket_id = 'profile-assets');
CREATE POLICY "Authenticated users can upload profile assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Index for faster slug lookups
CREATE INDEX idx_profiles_slug ON public.profiles(slug);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_analytics_profile_id ON public.analytics(profile_id);
CREATE INDEX idx_media_profile_id ON public.media(profile_id);

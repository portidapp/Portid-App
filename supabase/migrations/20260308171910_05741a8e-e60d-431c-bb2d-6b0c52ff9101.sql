
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all analytics
CREATE POLICY "Admins can view all analytics"
ON public.analytics FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all media
CREATE POLICY "Admins can view all media"
ON public.media FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

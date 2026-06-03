export const LAYOUTS = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Clean centered layout with stacked sections',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Wide cover with overlapping card sections',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Full-width hero with large typography',
  },
] as const;

export type LayoutId = typeof LAYOUTS[number]['id'];

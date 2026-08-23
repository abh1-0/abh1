export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  category: 'Web Applications' | 'Developer Tools' | 'Systems & Performance' | 'Open Source';
  tags: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  stars?: number;
  highlights?: string[];
}

export const projects: Project[] = [];

export const projectCategories = [
  'All',
  'Web Applications',
  'Developer Tools',
  'Systems & Performance',
  'Open Source'
] as const;

export const site = {
  name: 'abh1',
  githubUser: 'abh1-0',
  url: 'https://abh1.xyz',
  title: 'abh1 — Personal Portfolio & Technical Writing',
  description:
    'Personal portfolio of abh1 — Software engineer crafting high-performance web software, developer tools, and systems architectures.',
  role: 'Software Engineer & Full-Stack Architect',
  email: 'contact@abh1.xyz'
} as const;

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Writing', href: '/blog' }
] as const;

export type SocialIcon =
  | 'github'
  | 'telegram'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'mail';

export interface Social {
  label: string;
  href: string;
  icon: SocialIcon;
}

/** Handles are placeholders under the abh1_0 family until real URLs land here. */
export const socials: Social[] = [
  { label: 'GitHub', href: 'https://github.com/abh1-0', icon: 'github' },
  { label: 'Telegram', href: 'https://t.me/abh1_0', icon: 'telegram' },
  { label: 'Instagram', href: 'https://instagram.com/abh1_0', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com/abh1.0', icon: 'facebook' },
  { label: 'X', href: 'https://x.com/abh1_0', icon: 'x' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abh1-0', icon: 'linkedin' },
  { label: 'Email', href: 'mailto:contact@abh1.xyz', icon: 'mail' }
];

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

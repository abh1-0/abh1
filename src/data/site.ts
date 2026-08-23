export const site = {
  name: 'abh1',
  githubUser: 'abh1-0',
  url: 'https://abh1.xyz',
  title: 'abh1 — Personal Portfolio & Technical Writing',
  description:
    'Personal portfolio of abh1 — Software engineer crafting high-performance web software, developer tools, and systems architectures.',
  role: 'Software Engineer & Full-Stack Architect',
  email: 'abhiramvun@gmail.com'
} as const;

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Writing', href: '/blog' }
] as const;

export type SocialIcon =
  | 'github'
  | 'youtube'
  | 'telegram'
  | 'instagram'
  | 'x'
  | 'mail';

export interface Social {
  label: string;
  href: string;
  icon: SocialIcon;
}

export const socials: Social[] = [
  { label: 'GitHub', href: 'https://github.com/abh1-0', icon: 'github' },
  { label: 'YouTube', href: 'https://youtube.com/@abh1-c0', icon: 'youtube' },
  { label: 'Telegram', href: 'https://t.me/abh1_0', icon: 'telegram' },
  { label: 'Instagram', href: 'https://instagram.com/abhiram.vunnava', icon: 'instagram' },
  { label: 'X', href: 'https://x.com/abh1ram_0', icon: 'x' },
  { label: 'Email', href: 'mailto:abhiramvun@gmail.com', icon: 'mail' }
];

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

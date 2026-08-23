import { site } from '../data/site';

export const SITE_URL = site.url;

export const OG_IMAGE_PATH = '/og.png';
export const OG_IMAGE_URL = new URL(OG_IMAGE_PATH, SITE_URL).toString();
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = `${site.legalName} (${site.name}) — ${site.role}, based in ${site.location.city}, ${site.location.country}`;

const KNOWS_ABOUT = [
  'Web Performance',
  'TypeScript',
  'Astro',
  'React / Next.js',
  'Design Systems',
  'WebAssembly',
  'Systems Programming',
  'Windows Internals',
  'Network Protocols'
] as const;

export function absoluteUrl(pathname: string): string {
  let path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (!path.endsWith('/') && !/\.[a-zA-Z0-9]+$/.test(path)) {
    path = `${path}/`;
  }
  return new URL(path, SITE_URL).toString();
}

const SOCIAL_LINKS = [
  'https://github.com/abh1-0',
  'https://youtube.com/@abh1-c0',
  'https://t.me/abh1_0',
  'https://instagram.com/abhiram.vunnava',
  'https://x.com/abh1ram_0'
];

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: site.legalName,
    alternateName: [site.name, 'abh1-0', 'Abhiram Vunnava'],
    url: `${SITE_URL}/`,
    image: new URL('/avatar.png', SITE_URL).toString(),
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.countryCode
    },
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.location.city,
        addressCountry: site.location.countryCode
      }
    },
    knowsAbout: KNOWS_ABOUT,
    sameAs: SOCIAL_LINKS
  } as const;
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: site.title,
    description: site.description,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#person` }
  } as const;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function graphSchema(...nodes: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes
  };
}

export function profilePageSchema(pagePath: string, headline: string) {
  return graphSchema(
    {
      '@type': 'ProfilePage',
      '@id': absoluteUrl(pagePath),
      url: absoluteUrl(pagePath),
      inLanguage: 'en',
      name: headline,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': `${SITE_URL}/#person` }
    },
    personSchema(),
    websiteSchema()
  );
}

export function collectionPageSchema(
  pagePath: string,
  headline: string,
  description: string,
  items: { name: string; url: string }[]
) {
  return graphSchema(
    {
      '@type': 'CollectionPage',
      '@id': absoluteUrl(pagePath),
      url: absoluteUrl(pagePath),
      inLanguage: 'en',
      name: headline,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#person` }
    },
    websiteSchema(),
    {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url
      }))
    }
  );
}

export interface ArticleMeta {
  title: string;
  description: string;
  path: string;
  pubDate: Date;
  modifiedDate?: Date;
  tags?: string[];
  wordCount?: number;
}

export function blogPostingSchema(meta: ArticleMeta) {
  return graphSchema(
    websiteSchema(),
    {
      '@type': 'BlogPosting',
      '@id': absoluteUrl(meta.path),
      url: absoluteUrl(meta.path),
      inLanguage: 'en',
      headline: meta.title,
      description: meta.description,
      image: [OG_IMAGE_URL, new URL('/avatar.png', SITE_URL).toString()],
      datePublished: meta.pubDate.toISOString(),
      dateModified: (meta.modifiedDate ?? meta.pubDate).toISOString(),
      wordCount: meta.wordCount,
      keywords: meta.tags?.join(', '),
      author: { '@id': `${SITE_URL}/#person` },
      publisher: { '@id': `${SITE_URL}/#person` },
      mainEntityOfPage: { '@id': absoluteUrl(meta.path) },
      isPartOf: { '@id': `${SITE_URL}/blog/#website-section` }
    },
    personSchema()
  );
}

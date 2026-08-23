import sharp from 'sharp';
import { site } from '../data/site';

export const GET = async () => {
  const width = 1200;
  const height = 630;

  const words = site.description.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ([...current, word].join(' ').length > 44 && current) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);

  const descriptionLines = lines
    .slice(0, 3)
    .map(
      (line, i) =>
        `<text x="80" y="${452 + i * 42}" font-family="Geist, 'Segoe UI', system-ui, sans-serif" font-size="25" fill="#a1a1aa">${escapeXml(line)}</text>`
    )
    .join('');

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#09090b"/>
  <rect x="80" y="96" width="40" height="40" rx="11" fill="#18181b" stroke="#27272a"/>
  <text x="100" y="124" text-anchor="middle" font-family="Geist Mono, Consolas, monospace" font-size="22" font-weight="600" fill="#fafafa">a</text>
  <text x="136" y="124" font-family="Geist Mono, Consolas, monospace" font-size="22" fill="#71717a">abh1.xyz</text>
  <text x="80" y="238" font-family="Geist, 'Segoe UI', system-ui, sans-serif" font-size="72" font-weight="600" letter-spacing="-2.5" fill="#fafafa">${escapeXml(site.legalName)}</text>
  <text x="80" y="300" font-family="Geist, 'Segoe UI', system-ui, sans-serif" font-size="34" fill="#71717a">also builds as <tspan fill="#a1a1aa" font-family="Geist Mono, Consolas, monospace" font-size="30">${escapeXml(site.name)}</tspan></text>
  <text x="80" y="366" font-family="Geist, 'Segoe UI', system-ui, sans-serif" font-size="30" font-weight="500" letter-spacing="-0.5" fill="#e4e4e7">${escapeXml(site.role)}</text>
  ${descriptionLines}
  <rect x="80" y="566" width="${width - 160}" height="1" fill="#27272a"/>
  <circle cx="86" cy="596" r="5" fill="#34d399"/>
  <text x="104" y="602" font-family="Geist Mono, Consolas, monospace" font-size="19" fill="#a1a1aa">Hyderabad, India &#183; UTC+5:30</text>
  <text x="${width - 80}" y="602" text-anchor="end" font-family="Geist Mono, Consolas, monospace" font-size="19" fill="#52525b">Writing &#183; Open Source</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

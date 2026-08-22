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

export const projects: Project[] = [
  {
    id: 'aether-studio',
    title: 'Aether Studio',
    tagline: 'AI-augmented collaborative web IDE & visual design workbench',
    description:
      'High-performance browser-based studio for editing web applications with instant DOM visual canvas sync, WebAssembly code execution, and intelligent code synthesis.',
    image: '/projects/aether-workspace.jpg',
    category: 'Developer Tools',
    tags: ['TypeScript', 'Astro', 'React', 'WebAssembly', 'Tailwind CSS'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/aether-studio',
    liveUrl: 'https://aether.abh1.xyz',
    stars: 48,
    highlights: [
      'Sub-16ms visual DOM canvas updates',
      'WebAssembly sandboxed code execution',
      'Custom AST parser for live code updates'
    ]
  },
  {
    id: 'pulse-metrics',
    title: 'Pulse Telemetry',
    tagline: 'Real-time distributed metrics & performance analytics platform',
    description:
      'High-throughput telemetry dashboard engineered to aggregate millions of microservice events in real time with interactive Canvas charts and WebSocket alerts.',
    image: '/projects/pulse-metrics.jpg',
    category: 'Web Applications',
    tags: ['TypeScript', 'Next.js', 'Go', 'Tailwind CSS', 'WebSockets'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/pulse-metrics',
    liveUrl: 'https://pulse.abh1.xyz',
    stars: 34,
    highlights: [
      'Streams 50,000+ metrics/sec via WebSockets',
      'Sub-10ms query latency on time-series datasets',
      'Custom HTML5 Canvas rendering engine'
    ]
  },
  {
    id: 'lithium-engine',
    title: 'Lithium Engine',
    tagline: 'Ultra-lightweight browser shell focused on developer productivity',
    description:
      'Optimized Chromium-based web browser environment tailored for developers, featuring minimal RAM allocation, native dark glass interface, and built-in network inspect tools.',
    image: '/projects/lithium-browser.jpg',
    category: 'Systems & Performance',
    tags: ['C++', 'Chromium', 'Rust', 'Shell'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/lithium',
    stars: 19,
    highlights: [
      '40% lower memory footprint than standard Chromium',
      'Hardware-accelerated dark theme rendering',
      'Integrated HTTP request inspector'
    ]
  },
  {
    id: 'fetch-protocol',
    title: 'Fetch Protocol',
    tagline: 'Universal open-source printing & scanning network protocol',
    description:
      'Cross-platform network discovery protocol and management dashboard eliminating proprietary vendor driver lock-in across local network hardware fleets.',
    image: '/projects/fetch-protocol.jpg',
    category: 'Open Source',
    tags: ['TypeScript', 'Node.js', 'Network Protocols', 'mDNS'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/fetch',
    stars: 27,
    highlights: [
      'Zero-configuration mDNS device discovery',
      'Universal IPP & PDF rasterization pipeline',
      'Web-based administrative management console'
    ]
  },
  {
    id: 'nexus-ui',
    title: 'Nexus Design System',
    tagline: 'Headless, accessible UI component kit for modern web applications',
    description:
      'Zero-runtime CSS token architecture combined with headless accessibility primitives, micro-animations, and full WCAG AA compliance out of the box.',
    image: '/projects/nexus-ui.jpg',
    category: 'Developer Tools',
    tags: ['TypeScript', 'Tailwind CSS', 'Astro', 'A11y'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/nexus-ui',
    liveUrl: 'https://nexus.abh1.xyz',
    stars: 62,
    highlights: [
      '100% keyboard navigable and WCAG AA compliant',
      'Zero-runtime design token extraction',
      'Fluid typographic & spacing scale system'
    ]
  },
  {
    id: 'oplus-battery',
    title: 'Oplus Power Governor',
    tagline: 'Kernel-level resource governor & battery tuning utility',
    description:
      'Low-level performance governor module fine-tuning CPU core scaling, background process priority, and battery discharge rates on custom devices.',
    image: '/projects/oplus-battery.jpg',
    category: 'Systems & Performance',
    tags: ['JavaScript', 'Shell', 'C', 'Kernel Tweaks'],
    featured: true,
    githubUrl: 'https://github.com/abh1-0/oplus-battery',
    stars: 42,
    highlights: [
      'Up to 25% battery life extension under typical load',
      'Dynamic CPU governor frequency scaling',
      'Automated background process thermal throttling'
    ]
  }
];

export const projectCategories = [
  'All',
  'Web Applications',
  'Developer Tools',
  'Systems & Performance',
  'Open Source'
] as const;

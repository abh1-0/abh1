# Design System & Aesthetics Guidelines

## Identity & Aesthetic Standard

- **Ground**: Restrained near-black (`#09090b`), secondary surface `#0c0c0e`, glass container `rgba(255, 255, 255, 0.03)`.
- **Typography**: `Geist Variable` for clean sans interface text; `Geist Mono` for technical data, code snippets, dates, metrics, and tags.
- **Palette**: Monochromatic zinc hierarchy with subtle accent glows (violet/cyan subtle hover states, language pill accents).
- **Hairlines**: 1px subtle borders (`rgba(255, 255, 255, 0.08)`) separating structural sections and cards.
- **Motion**: Staggered rise hero animation (`rise rise-1`..`rise-4`), subtle hover lift on project cards, smooth image scale (`scale-102`), backdrop blur header transition.

## Portfolio Components

1. **Hero Header**: High-impact personal brand statement, title, bio, status badge, primary and secondary CTA buttons.
2. **Featured Projects Showcase**: Grid cards featuring 16:9 preview screenshots, project tag badges, category pill, description, GitHub source link, and live demo link.
3. **Category Filtering**: Interactive tab controls (All, Web Applications, Developer Tools, Systems & Performance, Open Source).
4. **Project Lightbox / Preview Modal**: Click project card images to view high-res visual mockups with feature highlights.
5. **Technical Skills Matrix**: 4-column breakdown of Engineering Capabilities (Frontend, Backend & APIs, Systems & Tools, Cloud & DevOps).
6. **Experience / Timeline**: Highlighted roles, contributions, and engineering milestones.
7. **Writing & Thoughts**: Technical blog post list with reading time, publication date, and description.
8. **Contact & Elsewhere**: Copy-to-clipboard email interactive button and social icons.

## Exclusions & Integrity

- **Blacklist**: Explicitly filter out non-portfolio / test repositories such as `redirect` and `gesture synth`.
- **Placeholder Rule**: All projects MUST render real high-resolution screenshot mockups stored in `/projects/`.

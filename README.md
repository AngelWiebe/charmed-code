# Charmed Code

Charmed Code is an Alberta web design and development studio. This single-page marketing site presents its services, approach, featured work, and testimonials, with a contact form for project inquiries.

The site uses React 19 and Vite 6.

## Local development

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Use `npm run build` to generate the production site in `dist/` and `npm run preview` to serve that build locally.

## Editing the site

| Path | Contents |
| --- | --- |
| `src/data.js` | Services, featured projects, and testimonials |
| `src/App.jsx` and `src/components/` | Page sections, navigation, and dialogs |
| `src/index.css` and `src/assets/` | Styles, artwork, logo, and WebP images |
| `index.html` | Page title, search and social metadata, and font links |
| `public/` | Favicon, social preview image, and robots.txt |

The contact form validates submissions in the browser and sends them to Formspree. It confirms receipt after Formspree accepts the submission and keeps the entered text if sending fails. Preview builds use the same endpoint as production, so a successful local submission can create a real inquiry.

## Deployment

Set `SITE_ORIGIN` to the public origin in the hosting provider's build environment. Use the full HTTPS origin without a path.

```sh
SITE_ORIGIN=https://your-domain.example npm run build
```

Publish `dist/` to a static host. The build writes the homepage content into `dist/index.html`, and React enables navigation and dialogs when JavaScript loads.

With `SITE_ORIGIN` set, the build emits absolute canonical, social preview, and structured data URLs, generates `sitemap.xml`, and adds its URL to `robots.txt`. Without it, builds use relative URLs and omit the sitemap.

# Shariq Saifi - SDET & Quality Engineering Portfolio

Responsive Angular portfolio for Mohammad Shariq Saifi, SDET and quality engineering professional open to opportunities across industries. Banking experience appears in the employment and work examples; the introduction focuses on transferable testing and automation skills.

The project root is `Portfolio/`; run the commands below from this folder.

## Run locally

Validated with Node.js 24.18.0. Install the locked dependencies, then start the development server:

```sh
npm ci
npm start
```

Open http://localhost:4200. To use another port, run `npm start -- --port 4300`.

## Verify and build

```sh
npm test -- --watch=false
npm run build
```

The production website is generated in `dist/Shariq_Portfolio/browser`.

## Features

- Responsive navy-and-mint design with light and dark themes; every page load starts in dark mode, with an optional light theme for the current visit.
- Mobile navigation, keyboard focus states, skip link, and reduced-motion support.
- Technology logos, filterable skills, expandable experience and work highlights.
- Interactive Quality Lab: explore UI automation, API/message validation, and CI/release checks through test design, automation, and failure investigation, with keyboard-accessible controls and expandable failure patterns.
- Direct CV download, email links, and clipboard feedback that handles failures.
- Content and social links checked against the supplied CV. Work highlights describe professional experience, without claiming public demos or repositories.

## Updating content

- `src/app/shared/data/portfolio-data.json`: personal details, work experience, work highlights, education, and certifications. The TypeScript export reads this JSON directly.
- `src/app/features/home/home.ts`: technology logo mapping and filter categories.
- `src/app/features/home/home.html`: editorial page copy and structure.
- `src/app/shared/components/quality-lab/`: interactive test-design examples, layout, and controls.
- `src/styles.css`: shared design tokens and themes.
- `public/Mohammad_Shariq_Saifi_Resume.pdf`: downloadable CV.

Logos are served locally from `public/logos`. Devicon and Simple Icons license files are included alongside the assets. Brand marks belong to their respective owners. Google Fonts supplies Inter and JetBrains Mono, with system-font fallbacks.
## AI and additional toolkit sections

The AI-assisted automation section reflects the supplied CV's GitHub Copilot and Playwright MCP experience. Education and certifications have separate sections, and the Copilot credential links to the verification URL embedded in the CV. Additional toolkit tiles live in `src/app/shared/components/extended-toolkit`; AI content lives in `src/app/shared/components/ai-expertise`. Additional logo sources are recorded in `public/logos/SOURCES.md`.
## Live GitHub contributions

The `#github` section fetches the current contribution calendar for the GitHub profile in `portfolio-data.json`. No token or rebuild is required. `GithubContributionsService` reads the public endpoint at `https://github-contributions-api.jogruber.de/v4/<username>?y=last`; the component checks on initial load, every five minutes while the tab is visible, and when returning to a tab whose last check is older than five minutes. Visitors can also refresh manually.

The third-party feed caches data for up to one hour, and GitHub can take longer to record eligible contributions. This reflects the public profile contribution graph, not an instantaneous stream of every push. See [feed documentation](https://github.com/grubersjoe/github-contributions-api) and [GitHub contribution rules](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile).

The calendar validates response data, uses UTC dates for weekday alignment, supports arrow-key exploration and horizontal scrolling on phones, and preserves the last successful response if a subsequent request fails. A failed first load shows a retry button and profile link. Unit tests cover parsing, keyboard navigation, polling cleanup, malformed responses, and refresh recovery. The integration does not expose any GitHub credentials.

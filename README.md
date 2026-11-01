# franciscodnconceicao.github.io

Personal website of **Francisco Conceição**, Software Engineer.
Live at <https://franciscodnconceicao.github.io/>.

Built with React, TypeScript, Vite and Tailwind CSS. No UI or animation libraries: Bit the
robot, the face scan, the command menu (`⌘K` / `Ctrl K`) and the icons are hand-written.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and build into dist/
npm run lint
```

## Updating content

Almost everything you read on the site lives in [`src/data/content.ts`](src/data/content.ts):
profile links, the About story, the Journey timeline, projects and skills (including where each skill was used).

To publish a new CV, replace `public/Francisco-Conceicao-CV.pdf` and keep the same file name.

## Deploying

Pushing to `main` runs [`.github/workflows/workflow-simple.yml`](.github/workflows/workflow-simple.yml),
which builds the site and deploys `dist/` to GitHub Pages.

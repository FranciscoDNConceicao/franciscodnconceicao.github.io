# franciscodnconceicao.github.io

Personal website of **Francisco Conceição**, Software Engineer.
Live at <https://franciscodnconceicao.github.io/>.

Built with React, TypeScript, Vite and Tailwind CSS, with no UI or animation libraries. Some of
the hand-written parts:

- **Bit**, a two-joint robot arm that follows the cursor using inverse kinematics
  ([`src/components/Robot.tsx`](src/components/Robot.tsx), maths in [`src/lib/bit.ts`](src/lib/bit.ts)).

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and build into dist/
npm run lint
```

## Updating content

Almost everything you read on the site lives in [`src/data/content.ts`](src/data/content.ts):
profile links, the About text, experience, projects and skills.

To publish a new CV, replace `public/Francisco-Conceicao-CV.pdf` and keep the same file name.

## Deploying

Pushing to `main` runs [`.github/workflows/workflow-simple.yml`](.github/workflows/workflow-simple.yml),
which builds the site and deploys `dist/` to GitHub Pages.

# Illustrations

We added a royalty-free placeholder image for a "team bonding" concept from Unsplash and wired it into a reusable React component.

- Source (royalty-free placeholder): https://images.unsplash.com/photo-1556761175-5973dc0f32e7
- Saved as: `assets/images/illustrations/illustration-primary.jpg`
- Component: `src/components/Illustrations/TeamBondingIllustration.tsx`
- Barrel export: `src/components/Illustrations/index.ts`

## Usage

Import and render the component wherever you need an illustration.

```tsx
import { TeamBondingIllustration } from "@/components/Illustrations";

// In your JSX
<TeamBondingIllustration
  maxWidth={680}
  alt="Team bonding illustration"
  className="my-6 shadow-md"
/>
```

Notes:
- The component is responsive by default: `max-width: 100%` and `height: auto`.
- You can pass `maxWidth` (number in px or string, e.g., "32rem") to constrain the rendered width.
- `className` passes through so you can apply your own utility classes or styles.

## Replacing the Placeholder

1. Replace the file at:
   - `assets/images/illustrations/illustration-primary.jpg`
2. Keep the same file name to avoid changing code. If you need a different path or name, update the import in:
   - `src/components/Illustrations/TeamBondingIllustration.tsx`
3. Confirm the image loads in the browser and check the console/network tab if it does not.

## Attribution

Unsplash placeholder used under the Unsplash License; attribution is appreciated but not required for placeholders. For production, replace with your own licensed asset if needed.

# MANA Yerba Maté — AI-Assisted Frontend Recreation

A portfolio project by **Ali**, recreating the public [MANA Yerba Maté website](https://en.manayerbamate.com/) with React, TypeScript, and an interactive Three.js product scene.

## Project goal

Rebuild an animation-heavy storefront rather than a static screenshot: preserve the reference's visual identity, connect its public pages, and reproduce the can's movement across the homepage.

## My role and AI-assisted process

I used AI-assisted development through Lovable to turn the reference into a working application. My contribution included setting the requirements, comparing the result with the original, identifying visual and behavioral differences, and directing successive improvements.

The iteration went beyond the initial generated page. I called out problems with can size and centering, scroll movement, the opening tab, sticky benefit cards, bubbles, and asset availability outside the original hosting environment. These observations shaped the implementation and its subsequent refinements.

AI helped generate and revise code; this project is not presented as entirely hand-written. It demonstrates my approach to using AI critically: evaluate the output, give specific feedback, and verify behavior instead of accepting the first result.

## What the application includes

- A flavor carousel with changing can textures and animated illustrations.
- A Three.js can with pointer interaction, scroll-driven transforms, an animated opening tab, and pooled bubble particles.
- A sticky rotating benefit wheel coordinated with the can in one animation loop.
- Product listings and detail pages with pack selection, quantity controls, and subscription options.
- Public information pages, including FAQ, contact, subscription, and store locations.
- Layout adjustments for smaller screens and reduced-motion handling.

## Engineering choices

| Area | Approach |
| --- | --- |
| Application | React 19, TypeScript, TanStack Start and TanStack Router |
| Styling | Tailwind CSS 4, semantic design tokens, reusable UI controls |
| Product scene | Three.js, GLTF model, AnimationMixer, environment lighting |
| Artwork | Original Lottie animations and MANA media |
| Motion | Delta-time updates and exponential damping; one scroll choreography loop |
| Loading | Early homepage resource hints, on-demand flavor textures, offscreen animation deferral |
| Verification | Vitest routing checks and browser-based interaction/visual checks |

## Challenges and learning

**Recreating motion:** matching a reference involves timing, pivots, screen-space position, and transitions between sections—not simply adding rotation to a model.

**Coordinating 3D and page content:** the can and benefit wheel share scroll progress, so their movement stays connected while each is rendered differently.

**First-load priorities:** the visible flavor and product model should take priority over animations below the fold and unused flavor textures.

**Responsible scope:** recreating public pages does not provide access to a store's private accounts, orders, or payment setup.

## Run locally

Install [Bun](https://bun.sh/) and a supported Node.js runtime, then run:

```sh
bun install
bun run dev
```

Other commands:

```sh
bun run test
bun run build
bun run preview
```

## Scope and attribution

This is an independent educational/portfolio recreation, not the official MANA store. The brand, product designs, photos, illustrations, and reference content belong to their respective owners. AI assistance does not imply authorship of those assets.

Cart, checkout, and account completion remain linked to the original store. There is no independent payment processing or private account migration. Some animation and layout details still differ from the reference; this is not a claim of a pixel-perfect replica.

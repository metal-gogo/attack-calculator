# Hapi’s Pathfinder 1e Attack Calculator

A responsive React + TypeScript + Tailwind application. Combat settings persist in browser local storage; no account or backend is required.

## Development

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

```sh
npm test       # calculation unit tests
npm run build # strict TypeScript check and production bundle
```

Character and weapon data, combat state, and pure calculations are in `src/calculator.ts`. The React interface is in `src/main.tsx`.

## Rules and assumptions

- Initial toggles are Greater Bloodrage, Raging Vitality, Reckless Abandon, and Power Attack. Armor and shield were not specified and start at zero; enter actual defenses.
- Charge’s +2 applies only to the displayed single charge attack. Full attacks and AoOs exclude it. Furious Focus waives Power Attack on the first qualifying two-handed attack, including only the first attack when Haste is active.
- Outflank requires a qualifying ally; Greater Outflank changes positioning eligibility, not the numerical bonus. Paired Opportunists requires adjacency and a qualifying AoO. The displayed AoO count is the per-round Combat Reflexes limit, not automatically granted attacks.
- Sun Blade uses Heavy Blades training and is wielded in two hands. Confirm proficiency, enhancement, target eligibility, and undead critical stacking with the GM. Undead criticals default to combined ×4; a visible GM option selects sequential ×6. Raging Brutality is added once and never multiplied.
- Warrior Spirit offers enhancement only, with the +2 Heavy Blades budget and +5 enhancement ceiling. Track its activation, duration, and daily uses at the table.
- Requested Freebooter’s Bond +3 and light-dagger Power Attack +12 are explicit user-specified overrides requiring GM confirmation. Standard Power Attack does not add damage to light weapons. Freebooter’s Bane assumes a valid designated foe.
- Damage expressions precede DR and incorporeal reduction; the interface states the applicable reduction rather than attempting to subtract a constant from an unrolled dice expression. Bypass is a manual GM confirmation. Disruption DC 14 is shown for qualifying undead.
- Other AC bonuses do not automatically transfer to CMD: enter applicable other CMD bonuses separately. Temporary penalties and Haste dodge are included.

No live combat resources, spell durations, attack rolls, critical confirmations, or ally positioning are tracked automatically.

## Publish with GitHub Actions

In GitHub, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. Push to `main`, or run **Deploy calculator to GitHub Pages** manually from the Actions tab.

The workflow installs locked dependencies, runs unit tests, builds with the Pages-provided base path (supporting both project URLs and custom domains), and deploys `dist` using GitHub's official Pages actions. Deployment uses the workflow's temporary token; no personal access token or repository secret is required.

Default project URL: https://metal-gogo.github.io/attack-calculator/

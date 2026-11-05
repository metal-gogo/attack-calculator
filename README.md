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

- Initial combat effects are Greater Bloodrage, Reckless Abandon, and Power Attack. Raging Vitality automatically accompanies Bloodrage. Supplied defensive equipment is preconfigured.
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

## Integrated defenses

Permanent character data and equipment are in `src/character.ts`; pure defensive calculations are in `src/defense.ts`. Attack and Defense share the same persisted combat state and ability scores.

Base HP is **251** (corrected): Greater Bloodrage always includes Raging Vitality and yields **331 HP**. The feat has no separate toggle. Damage taken is preserved when maximum HP changes; Constitution-derived HP is never treated as temporary HP. Temporary HP is separately tracked and consumed first by the damage button. Nonlethal damage, stabilization, and fatigue duration remain table-managed.

Normal AC is derived from the supplied equipment: full plate +11, Armor Specialization +2, maximum DEX +4, natural armor +3, deflection +5, and shield +3 when equipped and a hand is free. Base AC is **35 without shield / 38 with shield**; base touch AC is **19**. Uncanny Dodge retains DEX when flat-footed. Two-handed flail and two-handed Sun Blade suppress the shield; the dagger and one-handed Sun Blade permit it. Overrides remain available. CMD includes applicable components, not armor, shield or natural armor. Armor maximum DEX limits AC/touch AC, not Reflex or CMD.

Uncanny Dodge retains DEX/dodge when flat-footed; unconsciousness overrides it and treats DEX as zero. Raging Vitality sustains active Bloodrage while unconscious. Raging Vitality is always active during Bloodrage, including when unconscious; it does not permit actions. Improved Uncanny Dodge provides conditional anti-flanking protection, not a numerical AC bonus. Blood Sanctuary adds +2 only in a qualifying allied/self spell context. Heroism’s +2 morale Will does not stack with Bloodrage’s +3.

Personal DR defaults to Bloodrager 11’s DR 2/— with configurable value/bypass. Resistances and immunities require source-labeled manual confirmation because retained Primalist bloodline powers and equipment were not supplied. No blanket undead immunities are assumed. Greater Ring of Inner Fortitude provides a per-event ability-damage/drain/penalty preview, not a save bonus; select the affected ability and resolve associated beneficial effects (including Enlarge Person) at the table.

The interface uses larger responsive text, high-contrast cool colors, visible keyboard focus, a skip link, native labeled controls, and text labels alongside active-state colors.


## Equipment records and confirmation

The user confirmed STR 28, DEX 20, CON 26, and WIS 18 **already include** the Belt of Physical Perfection +6 and Headband of Inspired Wisdom +4. Their bonuses are not added again. Base HP 251 includes the baseline Constitution modifier. Additional Seraphel CON and a consumed Manual’s inherent STR are off by default and require confirmation that they are absent from the supplied totals; these are not assumed active worn effects.

Winged Boots have 3 daily uses and a manual active-flight marker (up to 5 minutes/use). Lesser Goggles of True Seeing have 1 recorded use/day; Talisman of Life’s Breath has 2 recorded uses/charges with exact item rules unverified. Counters persist and combat Reset preserves them. Restore uses manually only when the actual item permits. Talisman use never automatically heals or prevents death. Mythallar Token’s recorded skill bonuses do not modify defenses. Leaf Green Faith Bond’s recorded sleep immunity is included while equipped; other properties remain unverified. Darkvision while Bloodraging is displayed without inventing a range or source.

Mithral full plate counts as medium for movement and certain restrictions, but still requires heavy-armor proficiency under Pathfinder rules (which Fighter grants). The supplied maximum DEX +4 and armor check penalty −2 are recorded as given; verify armor training and equipment sources rather than adding those bonuses again. Greater Ring of Inner Fortitude reduces ability damage/drain, never ordinary HP damage. Ring interactions with a beneficial effect’s ability penalty remain flagged for GM adjudication.


## Table damage rule

Multiplied damage uses a single weapon damage roll multiplied by the applicable multiplier, e.g. `(1d10 +41) ×2`, rather than additional critical dice. This applies to criticals and Sun Blade undead doubling, including the selected critical stacking ruling. Raging Brutality remains outside the multiplier: `(1d10 +41) ×2 +18`. Enlarge Person still changes the base weapon dice (e.g. `2d8`) before multiplication. The same expressions appear in the copied summary.

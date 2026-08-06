---
metadata:
  name: fanni-creative
  description: "Fanni creates beautiful browser games, interactive tools, and 3D presentations using the gauntlet-loop quality standard"
  loaded: true
  placement: system
  when:
    tags:
      - onscreen
---

# Fanni Creative — Games, Tools, and 3D Presentations

Fanni can build polished, interactive browser experiences: games, data tools, 3D visualizations, and animated presentations. Every creative build uses the **gauntlet-loop** quality standard — a real reference bar, a builder, a harsh critic, and a loop that stops only when the output beats the bar blind.

## When to use this capability

Trigger this when the user asks for:
- A browser game ("make a puzzle game", "build a simple shooter", "create an arcade game")
- A 3D presentation ("3D product demo", "interactive data globe", "animated scene")
- An interactive tool ("visualizer", "calculator with animation", "dashboard that feels alive")
- Anything where "beautiful", "polished", "alive", or "production quality" is the bar

## How Fanni runs a creative build

1. **Restate the goal.** One sentence, internally.
2. **Propose a bar.** Offer 2–3 named, fetchable references — real shipped games, live 3D demos, named product pages. The bar must be specific and comparable, not a category.
3. **Wait for the user's pick.**
4. **Write the gauntlet prompt.** Use the template below, adapted for the medium.
5. **Offer to run it:** "I can run this here."

## Quality bars by medium

### Browser games
| Goal | Bar that works |
|---|---|
| Puzzle / logic | A named browser puzzle (e.g. a specific itch.io game, Mini Metro) |
| Platformer / arcade | A specific named game at the same scale |
| Physics sandbox | A named demo with real physics feel |
| Visual / generative | A named generative art piece (e.g. a specific p5.js work) |

### 3D presentations
| Goal | Bar that works |
|---|---|
| Product reveal | Apple's iPhone product page at the same scroll experience |
| Data globe / geo viz | Specific named Three.js or Mapbox demo |
| Animated portfolio | Bruno Simon's three.js journey portfolio — fetchable, specific |
| Interactive explainer | A specific Stripe or Linear animated feature page |

### Interactive tools
| Goal | Bar that works |
|---|---|
| Data visualizer | A specific Observable notebook or D3 demo |
| Calculator / configurator | A named best-in-class tool in the same domain |
| Dashboard | A specific public Grafana or Retool example |

## Gauntlet prompt template for creative builds

```
Build [GOAL] as a self-contained browser experience.

The bar is [NAMED REFERENCE]. Get the real thing first — screenshot it, interact with it, note what makes it feel alive. Compare against that directly, not against a description.

Break this into the smallest pieces that can be improved and judged independently — [e.g. for a game: mechanics, feel, visuals, audio cues, polish; for 3D: geometry, lighting, animation, interaction, performance]. For each piece, fan out a builder and a separate harsh critic with fresh context. The critic opens both ours and the bar side by side with labels stripped, picks which is better, and names the single biggest remaining gap. Then it goes back to the builder.

The critic is a harsh critic. Praise is not useful. If ours does not win, it keeps going.

/loop on each piece until the critic picks ours blind. Do not stop before that.

Keep a live preview updating as the work evolves so I can watch it.

Fan out subagents and ultracode.
```

## Rules for the bar

- **Named.** "Bruno Simon's portfolio" works. "Beautiful 3D sites" does not.
- **Fetchable.** The critic can open it in a browser, screenshot it, or run it. If it requires login or payment, pick another bar.
- **Comparable.** Both can sit side by side and a judge can pick one.

If the user's goal has a measurable half (frame rate, load time, score, level count), name it alongside the reference. Taste plus a number beats taste alone.

## Technology defaults

Unless the user specifies otherwise:
- **3D:** Three.js (no CDN — inline or bundle; artifacts are self-contained)
- **Games:** Phaser 3 for 2D; Three.js or Babylon.js for 3D
- **Animation:** GSAP (inline), or CSS animations for lighter work
- **Data viz:** D3 or Observable Plot inlined
- **No external fetches at runtime** — all assets must be embedded or generated inline (CSP constraint on Artifact pages)

## Output format

All creative builds must be deliverable as a single self-contained HTML file that runs in the browser with no server. Fanni publishes finished results as Artifacts.

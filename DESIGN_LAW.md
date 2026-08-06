# Fanni Design Law

Fanni serves nontechnical people first. Every interface must reduce cognitive load, show the next action, and make consequences visible before execution.

## The five laws

1. **One screen, one job.** A view has one primary outcome and one visually dominant action.
2. **Plain language before platform language.** Say “Connect your work email,” not “Initialize Gmail OAuth.” Say “Fanni needs permission,” not “Auth config missing.”
3. **State stays visible.** Always show: what Fanni is doing, whose workspace she is using, which app/account is selected, whether approval is needed, and what happens next.
4. **Motion explains change.** Motion begins immediately, stays interruptible, and reveals cause-and-effect. Decorative motion is removed. Reduced motion is fully supported.
5. **No irreversible surprise.** External writes, messages, publishing, deletion, spending, and account changes require a preview, named account, approval, checkpoint, and visible return point.

## Focus-first interaction rules

- Lead with the next action.
- Number workflows with no more than five visible steps at once.
- Break long setup into one bounded decision per screen.
- Show completed steps and current progress.
- Keep advanced configuration behind “More options.”
- Use concrete labels: “Connected,” “Needs permission,” “Waiting for approval,” “Done,” “Could not finish.”
- Errors state location, cause, and the single recovery action.
- Do not require users to remember information from a previous screen.
- Do not use unexplained acronyms, provider IDs, model names, or raw JSON in the primary interface.

## App connection metaphor

Fanni is an octopus: each connected app is an **arm**. The metaphor is explanatory, not decorative.

Each arm shows:

- App name and recognizable icon
- Connected client and account alias
- What Fanni may read
- What Fanni may change
- Current health
- Last action
- A plain-language disconnect control

Never display another client’s arms in the current workspace.

## Motion standard

- Respond on press, not after release.
- Enter animations use ease-out or spring motion; exits are faster than entrances.
- Keep most transitions between 120–280ms.
- Preserve spatial continuity when opening panels or changing status.
- Avoid animating every card, looping decorative effects, or delaying work for choreography.
- Honor `prefers-reduced-motion`.

## Release gate

A Fanni UI change fails review when a nontechnical user cannot answer these within five seconds:

1. Where am I?
2. What can I do here?
3. What will Fanni do?
4. Which client/account will she use?
5. Can I stop or undo it?

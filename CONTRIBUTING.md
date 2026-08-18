# Contributing to Iron Realms

Thank you for taking a look at Iron Realms. This document explains how to propose changes without breaking the existing prototype.

## Project principles

- Read the existing code before changing it.
- Do not create duplicate systems when an existing catalog, renderer, or rule already owns the behavior.
- Keep game state, game rules, rendering, and language text conceptually separate.
- Keep changes small and testable.
- Do not treat a roadmap item as implemented until the runtime behavior exists and has been checked.
- Preserve existing saves whenever possible.

## Before opening an issue

Search the repository first. Check:

- `README.md` for the current project shape and "Where to change" guide.
- `docs/GAME_FLOW_MAP.md` for the current runtime flow.
- `docs/QA_AUDIT.md` for known risks.
- `docs/PROGRESS.txt` for the working status.
- `docs/ROADMAP.md` for planned work.

## Good bug report

Use this format:

```text
Title: [Bug] Short description

Language: PT-BR or ES-ES
Browser and version:
Screen or feature:

What happened:

What should happen:

Steps to reproduce:
1.
2.
3.

Expected state:

Actual state:

Relevant file or function, if known:

Screenshot or console error:
```

Include the browser language, selected tab, selected map tile, and whether the problem survives a reload. Do not attach private save data unless it is safe to share.

## Good feature request

Use this format:

```text
Title: [Feature] Short description

Player problem:

Proposed experience:

What already exists that should be reused:

Files likely involved:

State changes required:

How success should be tested:

Out of scope:
```

A good feature request describes the player's need and the expected behavior. It does not require contributors to invent a second implementation beside the existing one.

## Localization contributions

The project currently supports:

- `lang/pt-br.js`
- `lang/es-es.js`

Add or update the same key in both dictionaries. Keep game rules and data in `src/game-data.js`, `src/game-state.js`, `src/game-render.js`, or `src/game-actions.js` as appropriate; language files should contain player-facing text only. If a message already exists in saved logs or reports, update the presentation localization in `src/i18n.js` rather than rewriting the save.

## Asset contributions

Use semantic filenames in `assets/`:

- `resource-*.png` for resource icons;
- `location-*.jpg` for castles, villages, and ruins;
- `terrain-*.jpg` for terrain artwork;
- `world-map.jpg` for the main map;
- `closednotf.png` and `notf.png` for notification states.

Check the image dimensions and its crop in the browser. Update `worldArtworkCatalog` or the relevant CSS variable when an asset is replaced.

## Validation checklist

Before submitting a change:

- Open the game through the local server.
- Test both `PT-BR` and `ES-ES` if visible text changed.
- Test the affected action and one neighboring action.
- Reload the page and check persistence.
- Check desktop and a narrow viewport.
- Confirm there are no console errors.
- Do not include generated local saves or personal browser data.

## Local run

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Pull requests

Use a clear title such as:

- `fix: prevent duplicate event resolution`
- `feat: add Spanish translation for market panel`
- `ui: improve notification letter layout`
- `test: cover save migration for inventory`

In the description, explain:

- the user problem;
- the files changed;
- the behavior before and after;
- how it was tested;
- any known limitation or follow-up.

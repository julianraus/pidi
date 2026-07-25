# Kepang AI - Video Pitch Deck Builder

Generates `submission_attachments/Kepang AI - Video Pitch Deck.pptx` — 13 slides
matching `docs/VIDEO_SCRIPT_AND_APP_EXPLAINER_3RD.md` exactly (4 real video
overlay cards + 7 screen-record storyboard cues + 1 section divider + 1
pre-recording checklist). Each slide's speaker notes carry the verbatim
narration + timing + on-screen action from the script.

## Regenerate

```bash
cd tools/pptx_deck
npm install
node gen_icons.js    # renders Feather icons (react-icons) to PNG
node build_deck.js   # builds the .pptx, writes it into this folder
```

Then copy the output `.pptx` into `submission_attachments/`.

## Edit content

Edit the slide-build functions in `build_deck.js` (one function per slide,
named `slideNN()`). Keep it in sync with
`docs/VIDEO_SCRIPT_AND_APP_EXPLAINER_3RD.md` if the script changes.

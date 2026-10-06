# CDSC components

Reusable pieces made for the lab's (CDSC / PANDA) studies. They are used by the
lab's default pages in `src/builtins/cdsc_default/` and can be used by a
study's own views.

- `AutoplayAudio.vue`: a sound clip that plays by itself, with a Play or
  Replay button if the browser will not start or load it. It can report how
  far the clip has played, to show things as the voice gets to them.
- `AutoplayVideo.vue`: a video that plays by itself with no controls, with the
  same Play / Replay fallbacks.
- `HotSpots.vue`: picture choices for children, with a generous click area
  around each picture.
- `SignatureBox.vue`: a box to sign in with the mouse, a finger or a pen.
- `ConsentSlide.vue`, `ConsentSections.vue`: the frame and the six
  information slides of the lab's consent.
- `ConsentText.vue`: the same consent as one page of text, for the "View
  consent" button in the top bar.

The two page frames, `ChildStage.vue` (as tall as the visible page, no
scrolling) and `ScaleToFit.vue` (scales a page like a slide to fit), are with
Smile's layouts in `src/uikit/layouts/`.

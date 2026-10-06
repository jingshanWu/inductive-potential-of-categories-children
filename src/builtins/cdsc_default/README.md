# CDSC default views

The lab's (CDSC / PANDA, the Princeton And NYU Discoveries in Action Lab)
standard pages, for every study of the lab to use as they are. They sit next
to Smile's own default views in `src/builtins/`; Smile's originals are not
changed. Following Smile's structure, the rest is where Smile keeps the same
kind of thing:

- reusable components (players, picture choices, signature box, consent
  slides): `src/uikit/components/cdsc/`
- page frames (`CdscBox.vue`: the constant-size box the parent pages sit in,
  buttons in its footer; `ChildStage.vue`, `ScaleToFit.vue`): `src/uikit/layouts/`
- pictures and sounds: `src/assets/cdsc_default/` (the file names below are
  in that folder)
- the study-specific consent wording: the study's
  `src/user/components/consentStudyInfo.js`

The views, in the order a study uses them:

- `WelcomeView.vue`: the first page for parents ("Thanks for joining us!":
  sound on, full screen, scroll the webcam image out of view), with the
  "I'm ready!" button. Used in place of Smile's
  `advertisement/AdvertisementView.vue`.
- `SoundCheckView.vue`: the sound check for parents. A bird sound plays and
  the parent picks the animal they heard from 5 pictures; they cannot go on
  until they get it right. Files: `sound_check.m4a`, `soundcheck_*.png`.
- `IntroVideoView.vue`: the lab's welcome page for parents, rebuilt in code
  from the lab's intro video: the researcher's photo, the lab's name in
  colour, the PANDA letters with the mascot, and the closing line, with the
  video's narration (18 s) played as sound. Its Continue button becomes
  clickable when the narration ends. Goes right before the consent pages.
  Files: `panda_intro.m4a`, `panda_intro_photo.jpg`,
  `panda_wordmark_mascot.png`.
- `ParentConsentView.vue`: the lab's consent slides (version of 2024-12-17),
  one per page with Back / Next: About the Study, Contact Info, What Will My
  Child Do?, Participation, Use of Data, Risks & Benefits, then the
  permission slide with the lab's narration for parents and a box to sign
  in. Files: the `consent/` folder (the slides' pictures and both
  narrations).
- `ChildConsentView.vue`: the child's own yes / no ("Would you like to do
  this online activity with us?"), with the lab's narration for kids. A "no"
  ends the study.
- `MouseInstructionsView.vue`: the hand-over to the child. First the lab's
  "mouse click info" page for the parent (logo, text and mascot drawn by the
  page, the lab's narration played as sound, a Start button that becomes
  clickable when the narration ends and then wiggles), then the "LET'S GET
  STARTED!" page (the words drawn by the page, the lab's voice as sound).
  Files: `panda_mouse_info.m4a`, `panda_get_started.m4a`.
- `PreParentView.vue`: the last page of the child's part ("GREAT job! Now,
  we have just a few questions for parents. Then, you'll upload your video
  and be all done!"), drawn by the page with the lab's narration as sound and
  a Continue button that becomes clickable when the narration ends. Files:
  `panda_pre_parent.m4a`, `panda_webcam.png`.
- `ParentFormView.vue`: the form for parents after the child's part (video
  privacy settings with a signature, language spoken at home, parent's
  education, problems with the task). The one page that scrolls; it says so
  at the top. Give its view meta: { setDone: true }.
- `EndView.vue`: the last page. It saves the study's data behind a progress
  bar, as Smile's thanks page does, then shows the lab's closing message in
  step with the lab's narration: "HANG ON!", the reminder to upload the
  session video, "STOP", "UPLOAD", then "THANK YOU FOR PARTICIPATING". Used
  in place of Smile's `thanks/ThanksView.vue`. Files: `panda_end.m4a`,
  `panda_webcam.png`, `panda_wordmark.png`.

<script setup>
// Task intro for the child: one line of text, read aloud by the study's
// voice (the adult Qualtrics study used a video here; its narration is
// TASK_INTRO.adult in stimuli.js). The clip plays automatically and the study
// moves to the next view by itself when it ends.
//
// The sound and its Play / Replay fallbacks live in AutoplayAudio.vue. There
// is no way to continue without hearing the clip to the end.
import { onBeforeUnmount } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from './AutoplayAudio.vue'
import { TASK_INTRO, stimulusUrl } from './stimuli'

// which wording is shown and read: 'child' or 'adult'
const INTRO = TASK_INTRO.child

// pause after the clip before moving on
const END_GAP_MS = 500

const api = useViewAPI()
let endTimer = null

function finish(completed) {
  clearTimeout(endTimer)
  api.recordPageData({ audio: INTRO.audio, completed })
  api.goNextView()
}

function onAudioEnded() {
  endTimer = setTimeout(() => finish(true), END_GAP_MS)
}

onBeforeUnmount(() => clearTimeout(endTimer))

api.setAutofill(() => finish(false))
</script>

<template>
  <div class="flex flex-col items-center w-full h-[90vh] p-4 text-center">
    <AutoplayAudio :src="stimulusUrl(INTRO.audio)" @ended="onAudioEnded()" />
    <div class="flex flex-1 items-center justify-center w-[85%]">
      <p class="text-3xl font-medium">{{ INTRO.text }}</p>
    </div>
  </div>
</template>

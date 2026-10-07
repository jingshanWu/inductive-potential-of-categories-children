<script setup>
// Task intro for the child: one line of text, read aloud by the study's
// voice (the adult Qualtrics study used a video here; its narration is
// TASK_INTRO.adult in stimuli.js). The clip plays automatically and the study
// moves to the next view by itself when it ends.
//
// The sound and its Play / Replay fallbacks live in AutoplayAudio.vue. There
// is no way to continue without hearing the clip to the end.
import { onBeforeUnmount, onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import { TASK_INTRO, inductionAssetUrls, stimulusUrl } from './stimuli'

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

// fetch the test's clips and pictures now, while the intro and the training
// videos play, so that no test clip has to wait for the network (see
// inductionAssetUrls in stimuli.js)
onMounted(() => {
  for (const url of inductionAssetUrls()) fetch(url).catch(() => {})
})

api.setAutofill(() => finish(false))
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="stimulusUrl(INTRO.audio)" @ended="onAudioEnded()" />
    <div class="flex flex-1 items-center justify-center w-[85%]">
      <p class="text-3xl font-medium">{{ INTRO.text }}</p>
    </div>
  </ChildStage>
</template>

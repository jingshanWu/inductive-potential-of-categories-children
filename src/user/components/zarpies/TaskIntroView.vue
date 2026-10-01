<script setup>
// Task intro video for the child (same video as the adult Qualtrics study).
// It plays automatically, cannot be paused or rewatched, and the study moves
// to the next view by itself when the video ends.
//
// The player and its Play / Replay fallbacks live in AutoplayVideo.vue. There
// is no way to continue without watching the video to the end.
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayVideo from './AutoplayVideo.vue'
import { TASK_INTRO_VIDEO, stimulusUrl } from './stimuli'

const api = useViewAPI()

function finish(completed) {
  api.recordPageData({ video: TASK_INTRO_VIDEO, completed })
  api.goNextView()
}

api.setAutofill(() => finish(false))
</script>

<template>
  <div class="w-full h-[90vh] p-4">
    <AutoplayVideo :src="stimulusUrl(TASK_INTRO_VIDEO)" @ended="finish(true)" />
  </div>
</template>

<script setup>
// Task intro video for the child (same video as the adult Qualtrics study).
// It plays automatically, cannot be paused or rewatched, and the study moves
// to the next view by itself when the video ends.
//
// Browsers can refuse to start a video with sound if nobody has clicked on the
// page yet (e.g. after a reload); in that case a big Play button is shown.
// If the video fails to load, a Replay button is shown. There is no way to
// continue without watching the video to the end.
import { onMounted, ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { TASK_INTRO_VIDEO, stimulusUrl } from './stimuli'

const api = useViewAPI()

const video = ref(null)
const blocked = ref(false) // browser refused to autoplay
const failed = ref(false) // video file could not be loaded

function play() {
  blocked.value = false
  video.value.play().catch(() => {
    blocked.value = true
  })
}

onMounted(play)

// reload the video file and try again from the beginning
function replay() {
  failed.value = false
  video.value.load()
  play()
}

function finish(completed) {
  api.recordPageData({ video: TASK_INTRO_VIDEO, completed })
  api.goNextView()
}

api.setAutofill(() => finish(false))
</script>

<template>
  <div class="relative flex items-center justify-center w-full h-[90vh] p-4">
    <video
      ref="video"
      class="max-w-full max-h-full"
      :src="stimulusUrl(TASK_INTRO_VIDEO)"
      preload="auto"
      playsinline
      disablepictureinpicture
      @contextmenu.prevent
      @ended="finish(true)"
      @error="failed = true"
    ></video>

    <!-- autoplay was blocked: one click starts the video -->
    <div v-if="blocked && !failed" class="absolute inset-0 flex items-center justify-center">
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="taskintro-play" @click="play()">
        <i-fa6-solid-play class="mr-2" /> Play
      </Button>
    </div>

    <!-- video could not be loaded: try again (the child cannot continue without watching it) -->
    <div v-if="failed" class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <p class="text-lg mb-6">Sorry, the video could not be played.</p>
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="taskintro-replay" @click="replay()">
        <i-fa6-solid-rotate-right class="mr-2" /> Replay
      </Button>
      <p class="text-lg mt-6">If this keeps happening, please exit the session and contact us for assistance.</p>
    </div>
  </div>
</template>

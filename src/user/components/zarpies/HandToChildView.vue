<script setup>
// Hand-over page, shown to the parent after the window size page. In order:
//   1. info: the lab's standard PANDA video for the parent (let your child do
//      the clicking, give no feedback). When it ends, the parent is asked to
//      get their child in front of the screen and help them click Start.
//   2. started: the PANDA "Let's get started!" video, then the next view (the
//      spoken task intro) by itself.
// The Start click is also what lets the browser play the child's audio and
// videos with sound.
//
// The videos are PANDA_VIDEOS in stimuli.js; the player and its Play / Replay
// fallbacks live in AutoplayVideo.vue.
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
import AutoplayVideo from './AutoplayVideo.vue'
import ChildStage from './ChildStage.vue'
import { PANDA_VIDEOS, stimulusUrl } from './stimuli'

const api = useViewAPI()

const screen = ref('info') // 'info' -> (Start) -> 'started' -> next view
const infoWatched = ref(false)

function start() {
  screen.value = 'started'
}

function finish() {
  api.goNextView()
}

api.setAutofill(finish)
</script>

<template>
  <!-- 1. info for the parent -->
  <ConstrainedTaskWindow
    v-if="screen === 'info'"
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <div class="text-center w-[90%]">
      <h1 class="text-2xl font-bold mb-4">Great! We are now ready for your child to join us!</h1>
      <p class="text-lg mb-4">
        Please have your child sit in front of the computer, and make sure they are looking at the screen and can hear
        the sound.
      </p>
      <!-- replaced 2026-10-02 by the lab's standard PANDA wording below
      <p class="text-lg mb-4">
        Please let your child make all the choices on their own. There are no right or wrong answers, so please do not
        help or give hints.
      </p>
      -->
      <!-- replaced 2026-10-06 by the lab's PANDA video of the same page (the "mouse click info" page, same words)
      <p class="text-lg mb-4">
        For this activity, we are interested in what your child thinks on their own! If your child knows how to use a
        mouse to click on the computer, please allow them to do the clicking. If your child is unfamiliar with using a
        mouse, they can point to the screen to show their response, and you can do the clicking for them.
      </p>
      <p class="text-lg mb-4">
        We ask that you do not provide your child with any feedback, until after the study is complete. Thank you!
      </p>
      -->
      <div class="w-full h-[45vh] min-h-[260px] mb-4">
        <AutoplayVideo :src="stimulusUrl(PANDA_VIDEOS.mouseInfo)" @ended="infoWatched = true" />
      </div>
      <!-- the Start button comes once the video has been watched -->
      <template v-if="infoWatched">
        <p class="text-lg mb-6">
          Once your child is in position, please help them click the Start button below. The activity will then start
          for your child automatically.
        </p>
        <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="handtochild-start" @click="start()">
          Start
        </Button>
      </template>
    </div>
  </ConstrainedTaskWindow>

  <!-- 2. "Let's get started!" -->
  <ChildStage v-else class="p-4">
    <AutoplayVideo :src="stimulusUrl(PANDA_VIDEOS.getStarted)" @ended="finish()" />
  </ChildStage>
</template>

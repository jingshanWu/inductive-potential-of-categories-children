<script setup>
// Hand-over page, shown to the parent after the window size page. In order:
//   1. info: the lab's standard PANDA "mouse click info" page for the parent
//      (let your child do the clicking, give no feedback), rebuilt here from
//      the lab's video of it: the logo, the text and the mascot are drawn by
//      this page, and the video's narration is played as sound. The Start
//      button is gray until the narration has finished.
//   2. started: the PANDA "Let's get started!" video, then the next view (the
//      spoken task intro) by itself.
// The Start click is also what lets the browser play the child's audio and
// videos with sound.
//
// The text, pictures and sound are PANDA_MOUSE_INFO and PANDA_VIDEOS in
// stimuli.js; the players and their Play / Replay fallbacks live in
// AutoplayAudio.vue and AutoplayVideo.vue.
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
import AutoplayAudio from './AutoplayAudio.vue'
import AutoplayVideo from './AutoplayVideo.vue'
import ChildStage from './ChildStage.vue'
import { PANDA_MOUSE_INFO, PANDA_VIDEOS, stimulusUrl } from './stimuli'

const api = useViewAPI()

const screen = ref('info') // 'info' -> (Start) -> 'started' -> next view
const infoHeard = ref(false) // the narration has played to the end

function start() {
  if (!infoHeard.value) return
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
      <AutoplayAudio :src="infoHeard ? null : stimulusUrl(PANDA_MOUSE_INFO.audio)" @ended="infoHeard = true" />

      <img
        :src="stimulusUrl(PANDA_MOUSE_INFO.logo)"
        alt="Welcome to PANDA, the Princeton and NYU Discoveries in Action Lab"
        draggable="false"
        class="mx-auto h-[130px] mb-4 select-none"
      />

      <!-- the lab's standard PANDA text (the "mouse click info" page), word for word -->
      <div class="mx-auto max-w-[760px] border border-dotted border-muted-foreground p-3 text-left">
        <p
          v-for="(paragraph, i) in PANDA_MOUSE_INFO.paragraphs"
          :key="i"
          class="text-lg font-semibold text-justify"
          :class="{ 'mt-5': i > 0 }"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- replaced 2026-10-06 by the PANDA page above
      <h1 class="text-2xl font-bold mb-4">Great! We are now ready for your child to join us!</h1>
      -->
      <!-- replaced 2026-10-02 by the lab's standard PANDA wording
      <p class="text-lg mb-4">
        Please let your child make all the choices on their own. There are no right or wrong answers, so please do not
        help or give hints.
      </p>
      -->

      <div class="mx-auto max-w-[760px] mt-4 flex items-center gap-4 text-left">
        <img
          :src="stimulusUrl(PANDA_MOUSE_INFO.mascot)"
          alt=""
          draggable="false"
          class="h-[90px] shrink-0 select-none"
        />
        <p class="text-lg">
          Please have your child sit in front of the computer, and make sure they are looking at the screen and can hear
          the sound. Once your child is in position, please help them click the Start button below. The activity will
          then start for your child automatically.
        </p>
      </div>

      <!-- gray until the narration has finished, then solid and clickable -->
      <Button
        :variant="infoHeard ? 'default' : 'secondary'"
        size="lg"
        class="text-2xl px-12 py-8 mt-5"
        :class="{ 'cursor-not-allowed text-muted-foreground': !infoHeard }"
        id="handtochild-start"
        :disabled="!infoHeard"
        @click="start()"
      >
        Start
      </Button>
    </div>
  </ConstrainedTaskWindow>

  <!-- 2. "Let's get started!" -->
  <ChildStage v-else class="p-4">
    <AutoplayVideo :src="stimulusUrl(PANDA_VIDEOS.getStarted)" @ended="finish()" />
  </ChildStage>
</template>

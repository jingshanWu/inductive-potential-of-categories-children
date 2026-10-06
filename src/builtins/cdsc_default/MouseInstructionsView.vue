<script setup>
// CDSC default mouse instructions for the parent (the lab's standard PANDA
// "mouse click info" page, Set Up/5-Mouse Instructions), shown right before
// the child's part of a study. In order:
//   1. info: let your child do the clicking, give no feedback. The page is
//      rebuilt in code from the lab's video of it so it can be edited: it
//      draws the "WELCOME to panda" logo, the text and the mascot, and plays
//      the video's narration (27 s) as sound. The Start button is gray until
//      the narration has finished, then solid and clickable; it then wiggles
//      now and again, like the welcome page's button, until it is clicked.
//   2. started: the lab's "LET'S GET STARTED!" page, also rebuilt: the words
//      are drawn by the page and the voice from the lab's video (3 s) is
//      played as sound, then the next view by itself.
// The Start click is also what lets the browser play the child's audio and
// videos with sound, so the child's part should come right after this view.
//
// Both steps fit the window, whatever its size, and cannot be scrolled
// (ChildStage.vue; the info page is scaled like a slide, ScaleToFit.vue).
// The sound and its Play / Replay fallbacks live in AutoplayAudio.vue.
import { onBeforeUnmount, ref } from 'vue'
import { animate } from 'motion'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import CdscBox from '@/uikit/layouts/CdscBox.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import narration from '@/assets/cdsc_default/panda_mouse_info.m4a'
import getStartedVoice from '@/assets/cdsc_default/panda_get_started.m4a'
import logo from '@/assets/cdsc_default/panda_logo.png'
import mascot from '@/assets/cdsc_default/panda_mascot.png'

// the lab's standard text, word for word (the narration reads it)
const PARAGRAPHS = [
  'For this activity, we are interested in what your child thinks on their own! If your child knows how to use a mouse to click on the computer, please allow them to do the clicking. If your child is unfamiliar with using a mouse, they can point to the screen to show their response, and you can do the clicking for them.',
  'We ask that you do not provide your child with any feedback, until after the study is complete. Thank you!',
]

// the red of the lab's "LET'S GET STARTED!" slide
const GET_STARTED_RED = '#e53142'

const api = useViewAPI()

const screen = ref('info') // 'info' -> (Start) -> 'started' -> next view
const infoHeard = ref(false) // the narration has played to the end
const startButton = ref(null)
let wiggleTimer = null

// the narration is over: the Start button becomes clickable and starts wiggling
function onInfoHeard() {
  infoHeard.value = true
  wiggleTimer = setTimeout(wiggle, 3000)
}

// wiggle the Start button (as the welcome page does), again every 15 s until it is clicked
function wiggle() {
  if (screen.value !== 'info' || !startButton.value) return
  animate(startButton.value.$el, { rotate: [0, 60, -60, 60, -60, 0] }, { duration: 0.75 }).finished.then(() => {
    wiggleTimer = setTimeout(wiggle, 15000)
  })
}

function start() {
  if (!infoHeard.value) return
  clearTimeout(wiggleTimer)
  screen.value = 'started'
}

onBeforeUnmount(() => clearTimeout(wiggleTimer))

function finish() {
  api.goNextView()
}

api.setAutofill(finish)
</script>

<template>
  <!-- 1. info for the parent, in the lab's constant-size box (no scrolling) -->
  <CdscBox v-if="screen === 'info'">
    <template #outside>
      <!-- the narration (outside the box, for its Play button) -->
      <AutoplayAudio :src="infoHeard ? null : narration" @ended="onInfoHeard()" />
    </template>

    <div class="text-center px-6 py-2">
      <img
        :src="logo"
        alt="Welcome to PANDA, the Princeton and NYU Discoveries in Action Lab"
        draggable="false"
        class="mx-auto h-[140px] mb-5 select-none"
      />

      <div class="mx-auto max-w-[760px] text-left">
        <p
          v-for="(paragraph, i) in PARAGRAPHS"
          :key="i"
          class="text-lg font-semibold text-justify"
          :class="{ 'mt-5': i > 0 }"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="mx-auto max-w-[760px] mt-4 flex items-center gap-4 text-left">
        <img :src="mascot" alt="" draggable="false" class="h-[90px] shrink-0 select-none" />
        <p class="text-lg">
          Please have your child sit in front of the computer, and make sure they are looking at the screen and can hear
          the sound. Once your child is in position, please help them click the Start button below. The activity will
          then start for your child automatically.
        </p>
      </div>
    </div>

    <template #footer>
      <!-- gray until the narration has finished, then solid and clickable -->
      <Button
        ref="startButton"
        :variant="infoHeard ? 'default' : 'secondary'"
        size="lg"
        class="text-2xl px-12 py-6"
        :class="{ 'cursor-not-allowed text-muted-foreground': !infoHeard }"
        id="handtochild-start"
        :disabled="!infoHeard"
        @click="start()"
      >
        Start
      </Button>
    </template>
  </CdscBox>

  <!-- 2. "Let's get started!" -->
  <ChildStage v-else class="flex items-center justify-center p-4 text-center">
    <AutoplayAudio :src="getStartedVoice" @ended="finish()" />
    <p class="text-6xl font-extrabold tracking-tight" :style="{ color: GET_STARTED_RED }">LET'S GET STARTED!</p>
  </ChildStage>
</template>

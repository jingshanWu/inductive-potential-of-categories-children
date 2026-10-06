<script setup>
// CDSC default sound check for the parent (the lab's standard PANDA sound
// check, as in the GRB recognition study and the lab's Qualtrics studies): an animal sound plays and
// the parent must pick which animal they heard from 5 picture options. A wrong
// answer means the sound can't have been heard: they are told to turn their
// sound on and redo the check. They cannot proceed until they answer
// correctly. All attempts are recorded.
//
// The clip, the animal options, and which animal is correct are SOUND_CHECK
// below; the files are in ./assets. The options are shown as hot spots (see
// HotSpots.vue): clicking a picture or the word under it picks that animal.
//
// Loudness: the clip should not be louder than the study's own sound, or
// parents set their volume too low. In the study this was made for, it is 2/3
// of the loudness of the study's videos (see that study's
// scripts/tts/match_loudness.py).
import { ref, onUnmounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { shuffle } from '@/core/utils/randomization'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import ScaleToFit from '@/uikit/layouts/ScaleToFit.vue'
import birdSound from '@/assets/cdsc_default/sound_check.m4a'
import birdImage from '@/assets/cdsc_default/soundcheck_bird.png'
import cowImage from '@/assets/cdsc_default/soundcheck_cow.png'
import dogImage from '@/assets/cdsc_default/soundcheck_dog.png'
import horseImage from '@/assets/cdsc_default/soundcheck_horse.png'
import pigImage from '@/assets/cdsc_default/soundcheck_pig.png'

const SOUND_CHECK = {
  audio: birdSound, // a bird sound
  options: [
    { id: 'dog', image: dogImage },
    { id: 'pig', image: pigImage },
    { id: 'cow', image: cowImage },
    { id: 'horse', image: horseImage },
    { id: 'bird', image: birdImage },
  ],
  correct: 'bird',
}

const api = useViewAPI()

// 'intro' -> (play) -> 'question' -> correct -> 'success' -> next view
//                                 -> wrong   -> 'retry' -> (play) -> ...
const screen = ref('intro')
const options = ref(
  shuffle(
    SOUND_CHECK.options.map((animal) => ({
      id: animal.id,
      image: animal.image,
      label: animal.id.charAt(0).toUpperCase() + animal.id.slice(1),
    }))
  )
)
let audio = null

if (!api.persist.isDefined('soundcheckAttempts')) {
  api.persist.soundcheckAttempts = []
}

function play() {
  screen.value = 'question'
  audio = new Audio(SOUND_CHECK.audio)
  audio.play().catch(() => {
    // if the file is missing/unplayable the parent will simply answer wrong
    // and see the retry screen; nothing to handle here
  })
}

onUnmounted(() => {
  if (audio) audio.pause()
})

function answer({ id }) {
  const correct = id === SOUND_CHECK.correct
  api.persist.soundcheckAttempts = [...api.persist.soundcheckAttempts, { response: id, correct }]
  if (correct) {
    api.recordPageData({
      soundcheck: 'passed',
      attempts: api.persist.soundcheckAttempts,
      nAttempts: api.persist.soundcheckAttempts.length,
    })
    screen.value = 'success'
  } else {
    screen.value = 'retry'
  }
}

function proceed() {
  api.goNextView()
}

function autofill() {
  api.recordPageData({ soundcheck: 'autofilled', attempts: [], nAttempts: 0 })
  api.goNextView()
}
api.setAutofill(autofill)
</script>

<template>
  <!-- scaled, like a slide, to fit the window: everything on screen at once, no scrolling -->
  <ChildStage class="p-4">
    <ScaleToFit :width="900">
      <div class="text-center px-6 py-4">
        <h1 class="text-2xl font-bold mb-4">🔊 Sound check</h1>

        <!-- intro -->
        <template v-if="screen === 'intro'">
          <p class="text-lg mb-4">
            This study uses sound, so we first need to check that your audio is working. Please turn your volume up.
          </p>
          <p class="text-lg mb-8">When you press the button below, you will hear an animal sound.</p>
          <Button variant="default" size="lg" id="soundcheck-play" @click="play()">
            <i-fa6-solid-play class="mr-2" /> Play sound
          </Button>
        </template>

        <!-- identify the animal -->
        <template v-else-if="screen === 'question'">
          <p class="text-lg mb-4">Which animal did you hear?</p>
          <!-- 3 options on the top row, 2 on the bottom -->
          <div class="w-full h-[400px]">
            <HotSpots :options="options" :columns="3" :margin="16" :gap="16" @choose="answer" />
          </div>
        </template>

        <!-- correct: sound confirmed working -->
        <template v-else-if="screen === 'success'">
          <p class="text-4xl mb-4">✅</p>
          <p class="text-2xl font-semibold mb-8">Sound check successful!</p>
          <Button variant="default" size="lg" id="soundcheck-continue" @click="proceed()">
            Continue
            <i-fa6-solid-arrow-right class="ml-2" />
          </Button>
        </template>

        <!-- wrong answer: sound must be off -->
        <template v-else>
          <p class="text-lg mb-4">
            <b>That wasn't the sound we played.</b>
          </p>
          <p class="text-lg mb-8">
            Please make sure your sound is turned on and your volume is up, then try the sound check again. If you still
            cannot hear anything, please exit the session and email discoveriesinaction@gmail.com for assistance.
          </p>
          <Button variant="default" size="lg" id="soundcheck-retry" @click="play()">
            <i-fa6-solid-rotate-right class="mr-2" /> Play sound again
          </Button>
        </template>
      </div>
    </ScaleToFit>
  </ChildStage>
</template>

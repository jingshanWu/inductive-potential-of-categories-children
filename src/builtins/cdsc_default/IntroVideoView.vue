<script setup>
// CDSC default intro page for the parent: the lab's standard PANDA welcome
// (Set Up/3-Intro Video), rebuilt in code from the lab's video of it so it
// can be edited. The page draws the researcher's photo, the lab's name in
// its colours, the PANDA letters with the mascot and the closing line; the
// video's narration (a researcher says hello and introduces the lab, 18 s)
// is played as sound, and each part fades in when the voice gets to it, at
// the same moments as in the video (APPEARS_AT). It belongs right before the
// consent pages.
//
// The Continue button is gray until the narration has finished, then solid
// and clickable. The sound and its Play / Replay fallbacks live in
// AutoplayAudio.vue.
//
// In design.js, give the view meta: { requiresConsent: false }, since it
// comes before consent.
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import AutoplayAudio from './AutoplayAudio.vue'
import ChildStage from './ChildStage.vue'
import ScaleToFit from './ScaleToFit.vue'
import narration from './assets/panda_intro.m4a'
import photo from './assets/panda_intro_photo.jpg'
import wordmark from './assets/panda_wordmark_mascot.png'

// the lab's name, in the colours of the PANDA letters (null = the page's text colour)
const LAB_NAME = [
  { text: 'Princeton', color: '#c54f4b' },
  { text: 'and', color: '#459b4a' },
  { text: 'NYU', color: '#795a7d' },
  { text: 'Discoveries', color: '#f5bc45' },
  { text: 'in', color: null },
  { text: 'Action', color: '#3c86c9' },
  { text: 'Lab', color: null },
]

const CLOSING_LINE =
  "We'll start by giving you some more information so that you can decide if you want to participate!"

// when each part appears, in seconds of narration, measured from the lab's
// video (the photo is there from the start)
const APPEARS_AT = {
  labName: 3.65,
  wordmark: 7.9,
  closingLine: 12.95,
}

const api = useViewAPI()

const heard = ref(false) // the narration has played to the end
const played = ref(0) // seconds of narration played so far

// a part is shown once the voice has reached it (and stays once the narration is over)
const shown = (part) => heard.value || played.value >= APPEARS_AT[part]

function finish() {
  if (!heard.value) return
  api.goNextView()
}

api.setAutofill(() => api.goNextView())
</script>

<template>
  <!-- scaled, like a slide, to fit the window: everything on screen at once, no scrolling -->
  <ChildStage class="p-4">
    <!-- the narration (outside the scaled part, for its Play button) -->
    <AutoplayAudio :src="heard ? null : narration" @time="played = $event" @ended="heard = true" />

    <ScaleToFit :width="900">
      <div class="text-center px-6 py-3">
        <img
          :src="photo"
          alt="A researcher from the lab waving hello"
          draggable="false"
          class="mx-auto h-[200px] mb-4"
        />

        <!-- the parts below keep their place on the page and fade in -->
        <p
          class="text-3xl font-semibold mb-3 transition-opacity duration-500"
          :class="{ 'opacity-0': !shown('labName') }"
        >
          <template v-for="(word, i) in LAB_NAME" :key="i">
            <span :style="word.color ? { color: word.color } : null">{{ word.text }}</span
            >{{ i < LAB_NAME.length - 1 ? ' ' : '' }}
          </template>
        </p>

        <!-- the PANDA letters with the mascot under them -->
        <img
          :src="wordmark"
          alt="PANDA"
          draggable="false"
          class="mx-auto h-[150px] mb-4 transition-opacity duration-500"
          :class="{ 'opacity-0': !shown('wordmark') }"
        />

        <p
          class="text-xl mb-5 mx-auto max-w-[760px] transition-opacity duration-500"
          :class="{ 'opacity-0': !shown('closingLine') }"
        >
          {{ CLOSING_LINE }}
        </p>

        <!-- gray until the narration has finished, then solid and clickable -->
        <Button
          :variant="heard ? 'default' : 'secondary'"
          size="lg"
          :class="{ 'cursor-not-allowed text-muted-foreground': !heard }"
          id="introvideo-continue"
          :disabled="!heard"
          @click="finish()"
        >
          Continue
          <i-fa6-solid-arrow-right class="ml-2" />
        </Button>
      </div>
    </ScaleToFit>
  </ChildStage>
</template>

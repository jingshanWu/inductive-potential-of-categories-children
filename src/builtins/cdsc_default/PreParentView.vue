<script setup>
// CDSC default "pre-parent" page: the last page of the child's part of a
// study, handing over to the questions for parents (the lab's standard PANDA
// page, Set Up/6-Pre-Parent). Put it right after the child's last task view;
// that view should move on by itself, so this page appears as soon as the
// child has given their last answer.
//
// The page is rebuilt in code from the lab's video of it so it can be edited:
// it draws "GREAT job!", the two lines and the mascot, and plays the video's
// narration (9 s) as sound. The last line ("Then, you'll upload your video
// ...") fades in when the voice gets to it, at the same moment as in the
// video. The Continue button is gray until the narration has finished, then
// solid and clickable.
//
// The sound and its Play / Replay fallbacks live in AutoplayAudio.vue.
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import AutoplayAudio from './AutoplayAudio.vue'
import ChildStage from './ChildStage.vue'
import narration from './assets/panda_pre_parent.m4a'
import mascot from './assets/panda_mascot.png'
import webcam from './assets/panda_webcam.png'

// the red of the lab's slide
const HEADING_RED = '#de373f'

// when the last line appears, in seconds of narration (measured from the lab's video)
const UPLOAD_LINE_AT = 5.6

const api = useViewAPI()

const heard = ref(false) // the narration has played to the end
const played = ref(0) // seconds of narration played so far

function finish() {
  if (!heard.value) return
  api.goNextView()
}

api.setAutofill(() => api.goNextView())
</script>

<template>
  <ChildStage class="flex flex-col items-center justify-center p-4 text-center">
    <AutoplayAudio :src="heard ? null : narration" @time="played = $event" @ended="heard = true" />

    <h1 class="text-7xl font-extrabold tracking-tight mb-12" :style="{ color: HEADING_RED }">GREAT job!</h1>

    <p class="text-4xl mb-12">
      Now, we have just a few questions<br />
      <b>for parents.</b>
    </p>

    <!-- keeps its place on the page and fades in when the voice gets to it -->
    <p
      class="flex items-center justify-center gap-3 text-3xl mb-10 transition-opacity duration-500"
      :class="{ 'opacity-0': !heard && played < UPLOAD_LINE_AT }"
    >
      Then, you’ll upload your video and be all done!
      <img :src="webcam" alt="" draggable="false" class="h-[52px] select-none" />
    </p>

    <div class="flex items-center gap-8">
      <!-- the mascot looks the other way on this page -->
      <img :src="mascot" alt="" draggable="false" class="h-[100px] -scale-x-100 select-none" />
      <!-- gray until the narration has finished, then solid and clickable -->
      <Button
        :variant="heard ? 'default' : 'secondary'"
        size="lg"
        class="text-2xl px-12 py-8"
        :class="{ 'cursor-not-allowed text-muted-foreground': !heard }"
        id="preparent-continue"
        :disabled="!heard"
        @click="finish()"
      >
        Continue
      </Button>
    </div>
  </ChildStage>
</template>

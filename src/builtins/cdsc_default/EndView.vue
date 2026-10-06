<script setup>
// CDSC default last page of a PANDA study (Set Up/7-Upload). It takes the
// place of Smile's default thanks page (builtins/thanks/ThanksView.vue, left
// as it came). In order:
//   1. uploading: the study's data are saved while a progress bar runs ("Do
//      not close your browser window yet!"), as on Smile's thanks page.
//   2. the lab's closing message, rebuilt in code from the lab's video of it
//      so it can be edited. The video's narration (39 s) is played as sound
//      and the page follows it, at the same moments as in the video
//      (TIMELINE):
//        "HANG ON!" -> "Before you close your web browser, please don't
//        forget to upload the video from today's session!" with the webcam
//        -> "STOP", "UPLOAD" -> "THANK YOU FOR PARTICIPATING with panda",
//        the hope-you-enjoyed line and the lab's email address.
//      The page then stays on the thank-you part.
//
// Use it in design.js for the 'thanks' view, with the same meta as Smile's
// thanks page. Everything is on screen at once and the page cannot be
// scrolled (ChildStage.vue). The sound and its Play / Replay fallbacks live
// in AutoplayAudio.vue.
import { computed, onMounted, ref } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { Progress } from '@/uikit/components/ui/progress'
import AutoplayAudio from './AutoplayAudio.vue'
import ChildStage from './ChildStage.vue'
import narration from '@/assets/cdsc_default/panda_end.m4a'
import mascot from '@/assets/cdsc_default/panda_mascot.png'
import webcam from '@/assets/cdsc_default/panda_webcam.png'
import wordmark from '@/assets/cdsc_default/panda_wordmark.png'

// how long the progress bar runs while the data are saved (as on Smile's thanks page)
const UPLOAD_MS = 20000
// the save is delayed a little so it is not refused for coming too soon after the last one
const SAVE_DELAY_MS = 4000

// when each part appears, in seconds of narration (measured from the lab's video)
const TIMELINE = {
  reminder: 4.6, // "Before you close your web browser ..." and the webcam
  stopUpload: 10.8, // the reminder text goes, "HANG ON!" fades
  stop: 13.7,
  upload: 15.8,
  thanks: 22.8, // the thank-you part replaces everything
}

// the colours of the lab's slides
const RED = '#de373f'
const STOP_RED = '#fc2100'
const UPLOAD_GREEN = '#007b25'

// "The Princeton And NYU Discoveries in Action Lab", with the PANDA initials in colour
const TAGLINE = [
  { text: 'The ' },
  { text: 'P', color: '#c54f4b' },
  { text: 'rinceton ' },
  { text: 'A', color: '#459b4a' },
  { text: 'nd ' },
  { text: 'N', color: '#795a7d' },
  { text: 'YU ' },
  { text: 'D', color: '#f5bc45' },
  { text: 'iscoveries in ' },
  { text: 'A', color: '#3c86c9' },
  { text: 'ction Lab' },
]

const CONTACT_EMAIL = 'discoveriesinaction@gmail.com'

const api = useAPI()

// as Smile's thanks page does
const completionCode = api.computeCompletionCode()
api.setCompletionCode(completionCode)

const isUploading = ref(true)
const uploadProgress = ref(0)

const heard = ref(false) // the narration has played to the end
const played = ref(0) // seconds of narration played so far
const reached = (part) => heard.value || played.value >= TIMELINE[part]
const showThanks = computed(() => reached('thanks'))

onMounted(() => {
  setTimeout(() => api.saveData(true), SAVE_DELAY_MS) // force a data save

  const startTime = Date.now()
  const updateProgress = () => {
    const progress = Math.min((Date.now() - startTime) / UPLOAD_MS, 1)
    uploadProgress.value = Math.round((1 - Math.pow(1 - progress, 2)) * 100) // ease out
    if (progress < 1) requestAnimationFrame(updateProgress)
    else isUploading.value = false
  }
  requestAnimationFrame(updateProgress)
})
</script>

<template>
  <!-- 1. uploading the data -->
  <ChildStage v-if="isUploading" class="flex flex-col items-center justify-center p-6">
    <div class="w-4/5 max-w-md text-center">
      <h1 class="text-3xl font-bold mb-4">Uploading Your Data</h1>
      <p class="text-lg text-muted-foreground mb-8">Do not close your browser window yet!</p>
      <Progress :model-value="uploadProgress" class="h-3 mb-4" />
      <p class="text-sm text-muted-foreground">{{ uploadProgress }}%</p>
    </div>
  </ChildStage>

  <!-- 2. the lab's closing message -->
  <ChildStage v-else class="flex flex-col items-center justify-center p-6 text-center">
    <AutoplayAudio :src="heard ? null : narration" @time="played = $event" @ended="heard = true" />

    <!-- "HANG ON!" ... "STOP", "UPLOAD" -->
    <div v-if="!showThanks" class="w-full max-w-[860px]">
      <h1
        class="text-7xl font-extrabold tracking-tight mb-4 transition-opacity duration-500"
        :class="{ 'opacity-40': reached('stopUpload') }"
        :style="{ color: RED }"
      >
        HANG ON!
      </h1>

      <!-- the reminder, then "STOP" and "UPLOAD" in its place -->
      <div class="relative h-[190px]">
        <p
          class="absolute inset-0 text-3xl transition-opacity duration-500"
          :class="{ 'opacity-0': !reached('reminder') || reached('stopUpload') }"
        >
          Before you close your web browser, please don’t forget to <b>upload the video from today’s session!</b>
        </p>
        <div class="absolute inset-0 flex flex-col items-center justify-center font-extrabold text-7xl leading-tight">
          <span
            class="transition-opacity duration-300"
            :class="{ 'opacity-0': !reached('stop') }"
            :style="{ color: STOP_RED }"
            >STOP</span
          >
          <span
            class="transition-opacity duration-300"
            :class="{ 'opacity-0': !reached('upload') }"
            :style="{ color: UPLOAD_GREEN }"
            >UPLOAD</span
          >
        </div>
      </div>

      <div class="relative mt-4 flex justify-center">
        <img
          :src="mascot"
          alt=""
          draggable="false"
          class="absolute left-0 bottom-0 h-[100px] -scale-x-100 select-none"
        />
        <img
          :src="webcam"
          alt=""
          draggable="false"
          class="h-[170px] select-none transition-opacity duration-500"
          :class="{ 'opacity-0': !reached('reminder') }"
        />
      </div>
    </div>

    <!-- "THANK YOU FOR PARTICIPATING" -->
    <div v-else class="w-full max-w-[860px]">
      <h1 class="text-5xl font-extrabold tracking-tight mb-2" :style="{ color: RED }">THANK YOU FOR PARTICIPATING</h1>
      <div class="flex items-center justify-center gap-3 mb-2">
        <span class="text-3xl font-bold text-muted-foreground">with</span>
        <img :src="wordmark" alt="PANDA" draggable="false" class="h-[80px] select-none" />
      </div>
      <p class="text-2xl mb-10">
        <span
          v-for="(part, i) in TAGLINE"
          :key="i"
          :class="{ 'font-bold': part.color }"
          :style="part.color ? { color: part.color } : null"
          >{{ part.text }}</span
        >
      </p>

      <p class="text-2xl font-semibold mb-6">We hope that you and your child enjoyed the experience!</p>
      <p class="text-2xl font-semibold mb-10">
        If you want to learn more about the study, please contact our team at
        <span :style="{ color: RED }">{{ CONTACT_EMAIL }}</span
        >.
      </p>

      <img :src="mascot" alt="" draggable="false" class="h-[100px] -scale-x-100 select-none" />
    </div>
  </ChildStage>
</template>

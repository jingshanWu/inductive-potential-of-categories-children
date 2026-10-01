<script setup>
// Training phase for the child: the 16 generic ("Zarpies ...") or 16 specific
// ("This Zarpie ...") videos, depending on the participant's `condition`.
// As in the adult Qualtrics study, the videos are shown in a random order
// (shuffled per participant), each plays automatically, cannot be paused or
// rewatched, and the next one starts by itself. After the last video the
// study moves to the next view.
//
// The baseline condition has no training videos: this view is skipped.
//
// Same fallbacks as TaskIntroView: a Play button if the browser refuses to
// autoplay (e.g. after a reload), and a Replay button if a video fails to
// load. There is no way to continue without watching each video to the end.
import { onMounted, ref, watch } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { stimulusUrl, trainingTrials } from './stimuli'

const api = useViewAPI()

const condition = api.getConditionByName('condition')
const trials = condition === 'generic' || condition === 'specific' ? trainingTrials(condition) : []

if (trials.length) {
  const steps = api.steps.append([{ id: 'training' }])
  steps[0].append(trials.map((trial) => ({ ...trial, condition, completed: false }))).shuffle()
}

const video = ref(null)
const blocked = ref(false) // browser refused to autoplay
const failed = ref(false) // video file could not be loaded

function play() {
  blocked.value = false
  video.value.play().catch(() => {
    blocked.value = true
  })
}

// load the current trial's video and play it from the beginning. The same
// <video> element is reused for every trial, so that once it has played with
// sound the browser lets the following videos autoplay too.
function startTrial() {
  failed.value = false
  video.value.src = stimulusUrl(api.stepData.video)
  video.value.load()
  play()
}

function finish() {
  api.goNextView()
}

function onEnded() {
  api.stepData.trialIndex = api.blockIndex + 1 // position in this participant's order (1-16)
  api.stepData.completed = true
  api.recordStep()
  if (api.isLastStep()) finish()
  else api.goNextStep()
}

onMounted(() => {
  if (!trials.length) {
    api.recordPageData({ condition: condition ?? null, skipped: true })
    finish()
    return
  }
  startTrial()
  // start the next video whenever we move to a new trial
  watch(() => api.stepIndex, startTrial)
})

function autofill() {
  if (video.value) video.value.pause()
  while (trials.length && !api.isLastStep()) {
    api.recordStep()
    api.goNextStep()
  }
  if (trials.length) api.recordStep()
  finish()
}
api.setAutofill(autofill)
</script>

<template>
  <div v-if="trials.length" class="relative flex items-center justify-center w-full h-[90vh] p-4">
    <video
      ref="video"
      class="max-w-full max-h-full"
      preload="auto"
      playsinline
      disablepictureinpicture
      @contextmenu.prevent
      @ended="onEnded()"
      @error="failed = true"
    ></video>

    <!-- autoplay was blocked: one click starts the video -->
    <div v-if="blocked && !failed" class="absolute inset-0 flex items-center justify-center">
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="training-play" @click="play()">
        <i-fa6-solid-play class="mr-2" /> Play
      </Button>
    </div>

    <!-- video could not be loaded: try again (the child cannot continue without watching it) -->
    <div v-if="failed" class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <p class="text-lg mb-6">Sorry, the video could not be played.</p>
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="training-replay" @click="startTrial()">
        <i-fa6-solid-rotate-right class="mr-2" /> Replay
      </Button>
      <p class="text-lg mt-6">If this keeps happening, please exit the session and contact us for assistance.</p>
    </div>
  </div>
</template>

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
// The player and its Play / Replay fallbacks live in AutoplayVideo.vue. There
// is no way to continue without watching each video to the end.
import { computed, onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayVideo from './AutoplayVideo.vue'
import { stimulusUrl, trainingTrials } from './stimuli'

const api = useViewAPI()

const condition = api.getConditionByName('condition')
const trials = condition === 'generic' || condition === 'specific' ? trainingTrials(condition) : []

if (trials.length) {
  const steps = api.steps.append([{ id: 'training' }])
  steps[0].append(trials.map((trial) => ({ ...trial, condition, completed: false }))).shuffle()
}

// the current video's URL, or null until the stepper is on a video step. On
// the view's first render the stepper can still be on the parent 'training'
// node, whose data has no `video`; Safari then loaded ".../stimuli/undefined",
// got a 404 and showed the "could not be played" screen (Chrome happened to
// re-render with the real step before the request). The player is only
// created once there is a video.
const videoSrc = computed(() => (api.stepData?.video ? stimulusUrl(api.stepData.video) : null))

function finish() {
  api.goNextView()
}

// moving to the next step changes the video's src, which starts the next video
function onEnded() {
  api.stepData.trialIndex = api.blockIndex + 1 // position in this participant's order (1-16)
  api.stepData.completed = true
  api.recordStep()
  if (api.isLastStep()) finish()
  else api.goNextStep()
}

onMounted(() => {
  if (trials.length) return
  api.recordPageData({ condition: condition ?? null, skipped: true })
  finish()
})

function autofill() {
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
  <div v-if="trials.length" class="w-full h-[90vh] p-4">
    <AutoplayVideo v-if="videoSrc" :src="videoSrc" @ended="onEnded()" />
  </div>
</template>

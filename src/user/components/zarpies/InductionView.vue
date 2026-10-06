<script setup>
// Induction (test) phase for the child, the child version of the adult
// study's inductive potential task. In order:
//   1. intro: a spoken introduction, then the first trial starts by itself
//   2. trials: the 16 induction features, shuffled per participant (the
//      adult study's attention check is commented out in stimuli.js; the code
//      for it below only runs if it is put back)
//   3. end: a spoken "all done, get your grown-up", then a Continue button
//
// A trial has two parts:
//   1. describe: the premise text with a big picture of the Zarpie, while the
//      description clip plays ("Imagine you see a Zarpie ...").
//   2. question: the picture disappears; the question text appears right
//      below the premise and the 5 scale choices (panels of that Zarpie, 1 /
//      3 / 5 / 7 / 9 times) fill the rest of the page while the question clip
//      plays, then the 5 scale clips ("Is it only one Zarpie?" ...) one by
//      one, each enlarging its choice. The choices only become clickable
//      after the last clip.
// The attention check skips part 1: its clip plays with the choices showing,
// then the choices become clickable.
//
// All text, audio paths and the scale come from stimuli.js. The choices are
// hot spots (HotSpots.vue); the sound and its Play / Replay fallbacks are in
// AutoplayAudio.vue, so no clip can be skipped. The page is a ChildStage:
// everything fits on screen at once and the page cannot be scrolled.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import AutoplayAudio from './AutoplayAudio.vue'
import ChildStage from './ChildStage.vue'
import HotSpots from './HotSpots.vue'
import { ATTENTION_CHECK, INDUCTION_END, INDUCTION_INTRO, SCALE_OPTIONS, inductionTrials, stimulusUrl } from './stimuli'

// silence between two clips of a trial
const CLIP_GAP_MS = 300

const api = useViewAPI()

const steps = api.steps.append([{ id: 'intro' }, { id: 'trials' }, { id: 'end' }])
steps[1]
  .append(
    inductionTrials().map((trial) => ({
      id: trial.id,
      attentionCheck: trial.attentionCheck,
      text: trial.text,
      premise: trial.premise ?? null,
      question: trial.question ?? null,
      audio: trial.audio,
      image: trial.image ?? null,
      response: null, // scale option id ('one' ... 'all')
      responseValue: null, // 1-5
      rt: null, // ms from the choices becoming clickable to the click
      trialIndex: null, // position in this participant's order (1-16)
      attentionPassed: null, // attention check only
    }))
  )
  .shuffle()

const section = computed(() => api.path[0]) // 'intro' | 'trials' | 'end'

// the current trial's picture and clips, looked up from stimuli.js by id
// rather than read from the saved step data (steps are saved per participant
// when first built, so anything added to stimuli.js later would not show)
const TRIALS = Object.fromEntries(inductionTrials().map((trial) => [trial.id, trial]))
const trial = computed(() => (section.value === 'trials' ? TRIALS[api.stepData.id] : null))
const trialImage = computed(() => trial.value?.image ?? null)

// where we are within a trial: 'describe' (big picture, description clip) ->
// 'question' (no picture, question clip, choices showing) -> 'options'
// (scale clips one by one) -> 'respond' (choices clickable)
const phase = ref('describe')
const optionIndex = ref(0)
const endSpoken = ref(false)
let gapTimer = null

// every new step starts from its first clip (also after a page reload)
watch(
  () => api.stepIndex,
  () => {
    clearTimeout(gapTimer)
    phase.value = api.stepData?.attentionCheck ? 'question' : 'describe'
    optionIndex.value = 0
  },
  { immediate: true }
)

// the 5 scale choices for the current trial: panels showing the trial's own
// Zarpie 1 / 3 / 5 / 7 / 9 times (a fixed scale picture, if one is ever
// listed in SCALE_OPTIONS, takes precedence; text only if there is no picture)
const choices = computed(() =>
  SCALE_OPTIONS.map((option) => {
    const choice = { id: option.id, label: option.label }
    if (option.image) choice.image = stimulusUrl(option.image)
    else if (trialImage.value) choice.panel = { image: stimulusUrl(trialImage.value), count: option.count }
    return choice
  })
)

const highlighted = computed(() => (phase.value === 'options' ? SCALE_OPTIONS[optionIndex.value].id : null))

const audioSrc = computed(() => {
  if (section.value === 'intro') return stimulusUrl(INDUCTION_INTRO.audio)
  if (section.value === 'end') return endSpoken.value ? null : stimulusUrl(INDUCTION_END.audio)
  if (phase.value === 'describe') return stimulusUrl(trial.value.audio.description)
  if (phase.value === 'question') return stimulusUrl(trial.value.audio.question)
  if (phase.value === 'options') return stimulusUrl(SCALE_OPTIONS[optionIndex.value].audio)
  return null
})

// a clip finished: decide what comes next
function nextClip() {
  if (section.value === 'intro') {
    api.goNextStep()
  } else if (section.value === 'end') {
    endSpoken.value = true
  } else if (phase.value === 'describe') {
    phase.value = 'question'
  } else if (phase.value === 'question') {
    phase.value = api.stepData.attentionCheck ? 'respond' : 'options'
  } else if (phase.value === 'options') {
    if (optionIndex.value < SCALE_OPTIONS.length - 1) optionIndex.value += 1
    else phase.value = 'respond'
  }
}

function onAudioEnded() {
  clearTimeout(gapTimer)
  gapTimer = setTimeout(nextClip, CLIP_GAP_MS)
}

onBeforeUnmount(() => clearTimeout(gapTimer))

function onChoose({ id, rt }) {
  const option = SCALE_OPTIONS.find((o) => o.id === id)
  api.stepData.response = id
  api.stepData.responseValue = option.value
  api.stepData.rt = rt
  api.stepData.trialIndex = api.blockIndex + 1
  if (api.stepData.attentionCheck) api.stepData.attentionPassed = id === ATTENTION_CHECK.correct
  api.recordStep()
  api.goNextStep()
}

function finish() {
  api.goNextView()
}

function autofill() {
  clearTimeout(gapTimer)
  while (api.stepIndex < api.nSteps - 1) {
    if (section.value === 'trials') {
      api.stepData.response = 'autofilled'
      api.stepData.trialIndex = api.blockIndex + 1
      api.recordStep()
    }
    api.goNextStep()
  }
  finish()
}
api.setAutofill(autofill)
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="audioSrc" @ended="onAudioEnded()" />

    <!-- 1. intro -->
    <div v-if="section === 'intro'" class="flex flex-1 items-center justify-center w-[85%]">
      <p class="text-3xl font-medium">{{ INDUCTION_INTRO.text }}</p>
    </div>

    <!-- 2. trials -->
    <template v-else-if="section === 'trials'">
      <!-- attention check: just its instruction (its panels use a neutral Zarpie) -->
      <p v-if="api.stepData.attentionCheck" class="text-2xl font-medium my-6">{{ api.stepData.text }}</p>

      <template v-else>
        <p class="text-2xl font-medium mb-3">{{ api.stepData.premise }}</p>

        <!-- the Zarpie for this trial, only while it is described (a dashed
             text box if no picture is listed) -->
        <div v-if="phase === 'describe'" class="w-full flex-1 min-h-0 pb-4 flex items-center justify-center">
          <img
            v-if="trialImage"
            :src="stimulusUrl(trialImage)"
            alt=""
            draggable="false"
            class="max-w-full max-h-full object-contain select-none"
          />
          <div
            v-else
            class="h-full aspect-square flex items-center justify-center p-2 rounded-xl border-2 border-dashed border-muted-foreground text-xl"
          >
            Picture: {{ api.stepData.id }}
          </div>
        </div>

        <p v-if="phase !== 'describe'" class="text-2xl font-medium mb-3">{{ api.stepData.question }}</p>
      </template>

      <!-- the scale, lowest to highest: 3 choices on the top row, 2 on the bottom
           (from the question part on); the padding is room for the choice that
           is enlarged while it is read -->
      <div v-if="phase !== 'describe'" class="w-full flex-1 min-h-0 px-4 pt-4 pb-8">
        <HotSpots
          :key="api.stepIndex"
          :options="choices"
          :columns="3"
          :labelLines="2"
          :margin="12"
          :gap="12"
          :disabled="phase !== 'respond'"
          :highlight="highlighted"
          @choose="onChoose"
        />
      </div>
    </template>

    <!-- 3. end: hand the laptop back to the parent -->
    <div v-else class="flex flex-1 flex-col items-center justify-center w-[85%]">
      <p class="text-3xl font-medium mb-10">{{ INDUCTION_END.text }}</p>
      <Button
        v-if="endSpoken"
        variant="default"
        size="lg"
        class="text-2xl px-12 py-8"
        id="induction-continue"
        @click="finish()"
      >
        Continue
      </Button>
    </div>
  </ChildStage>
</template>

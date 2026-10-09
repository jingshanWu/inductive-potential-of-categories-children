<script setup>
// Two check questions after the last test trial (the control questions of
// Rhodes & Liebenson, 2015, with Zarpies in place of birds): one that should
// land at the low end of the scale, one higher up, to show the child can use
// the scale. The Zarpie panels of the test with a neutral Zarpie (END_CHECK
// in stimuli.js), no feedback. Each question is read aloud, the
// child clicks a card, and the next question comes; after the second the
// study moves on by itself. The scale's direction is the child's
// counterbalanced one (scaleDirection). Steps (Smile): 'intro', then one
// step per question, each recorded like a test trial. For the question about
// Steve, Steve is shown first and the Zarpie appears when the voice gets to it
// (question.zarpieAt in END_CHECK).
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import { END_CHECK as C, scaleOptions, stimulusUrl } from './stimuli'

const CLIP_GAP_MS = 300

const api = useViewAPI()

const direction = api.getConditionByName('scaleDirection')
const OPTIONS = scaleOptions(direction)
const cards = computed(() =>
  OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    panel: { image: stimulusUrl(C.image), count: o.count },
  }))
)

const steps = api.steps.append([{ id: 'intro' }, { id: 'questions' }])
steps[1].append(
  C.items.map((it) => ({
    id: it.id,
    expected: it.expected,
    response: null, // scale option id
    responseValue: null, // 1-5
    rt: null,
    scaleDirection: direction,
  }))
)
api.updateStepper()

const section = computed(() => api.path[0]) // 'intro' | 'questions'
const ITEMS = Object.fromEntries(C.items.map((it) => [it.id, it]))
const item = computed(() => (section.value === 'questions' ? ITEMS[api.stepData.id] : null))

// within a question: 'ask' (the clip) -> 'options' (the 5 panels read one by
// one, each enlarging, with the test's clips) -> 'respond' (clickable)
const phase = ref('ask')
const optionIndex = ref(0)
const clickable = ref(false)
// the Zarpie of the question: shown from the start, unless the question says
// when the voice gets to it (zarpieAt); then it appears at that moment
const zarpieShown = ref(false)
let gapTimer = null
const highlighted = computed(() => (phase.value === 'options' ? OPTIONS[optionIndex.value].id : null))

// every step starts from its clip (also after a page reload)
watch(
  () => api.stepIndex,
  () => {
    clearTimeout(gapTimer)
    phase.value = 'ask'
    optionIndex.value = 0
    clickable.value = false
    zarpieShown.value = !(item.value && item.value.question.zarpieAt)
  },
  { immediate: true }
)

// while the question's clip plays: show the Zarpie once the voice reaches it
function onAudioTime(seconds) {
  if (zarpieShown.value || phase.value !== 'ask' || !item.value) return
  if (seconds >= item.value.question.zarpieAt) zarpieShown.value = true
}

const audioSrc = computed(() => {
  if (section.value === 'intro') return stimulusUrl(C.intro.audio)
  if (phase.value === 'ask') return stimulusUrl(item.value.question.audio)
  if (phase.value === 'options') return stimulusUrl(OPTIONS[optionIndex.value].audio)
  return null
})

function onAudioEnded() {
  clearTimeout(gapTimer)
  gapTimer = setTimeout(() => {
    if (section.value === 'intro') api.goNextStep()
    else if (phase.value === 'ask') {
      zarpieShown.value = true // in case the clip was skipped (fast forward)
      phase.value = 'options'
    } else if (phase.value === 'options' && optionIndex.value < OPTIONS.length - 1) optionIndex.value += 1
    else {
      phase.value = 'respond'
      clickable.value = true
    }
  }, CLIP_GAP_MS)
}

function onChoose({ id, rt }) {
  if (!clickable.value) return
  clickable.value = false
  api.stepData.response = id
  api.stepData.responseValue = OPTIONS.find((o) => o.id === id).value
  api.stepData.rt = rt
  api.recordStep()
  if (api.isLastStep()) finish()
  else api.goNextStep()
}

function finish() {
  api.goNextView()
}

onBeforeUnmount(() => clearTimeout(gapTimer))

api.setAutofill(() => {
  clearTimeout(gapTimer)
  while (api.stepIndex < api.nSteps - 1) {
    if (section.value === 'questions') {
      api.stepData.response = 'autofilled'
      api.recordStep()
    }
    api.goNextStep()
  }
  if (section.value === 'questions') {
    api.stepData.response = 'autofilled'
    api.recordStep()
  }
  finish()
})
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="audioSrc" @ended="onAudioEnded()" @time="onAudioTime" />

    <!-- page 1: just the intro line, in the middle -->
    <div v-if="section === 'intro'" class="flex flex-1 items-center justify-center">
      <p class="text-3xl font-medium">{{ C.intro.text }}</p>
    </div>

    <template v-else>
      <p class="text-2xl font-medium mb-3">{{ item.question.text }}</p>

      <!-- the Zarpie the question is about (with Steve, for the question about him) -->
      <div class="h-[24vh] mb-2 flex items-center justify-center gap-12">
        <img
          v-if="item.id === 'met_one'"
          :src="stimulusUrl(C.narrator.image)"
          alt="Steve"
          draggable="false"
          class="max-h-full select-none"
        />
        <!-- kept in the layout while hidden, so Steve does not move when the Zarpie appears -->
        <img
          :src="stimulusUrl(C.image)"
          alt=""
          draggable="false"
          class="max-h-full select-none"
          :class="{ invisible: !zarpieShown }"
        />
      </div>

      <div class="w-full flex-1 min-h-0 px-4 pt-4 pb-8">
        <HotSpots
          :key="api.stepIndex"
          :options="cards"
          :columns="5"
          :labelLines="2"
          :margin="12"
          :gap="12"
          :disabled="!clickable"
          :highlight="highlighted"
          @choose="onChoose"
        />
      </div>
    </template>
  </ChildStage>
</template>

<script setup>
// Task intro for the child, two pages read aloud by the study's voice (the
// adult Qualtrics study used a video here; its narration is TASK_INTRO.adult
// in stimuli.js):
//   1. 'intro'  — one line: there are people called Zarpies, we will tell you
//                 some things about them and ask you some questions
//   2. 'bridge' — one line: the cards of the questions show Zarpies instead
//                 of dots, but mean the same thing (SCALE_BRIDGE in
//                 stimuli.js); the 5 dot cards of the scale training are
//                 shown above the 5 Zarpie panels of the test (a neutral
//                 Zarpie), both in the child's scale order
// Each clip plays automatically and the page moves on by itself when it ends.
// The sound and its Play / Replay fallbacks live in AutoplayAudio.vue. There
// is no way to continue without hearing the clips to the end.
import { computed, onBeforeUnmount, onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import { TASK_INTRO, SCALE_BRIDGE as B, SCALE_TRAINING, inductionAssetUrls, scaleOptions, stimulusUrl } from './stimuli'

// which wording is shown and read on page 1: 'child' or 'adult'
const INTRO = TASK_INTRO.child

// pause after each clip before moving on
const END_GAP_MS = 500

const api = useViewAPI()
const direction = api.getConditionByName('scaleDirection')
const OPTIONS = scaleOptions(direction)

// the two pages as steps
api.steps.append([{ id: 'intro' }, { id: 'bridge' }])
api.updateStepper()
const page = computed(() => api.path[0]) // 'intro' | 'bridge'

// page 2: the dot cards of the training, above the Zarpie panels of the test
const LABELS = { one: 'Only one', few: 'A few', some: 'Some', most: 'Most', all: 'All' }
const cards = computed(() =>
  OPTIONS.map((o) => ({
    id: o.id,
    label: LABELS[o.id],
    panel: { image: stimulusUrl(SCALE_TRAINING.dot), count: o.count },
  }))
)
const panels = computed(() =>
  OPTIONS.map((o) => ({ id: o.id, label: o.label, panel: { image: stimulusUrl(B.image), count: o.count } }))
)

let timer = null

const audioSrc = computed(() => stimulusUrl(page.value === 'intro' ? INTRO.audio : B.intro.audio))

function onAudioEnded() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (page.value === 'intro') {
      api.stepData.completed = true
      api.recordStep()
      api.goNextStep()
    } else finish(true)
  }, END_GAP_MS)
}

function finish(completed) {
  clearTimeout(timer)
  api.stepData.completed = completed
  api.recordStep()
  api.recordPageData({ scaleDirection: direction, completed })
  api.goNextView()
}

onBeforeUnmount(() => clearTimeout(timer))

// fetch the test's clips and pictures now, while the intro and the training
// videos play, so that no test clip has to wait for the network (see
// inductionAssetUrls in stimuli.js)
onMounted(() => {
  for (const url of inductionAssetUrls()) fetch(url).catch(() => {})
})

api.setAutofill(() => finish('autofilled'))
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="audioSrc" @ended="onAudioEnded()" />

    <!-- page 1: what the game is about, with a Zarpie to look at -->
    <div v-if="page === 'intro'" class="flex flex-1 flex-col items-center justify-center w-[85%] min-h-0">
      <img :src="stimulusUrl(B.image)" alt="" draggable="false" class="h-[45%] min-h-0 mb-6 select-none" />
      <p class="text-3xl font-medium">{{ INTRO.text }}</p>
    </div>

    <!-- page 2: the dot cards of the training, and under them the Zarpie
         panels of the test -->
    <template v-else>
      <p class="text-2xl font-medium mb-3">{{ B.intro.text }}</p>
      <div class="w-full flex-1 min-h-0 px-4 pt-2 pb-2">
        <HotSpots :options="cards" :columns="5" :labelLines="1" :margin="10" :gap="12" :disabled="true" />
      </div>
      <div class="w-full flex-1 min-h-0 px-4 pt-2 pb-8">
        <HotSpots :options="panels" :columns="5" :labelLines="2" :margin="10" :gap="12" :disabled="true" />
      </div>
    </template>
  </ChildStage>
</template>

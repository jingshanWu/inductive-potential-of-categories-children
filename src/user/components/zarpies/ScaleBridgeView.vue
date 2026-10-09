<script setup>
// Right before the test: the Zarpie pictures of the test mean the same thing
// as the dot cards of the scale training (SCALE_BRIDGE in stimuli.js). The 5
// dot cards are shown above the 5 Zarpie panels (a neutral Zarpie), both in
// the child's scale order; as the voice names each one, its card and its
// panel enlarge together, the others fading; then the study moves on to the
// test by itself. Comes after the training videos (generic and specific
// conditions) or right after the task intro (baseline).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import { SCALE_BRIDGE as B, SCALE_TRAINING, scaleOptions, stimulusUrl } from './stimuli'

const CLIP_GAP_MS = 300

const api = useViewAPI()
const direction = api.getConditionByName('scaleDirection')
const OPTIONS = scaleOptions(direction)

// the dot cards of the training, above the Zarpie panels of the test
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

// 'intro' -> 'panels' (one by one) -> 'outro' -> next view
const phase = ref('intro')
const panelIndex = ref(0)
const highlight = computed(() => (phase.value === 'panels' ? OPTIONS[panelIndex.value].id : null))
let gapTimer = null

const audioSrc = computed(() => {
  if (phase.value === 'intro') return stimulusUrl(B.intro.audio)
  if (phase.value === 'panels') return stimulusUrl(B.panels[OPTIONS[panelIndex.value].id].audio)
  if (phase.value === 'outro') return stimulusUrl(B.outro.audio)
  return null
})

function onAudioEnded() {
  clearTimeout(gapTimer)
  gapTimer = setTimeout(() => {
    if (phase.value === 'intro') phase.value = 'panels'
    else if (phase.value === 'panels' && panelIndex.value < OPTIONS.length - 1) panelIndex.value += 1
    else if (phase.value === 'panels') phase.value = 'outro'
    else finish()
  }, CLIP_GAP_MS)
}

function finish() {
  api.recordPageData({ scaleDirection: direction, completed: phase.value === 'outro' })
  api.goNextView()
}

onMounted(() => {
  phase.value = 'intro'
  panelIndex.value = 0
})
onBeforeUnmount(() => clearTimeout(gapTimer))

api.setAutofill(() => {
  api.recordPageData({ scaleDirection: direction, completed: 'autofilled' })
  api.goNextView()
})
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="audioSrc" @ended="onAudioEnded()" />

    <p class="text-2xl font-medium mb-3">{{ B.intro.text }}</p>

    <!-- the dot cards of the training, and under them the Zarpie panels of
         the test; the named one enlarges in both rows -->
    <div class="w-full flex-1 min-h-0 px-4 pt-2 pb-2">
      <HotSpots
        :options="cards"
        :columns="5"
        :labelLines="1"
        :margin="10"
        :gap="12"
        :disabled="true"
        :highlight="highlight"
        dimOthers
      />
    </div>
    <div class="w-full flex-1 min-h-0 px-4 pt-2 pb-8">
      <HotSpots
        :options="panels"
        :columns="5"
        :labelLines="2"
        :margin="10"
        :gap="12"
        :disabled="true"
        :highlight="highlight"
        dimOthers
      />
    </div>
  </ChildStage>
</template>

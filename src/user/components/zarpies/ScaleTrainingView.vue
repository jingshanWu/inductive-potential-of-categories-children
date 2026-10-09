<script setup>
// Scale training for the child, the first thing after "Let's get started!"
// (before Zarpies are introduced, as in Rhodes & Liebenson, 2015): the lab's
// warm-up for the 5-point scale (wording and pictures in SCALE_TRAINING,
// stimuli.js). In order:
//   1. intro: the 5 dot cards (1 / 3 / 5 / 7 / 9 dots) are introduced one by
//      one, each enlarging (the others fading) as the voice names it, in the
//      order of the scale on screen (the counterbalanced scaleDirection).
//   2. practice: 5 questions about kids, one per card. After each question
//      the cards are read in one breath ("Only one. A few. Some. Most. Or
//      all."), each enlarging as its word comes; then the child clicks a
//      card. Right: the voice confirms while the card keeps its clicked look
//      (popped, the others faded), then the next question. Wrong: the lab's
//      gentle correction ("You think most kids like to go swimming? That's a
//      good answer. But you know what, ... so can you click the card that
//      shows ...?"); the right card enlarges while it is named, goes back to
//      its size, and the child clicks again until they click the right one.
//      Every click is recorded.
//   3. end: "Great! Now let's begin." and on to the next view by itself.
// Steps (Smile): 'intro', 'practice' with one step per item, 'end'; after a
// reload the page starts its current step again. Cards are hot spots
// (HotSpots.vue); sound is AutoplayAudio.vue, one clip after another (a
// queue). The page is a ChildStage: no scrolling.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import { SCALE_TRAINING as T, inductionAssetUrls, scaleOptions, stimulusUrl } from './stimuli'

// silence between two clips
const CLIP_GAP_MS = 300
// after a correction: the right card has shrunk back for this long before the child may click
const POINT_BACK_MS = 400

const api = useViewAPI()

const direction = api.getConditionByName('scaleDirection')
const OPTIONS = scaleOptions(direction) // the scale in its on-screen order
const LABELS = { one: 'Only one', few: 'A few', some: 'Some', most: 'Most', all: 'All' }

const steps = api.steps.append([{ id: 'intro' }, { id: 'practice' }, { id: 'end' }])
steps[1].append(
  T.items.map((it) => ({
    id: it.id,
    correct: it.correct,
    clicks: [], // the cards clicked, in order (the last one is the right one)
    firstTry: null, // was the first click right?
    rt: null, // ms from the cards becoming clickable to the first click
    scaleDirection: direction,
  }))
)
// the current practice item is looked up by id (steps are saved per child
// when first built, so stimuli.js changes would not show otherwise)
api.updateStepper()

const section = computed(() => api.path[0]) // 'intro' | 'practice' | 'end'
const ITEMS = Object.fromEntries(T.items.map((it) => [it.id, it]))
const item = computed(() => (section.value === 'practice' ? ITEMS[api.stepData.id] : null))

// within the intro: 'intro' (the first sentence) -> 'cards' (one by one)
// -> 'practiceIntro' (its sentence appears under the first one);
// within a practice item: 'ask' -> 'respond' -> 'feedback' (-> 'respond' ...)
const phase = ref('intro')
const cardIndex = ref(0) // which card is being introduced
const highlight = ref(null) // the enlarged card
const clickable = ref(false)
const clicks = ref(0) // wrong clicks on the current item, for rebuilding the cards

// the cards are rebuilt after a wrong click, so that the
// faded cards give way to the right card enlarging; after a right click they
// keep the look of the click while the voice confirms
const hotspotsKey = computed(() => `${section.value}-${api.stepIndex}-${clicks.value}`)

// the 5 dot cards, in the scale's order
const cards = computed(() =>
  OPTIONS.map((o) => ({ id: o.id, label: LABELS[o.id], panel: { image: stimulusUrl(T.dot), count: o.count } }))
)
// the clip that reads the cards after a question, and when each word starts
const OPTIONS_CLIP = T.options[direction]

// clips are played one after another from this queue; `then` runs when it is empty
const queue = ref([])
let then = null
let gapTimer = null
const audioSrc = computed(() => (queue.value.length ? queue.value[0] : null))
function play(paths, done) {
  queue.value = paths.map(stimulusUrl)
  then = done
}
function onAudioEnded() {
  clearTimeout(gapTimer)
  gapTimer = setTimeout(() => {
    queue.value = queue.value.slice(1)
    if (!queue.value.length && then) {
      const f = then
      then = null
      f()
    }
  }, CLIP_GAP_MS)
}

// every step starts from its first clip (also after a page reload)
watch(
  () => api.stepIndex,
  () => {
    clearTimeout(gapTimer)
    queue.value = []
    then = null
    highlight.value = null
    clickable.value = false
    clicks.value = 0
    if (section.value === 'intro') startIntro()
    else if (section.value === 'practice') ask()
    else startEnd()
  },
  { immediate: true }
)

// 1. intro, then the cards one by one
function startIntro() {
  phase.value = 'intro'
  play([T.intro.audio], () => {
    phase.value = 'cards'
    cardIndex.value = 0
    introduceCard()
  })
}
function introduceCard() {
  const option = OPTIONS[cardIndex.value]
  highlight.value = option.id
  play([T.cards[option.id].audio], () => {
    if (cardIndex.value < OPTIONS.length - 1) {
      cardIndex.value += 1
      introduceCard()
    } else {
      highlight.value = null
      phase.value = 'practiceIntro'
      play([T.practiceIntro.audio], () => api.goNextStep())
    }
  })
}

// 2. practice: one step per item
function ask() {
  phase.value = 'ask'
  highlight.value = null
  clickable.value = false
  play([item.value.question.audio], readOptions)
}
// the cards are read in one clip; each enlarges as its word comes (onAudioTime)
function readOptions() {
  phase.value = 'options'
  highlight.value = OPTIONS[0].id
  play([OPTIONS_CLIP.audio], () => {
    highlight.value = null
    phase.value = 'respond'
    clickable.value = true
  })
}
function onAudioTime(seconds) {
  if (phase.value !== 'options') return
  const i = OPTIONS_CLIP.cues.filter((t) => seconds >= t).length - 1
  if (i >= 0) highlight.value = OPTIONS[i].id
}
function onChoose({ id, rt }) {
  if (!clickable.value) return
  clickable.value = false
  api.stepData.clicks = [...api.stepData.clicks, id]
  if (api.stepData.firstTry === null) {
    api.stepData.firstTry = id === item.value.correct
    api.stepData.rt = rt
  }
  phase.value = 'feedback'
  if (id === item.value.correct) {
    // the cards keep the look of the click (the chosen one popped, the others
    // faded) while the voice confirms
    play([item.value.right.audio], () => {
      api.recordStep()
      api.goNextStep()
    })
  } else {
    clicks.value += 1 // rebuild the cards: the wrong click's faded look goes
    // the lab's correction: acknowledge, then say what is right and ask for
    // that card; the right card enlarges while it is named, then goes back to
    // its size, and the child clicks
    play([item.value.youThink[id].audio, T.wrongGood.audio], () => {
      highlight.value = item.value.correct
      play([item.value.wrongRest.audio], () => {
        highlight.value = null
        setTimeout(() => {
          phase.value = 'respond'
          clickable.value = true
        }, POINT_BACK_MS)
      })
    })
  }
}

// 3. end
function startEnd() {
  phase.value = 'end'
  play([T.end.audio], finish)
}

function finish() {
  api.recordPageData({ scaleDirection: direction })
  api.goNextView()
}

// fetch the clips and pictures of the task now, so none has to wait for the network later
onMounted(() => {
  for (const url of inductionAssetUrls()) fetch(url).catch(() => {})
})

onBeforeUnmount(() => clearTimeout(gapTimer))

api.setAutofill(() => {
  clearTimeout(gapTimer)
  while (api.stepIndex < api.nSteps - 1) {
    if (section.value === 'practice') {
      api.stepData.clicks = ['autofilled']
      api.recordStep()
    }
    api.goNextStep()
  }
  finish()
})
</script>

<template>
  <ChildStage class="flex flex-col items-center p-4 text-center">
    <AutoplayAudio :src="audioSrc" @time="onAudioTime($event)" @ended="onAudioEnded()" />

    <!-- what the voice is saying -->
    <div v-if="section === 'intro'" class="mb-3">
      <p class="text-2xl font-medium">{{ T.intro.text }}</p>
      <!-- the second sentence appears under the first when its clip starts -->
      <p v-if="phase === 'practiceIntro'" class="text-2xl font-medium mt-1">{{ T.practiceIntro.text }}</p>
    </div>
    <template v-else-if="section === 'practice'">
      <p class="text-2xl font-medium mb-3">{{ item.question.text }}</p>
      <!-- the picture that goes with the question (the hand) -->
      <div v-if="item.image" class="h-[26vh] mb-2 flex items-center justify-center">
        <img :src="stimulusUrl(item.image)" alt="" draggable="false" class="max-h-full select-none" />
      </div>
    </template>
    <p v-else class="text-3xl font-medium mb-3">{{ T.end.text }}</p>

    <!-- the 5 cards (dots) -->
    <div v-if="phase !== 'end'" class="w-full flex-1 min-h-0 px-4 pt-4 pb-8">
      <HotSpots
        :key="hotspotsKey"
        :options="cards"
        :columns="5"
        :labelLines="2"
        :margin="12"
        :gap="12"
        :disabled="!clickable"
        :highlight="highlight"
        :dimOthers="phase === 'cards'"
        @choose="onChoose"
      />
    </div>
  </ChildStage>
</template>

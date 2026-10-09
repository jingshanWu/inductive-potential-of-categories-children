<script setup>
/**
 * HotSpots Component
 *
 * WHAT IT IS
 * - A picture-choice response for children, who cannot click precisely.
 * - Each choice sits inside an invisible square that is a little bigger than
 *   the choice. A click or tap anywhere inside the square picks that choice.
 * - One square per choice, each a different answer. Squares never touch, and
 *   a click in the gap between them does nothing.
 * - A choice can be a picture, a picture with text under it, text only
 *   (shown in an outlined box, e.g. as a placeholder until a picture exists),
 *   or a panel of several copies of one picture (a "how many" scale).
 * - Choices are scaled up to fill the space the component is given.
 * - The first click is final: the picked choice pops, the rest fade, and
 *   further clicks are ignored.
 * - A choice can be enlarged from outside to point at it (e.g. while a voice
 *   reads the choices one by one).
 * - Named after the Qualtrics "Hot Spot" question, but the squares are made
 *   automatically from the list of choices (nothing is drawn by hand).
 *
 * HOW IT IS USED
 * - Put it inside an element that has a width and a height; it fills that box.
 *
 *     <div class="w-full h-[60vh]">
 *       <HotSpots :options="options" :disabled="videoPlaying" @choose="onChoose" />
 *     </div>
 *
 * - options: one entry per choice, in display order. `id` is the answer that
 *   gets reported. What the entry contains decides what is shown:
 *     picture only:    { id: 'dog', image: '/stimuli/dog.png' }
 *     picture + text:  { id: 'dog', image: '/stimuli/dog.png', label: 'Dog' }
 *     text only:       { id: 'dog', label: 'Dog' }
 *     panel:           { id: 'some', label: 'Some Zarpies', panel: { image: '/stimuli/cave.png', count: 5 } }
 *   A panel is a white card showing `count` copies of one picture (1, 3, 5,
 *   7 or 9) on a 3 x 3 grid, as in the lab's "how many Zarpies" scale
 *   (Benitez, Leshin & Rhodes, 2022).
 *   Text under a picture sits inside the same square (clicking the text also
 *   picks it) and wraps at the picture's width.
 * - @choose: fires once per trial with { id, index, rt }
 *   (rt = ms from when the squares became clickable to the click).
 * - disabled: true while the child should not answer yet (e.g. a video is
 *   playing). Switching it back to false starts a new trial: the lock is
 *   cleared and the rt clock restarts. (Or give it a new :key per trial.)
 * - highlight: the id of one choice to enlarge, e.g. highlight="dog". Default
 *   is none. Change it to enlarge the choices one at a time; set it back to
 *   null to stop.
 * - dimOthers: with a highlight, also fade the other choices (as after a
 *   click), to point at the enlarged one more clearly. Default false.
 * - Optional sizes: margin (px between a choice and the edge of its square,
 *   default 24), gap (px between squares, default 24), columns (choices per
 *   row; default picks whatever makes the pictures biggest), labelLines (lines
 *   of text to leave room for under a picture, default 1; longer text is cut
 *   off), feedbackMs (how long the picked choice is shown before @choose
 *   fires, default 500).
 */

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

const props = defineProps({
  options: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  highlight: { type: String, default: null },
  dimOthers: { type: Boolean, default: false },
  margin: { type: Number, default: 24 },
  gap: { type: Number, default: 24 },
  columns: { type: Number, default: 0 },
  labelLines: { type: Number, default: 1 },
  feedbackMs: { type: Number, default: 500 },
})

const emit = defineEmits(['choose'])

const box = ref(null)
const { width, height } = useElementSize(box)

// width / height of each picture, filled in as the pictures load.
// Text-only choices are square; panels are portrait cards.
const PANEL_RATIO = 0.72
const ratios = reactive({})
const ratioOf = (id) => ratios[id] || 1
const ratioFor = (option) => (option.panel ? PANEL_RATIO : ratioOf(option.id))

// where the copies sit on a panel's 3 x 3 grid, by count (row, col from the
// top left), copied from the 2022 study's slides
const PANEL_CELLS = {
  1: [[2, 0]],
  3: [
    [0, 0],
    [1, 2],
    [2, 0],
  ],
  5: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
  ],
  7: [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  9: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
}
const panelCells = (count) => PANEL_CELLS[count] || PANEL_CELLS[9].slice(0, count)

function onImageLoad(id, event) {
  const { naturalWidth, naturalHeight } = event.target
  if (naturalWidth && naturalHeight) ratios[id] = naturalWidth / naturalHeight
}

// px set aside under every picture for its text, if any picture has a label
const LABEL_LINE_HEIGHT = 26
const LABEL_PADDING = 14
const labelHeight = computed(() =>
  props.options.some((o) => (o.image || o.panel) && o.label) ? LABEL_PADDING + LABEL_LINE_HEIGHT * props.labelLines : 0
)

// largest size a picture with the given ratio can take inside a w x h box
function fit(ratio, w, h) {
  return w / h > ratio ? { w: h * ratio, h } : { w, h: w / ratio }
}

// split the box into equal cells, choosing the number of columns that makes
// the smallest picture as big as possible
const layout = computed(() => {
  const n = props.options.length
  if (!n || !width.value || !height.value) return null
  const candidates = props.columns > 0 ? [Math.min(props.columns, n)] : Array.from({ length: n }, (_, i) => i + 1)
  let best = null
  for (const cols of candidates) {
    const rows = Math.ceil(n / cols)
    const cellW = Math.floor((width.value - props.gap * (cols - 1)) / cols)
    const cellH = Math.floor((height.value - props.gap * (rows - 1)) / rows)
    const innerW = cellW - 2 * props.margin
    const innerH = cellH - 2 * props.margin - labelHeight.value
    if (innerW <= 0 || innerH <= 0) continue
    const smallest = Math.min(
      ...props.options.map((o) => {
        const size = fit(ratioFor(o), innerW, innerH)
        return size.w * size.h
      })
    )
    if (!best || smallest > best.smallest) best = { cellW, cellH, innerW, innerH, smallest }
  }
  return best
})

const cellStyle = computed(() => ({ width: `${layout.value.cellW}px`, height: `${layout.value.cellH}px` }))

// the invisible square: the scaled picture (and its text) plus the margin on
// every side. A text-only choice takes the room of a picture and its text.
function contentSize(option) {
  const strip = option.image || option.panel ? labelHeight.value : 0
  const size = fit(ratioFor(option), layout.value.innerW, layout.value.innerH + labelHeight.value - strip)
  return { w: Math.floor(size.w), h: Math.floor(size.h), strip }
}

function zoneStyle(option) {
  const size = contentSize(option)
  return {
    width: `${size.w + 2 * props.margin}px`,
    height: `${size.h + size.strip + 2 * props.margin}px`,
    padding: `${props.margin}px`,
  }
}

// text-only choices: the text grows and shrinks with its box
function textOnlyStyle(option) {
  const fontSize = Math.max(12, Math.min(28, Math.floor(contentSize(option).w / 7)))
  return { fontSize: `${fontSize}px`, lineHeight: 1.2 }
}

const labelStyle = computed(() => ({
  height: `${labelHeight.value}px`,
  paddingTop: `${LABEL_PADDING}px`,
  lineHeight: `${LABEL_LINE_HEIGHT}px`,
}))

const chosen = ref(null)
const active = computed(() => !props.disabled && chosen.value === null)
let startTime = 0
let feedbackTimer = null

watch(
  () => props.disabled,
  (isDisabled) => {
    if (isDisabled) return
    chosen.value = null
    startTime = performance.now()
  },
  { immediate: true }
)

function choose(option, index) {
  if (!active.value) return
  const rt = Math.round(performance.now() - startTime)
  chosen.value = option.id
  feedbackTimer = setTimeout(() => emit('choose', { id: option.id, index, rt }), props.feedbackMs)
}

onBeforeUnmount(() => clearTimeout(feedbackTimer))
</script>

<template>
  <div ref="box" class="w-full h-full flex flex-wrap justify-center content-center" :style="{ gap: `${gap}px` }">
    <template v-if="layout">
      <div
        v-for="(option, index) in options"
        :key="option.id"
        class="flex items-center justify-center"
        :style="cellStyle"
      >
        <button
          type="button"
          class="relative flex flex-col bg-transparent border-0 transition duration-300"
          :class="{
            'cursor-pointer': active,
            'scale-105': chosen === option.id,
            'opacity-30':
              (chosen !== null && chosen !== option.id) ||
              (dimOthers && chosen === null && highlight !== null && highlight !== option.id),
            'scale-[1.15] z-10': chosen === null && highlight === option.id,
          }"
          :style="zoneStyle(option)"
          :disabled="!active"
          :aria-label="option.label || option.id"
          @click="choose(option, index)"
        >
          <!-- picture, with optional text under it -->
          <template v-if="option.image">
            <img
              :src="option.image"
              alt=""
              draggable="false"
              class="w-full flex-1 min-h-0 object-contain select-none pointer-events-none"
              @load="onImageLoad(option.id, $event)"
            />
            <span
              v-if="labelHeight"
              class="block shrink-0 w-full overflow-hidden text-xl font-medium text-center select-none"
              :style="labelStyle"
            >
              {{ option.label }}
            </span>
          </template>

          <!-- panel: `count` copies of one picture on a 3 x 3 grid, with optional text under it -->
          <template v-else-if="option.panel">
            <span
              class="grid flex-1 min-h-0 w-full grid-cols-3 grid-rows-3 gap-1 p-2 overflow-hidden rounded-md border border-border bg-white shadow-md"
            >
              <!-- each copy sits absolutely inside its grid cell, so the pictures'
                   natural size can never stretch the panel into the text below -->
              <span
                v-for="([row, col], i) in panelCells(option.panel.count)"
                :key="i"
                class="relative block min-h-0 min-w-0"
                :style="{ gridRow: row + 1, gridColumn: col + 1 }"
              >
                <img
                  :src="option.panel.image"
                  alt=""
                  draggable="false"
                  class="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                />
              </span>
            </span>
            <span
              v-if="labelHeight"
              class="block shrink-0 w-full overflow-hidden text-xl font-medium text-center select-none"
              :style="labelStyle"
            >
              {{ option.label }}
            </span>
          </template>

          <!-- text only: an outlined box where the picture would be -->
          <span
            v-else
            class="flex items-center justify-center w-full h-full p-2 overflow-hidden rounded-xl border-2 border-muted-foreground bg-background font-medium text-center select-none"
            :style="textOnlyStyle(option)"
          >
            {{ option.label || option.id }}
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

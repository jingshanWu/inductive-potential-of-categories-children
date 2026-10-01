<script setup>
/**
 * HotSpots Component
 *
 * WHAT IT IS
 * - A picture-choice response for children, who cannot click precisely.
 * - Each picture sits inside an invisible square that is a little bigger than
 *   the picture. A click or tap anywhere inside the square picks that picture.
 * - One square per picture, each a different answer. Squares never touch, and
 *   a click in the gap between them does nothing.
 * - Pictures are scaled up to fill the space the component is given.
 * - The first click is final: the picked picture pops, the rest fade, and
 *   further clicks are ignored.
 * - Named after the Qualtrics "Hot Spot" question, but the squares are made
 *   automatically from the list of pictures (nothing is drawn by hand).
 *
 * HOW IT IS USED
 * - Put it inside an element that has a width and a height; it fills that box.
 *
 *     <div class="w-full h-[60vh]">
 *       <HotSpots :options="options" :disabled="videoPlaying" @choose="onChoose" />
 *     </div>
 *
 * - options: one entry per picture, in display order.
 *     [{ id: 'dog', image: '/stimuli/dog.png' }, { id: 'cow', image: '/stimuli/cow.png' }]
 *   `id` is the answer that gets reported; `image` is the picture's URL.
 * - Optional word under a picture: add `label` to its entry, e.g.
 *     { id: 'dog', image: '/stimuli/dog.png', label: 'Dog' }
 *   The word sits inside the same square, so clicking the word also picks it.
 *   Entries without `label` stay picture-only.
 * - @choose: fires once per trial with { id, index, rt }
 *   (rt = ms from when the squares became clickable to the click).
 * - disabled: true while the child should not answer yet (e.g. a video is
 *   playing). Switching it back to false starts a new trial: the lock is
 *   cleared and the rt clock restarts. (Or give it a new :key per trial.)
 * - Optional sizes: margin (px between a picture and the edge of its square,
 *   default 24), gap (px between squares, default 24), columns (pictures per
 *   row; default picks whatever makes the pictures biggest),
 *   feedbackMs (how long the picked picture is shown before @choose fires,
 *   default 500).
 */

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

const props = defineProps({
  options: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  margin: { type: Number, default: 24 },
  gap: { type: Number, default: 24 },
  columns: { type: Number, default: 0 },
  feedbackMs: { type: Number, default: 500 },
})

const emit = defineEmits(['choose'])

const box = ref(null)
const { width, height } = useElementSize(box)

// width / height of each picture, filled in as the pictures load
const ratios = reactive({})
const ratioOf = (id) => ratios[id] || 1

function onImageLoad(id, event) {
  const { naturalWidth, naturalHeight } = event.target
  if (naturalWidth && naturalHeight) ratios[id] = naturalWidth / naturalHeight
}

// px set aside under every picture for its word, if any entry has a label
const LABEL_HEIGHT = 40
const labelHeight = computed(() => (props.options.some((o) => o.label) ? LABEL_HEIGHT : 0))

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
        const size = fit(ratioOf(o.id), innerW, innerH)
        return size.w * size.h
      })
    )
    if (!best || smallest > best.smallest) best = { cellW, cellH, innerW, innerH, smallest }
  }
  return best
})

const cellStyle = computed(() => ({ width: `${layout.value.cellW}px`, height: `${layout.value.cellH}px` }))

// the invisible square: the scaled picture (and its word) plus the margin on
// every side
function zoneStyle(option) {
  const size = fit(ratioOf(option.id), layout.value.innerW, layout.value.innerH)
  return {
    width: `${Math.floor(size.w) + 2 * props.margin}px`,
    height: `${Math.floor(size.h) + labelHeight.value + 2 * props.margin}px`,
    padding: `${props.margin}px`,
  }
}

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
          class="flex flex-col bg-transparent border-0 transition duration-150"
          :class="{
            'cursor-pointer': active,
            'scale-105': chosen === option.id,
            'opacity-30': chosen !== null && chosen !== option.id,
          }"
          :style="zoneStyle(option)"
          :disabled="!active"
          :aria-label="option.label || option.id"
          @click="choose(option, index)"
        >
          <img
            :src="option.image"
            alt=""
            draggable="false"
            class="w-full flex-1 min-h-0 object-contain select-none pointer-events-none"
            @load="onImageLoad(option.id, $event)"
          />
          <span
            v-if="labelHeight"
            class="flex shrink-0 items-end justify-center w-full text-xl font-medium leading-none whitespace-nowrap select-none"
            :style="{ height: `${labelHeight}px` }"
          >
            {{ option.label }}
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

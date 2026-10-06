<script setup>
/**
 * ScaleToFit Component
 *
 * WHAT IT IS
 * - Shrinks (or enlarges) what is inside it, like a slide, so that all of it
 *   fits the space the component is given, whatever the window size. Nothing
 *   is cut off and nothing needs scrolling.
 * - The content is laid out at a fixed width (`width`, in px) and its own
 *   height; the whole thing is then scaled to the largest size that fits,
 *   and centred.
 *
 * HOW IT IS USED
 * - Put it inside an element that has a width and a height (e.g. a
 *   ChildStage); it fills that box.
 *
 *     <ChildStage class="p-4">
 *       <ScaleToFit :width="1000"> ... </ScaleToFit>
 *     </ChildStage>
 *
 * - maxScale (default 1.5): the content is never enlarged beyond this.
 * - Do not put anything inside it that covers the whole page (such as
 *   AutoplayAudio's Play button): it would be scaled and misplaced.
 */

import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'

const props = defineProps({
  width: { type: Number, default: 1000 },
  maxScale: { type: Number, default: 1.5 },
})

const box = ref(null)
const content = ref(null)
const { width: boxWidth, height: boxHeight } = useElementSize(box)
const { height: contentHeight } = useElementSize(content)

const scale = computed(() => {
  if (!boxWidth.value || !boxHeight.value || !contentHeight.value) return 1
  return Math.min(boxWidth.value / props.width, boxHeight.value / contentHeight.value, props.maxScale)
})

// centred: the scaled content is placed by its top left corner
const style = computed(() => ({
  width: `${props.width}px`,
  left: `${Math.max(0, (boxWidth.value - props.width * scale.value) / 2)}px`,
  top: `${Math.max(0, (boxHeight.value - contentHeight.value * scale.value) / 2)}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
}))
</script>

<template>
  <div ref="box" class="relative w-full h-full overflow-hidden">
    <div ref="content" class="absolute" :style="style">
      <slot />
    </div>
  </div>
</template>

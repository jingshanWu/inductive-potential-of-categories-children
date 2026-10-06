<script setup>
/**
 * ChildStage Component
 *
 * WHAT IT IS
 * - The page frame for the parts of the study the child does alone (task
 *   intro, training videos, test).
 * - It is exactly as tall as the visible page under the study's top bar, so
 *   everything in it is on screen at once, whatever the window size.
 * - While it is on the page, the page cannot be scrolled (mouse wheel,
 *   trackpad, arrow keys, space bar). Scrolling comes back by itself on the
 *   next page (e.g. the parent form), and it is never switched off on the
 *   parent's pages (consent, sound check, ...), which do not use this frame.
 * - It also works inside developer mode's device frame, where the "page" is
 *   the frame, not the browser window.
 *
 * HOW IT IS USED
 * - Make it the outermost element of the view, and size what is inside with
 *   h-full / flex-1 (not with vh units: the stage already has the height).
 *
 *     <ChildStage class="flex flex-col items-center p-4">
 *       ...
 *     </ChildStage>
 *
 * - Whatever does not fit is cut off rather than scrolled to, so leave a
 *   little room around anything that grows (e.g. an enlarged choice).
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'

const stage = ref(null)
const height = ref(0)

let scroller = null // the element that scrolls the page; null = the browser window
let savedOverflow = ''
let observer = null

// the nearest ancestor that scrolls its content (developer mode's device
// frame), or null if the browser window itself scrolls (the real study)
function findScroller(el) {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return node
  }
  return null
}

// fill the visible page from the top of the stage down to the bottom edge
function measure() {
  if (!stage.value) return
  const top = stage.value.getBoundingClientRect().top
  const bottom = scroller ? scroller.getBoundingClientRect().top + scroller.clientHeight : window.innerHeight
  height.value = Math.max(0, Math.floor(bottom - top))
}

onMounted(() => {
  scroller = findScroller(stage.value)
  const target = scroller || document.documentElement
  savedOverflow = target.style.overflow
  target.style.overflow = 'hidden'
  if (scroller) scroller.scrollTop = 0
  else window.scrollTo(0, 0)

  measure()
  window.addEventListener('resize', measure)
  observer = new ResizeObserver(measure)
  observer.observe(target)
  observer.observe(document.body)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  if (observer) observer.disconnect()
  const target = scroller || document.documentElement
  target.style.overflow = savedOverflow
})
</script>

<template>
  <div ref="stage" class="w-full overflow-hidden" :style="{ height: `${height}px` }">
    <slot />
  </div>
</template>

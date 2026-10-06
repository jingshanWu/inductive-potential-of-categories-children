<script setup>
/**
 * CdscBox Component
 *
 * WHAT IT IS
 * - The box the lab's pages for parents sit in (welcome, sound check, intro,
 *   consent, mouse instructions): a light panel of one constant size, centred
 *   in a page that cannot be scrolled (ChildStage). Everything the page shows
 *   is inside the box, buttons included.
 * - The content is scaled down, like a slide, if it would not fit the box
 *   (ScaleToFit); it is never enlarged, so pages look the same on every
 *   screen. The buttons in the footer are not scaled: they keep one size on
 *   every page.
 * - The child's own pages (from "Let's get started!" on) do not use a box.
 *
 * HOW IT IS USED
 *     <CdscBox>
 *       <template #outside> <AutoplayAudio ... /> </template>  (optional)
 *       ... the page ...
 *       <template #footer> <Button>Next</Button> </template>   (optional)
 *     </CdscBox>
 *
 * - default slot: the page, laid out WIDTH px wide (minus the padding) and
 *   scaled to fit the room above the footer.
 * - footer: buttons, centred in a row at the bottom of the box, not scaled.
 * - outside: anything that must not be scaled or boxed, e.g. a sound player
 *   whose Play button covers the whole page.
 */

import ChildStage from './ChildStage.vue'
import ScaleToFit from './ScaleToFit.vue'

// the box, in px: fits the lab's minimum window (1000 x 600) with a margin
const WIDTH = 960
const HEIGHT = 540
const PADDING = 20
</script>

<template>
  <ChildStage class="flex items-center justify-center p-4">
    <slot name="outside" />
    <div
      class="relative flex flex-col rounded-xl bg-muted"
      :style="{ width: `${WIDTH}px`, height: `${HEIGHT}px`, padding: `${PADDING}px` }"
    >
      <div class="flex-1 min-h-0">
        <ScaleToFit :width="WIDTH - 2 * PADDING" :maxScale="1">
          <slot />
        </ScaleToFit>
      </div>
      <div v-if="$slots.footer" class="relative shrink-0 flex items-center justify-center gap-4 pt-4">
        <slot name="footer" />
      </div>
    </div>
  </ChildStage>
</template>

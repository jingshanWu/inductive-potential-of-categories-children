<script setup>
/**
 * CDSC default welcome page (first page of a PANDA study)
 *
 * The lab's standard "Thanks for joining us!" page for parents: turn the
 * sound on, go full screen, scroll the webcam image out of view. It takes the
 * place of Smile's default welcome (builtins/advertisement/AdvertisementView.vue,
 * which is left as it came) and works the same way: the "I'm ready!" button
 * preloads the study's media and moves to the next view.
 *
 * Use it in design.js for the welcome_anonymous / welcome_referred views:
 *   import WelcomeView from '@/builtins/cdsc_default/WelcomeView.vue'
 *
 * Media in public/ (not in src/user/assets) is not covered by Smile's
 * preloading. Give the page a `preload` prop, a function returning the urls
 * to fetch, and they are fetched as soon as the page is shown, so that they
 * are in the browser's cache by the time the child needs them:
 *   timeline.pushSeqView({ ..., component: WelcomeView, props: { preload: () => urls } })
 */

// import Vue functions
import { onMounted, ref, onBeforeUnmount } from 'vue'

// import and initialize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// import UIkit components
import { Button } from '@/uikit/components/ui/button'
import CdscBox from '@/uikit/layouts/CdscBox.vue'

// animation library
import { animate } from 'motion'

const props = defineProps({
  preload: { type: Function, default: null }, // returns the urls to fetch ahead of time
})

let timer // waits before doing animation
let clicked = false // has the button been clicked?
const button = ref(null) // reference to button

/**
 * Wiggles the button with a rotation animation if it hasn't been clicked yet
 * This provides a fun interactive element to draw attention to the button
 */
function wiggle() {
  if (!clicked && button.value) {
    animate(button.value.$el, { rotate: [0, 60, -60, 60, -60, 0] }, { duration: 0.75 }).finished.then(() => {
      timer = setTimeout(wiggle, 15000) // Reinitialize the timer after animation
    })
  }
}

/**
 * Lifecycle hook: Sets up the initial wiggle timer when component mounts
 */
onMounted(() => {
  if (props.preload) for (const url of props.preload()) fetch(url).catch(() => {})
  timer = setTimeout(wiggle, 3000)
})

/**
 * Handles the completion of the advertisement view
 * Preloads all media assets and navigates to the next view
 */
function finish() {
  clicked = true
  api.preloadAllImages()
  api.preloadAllVideos()
  api.goNextView()
}

/**
 * Lifecycle hook: Cleans up the timer when component unmounts
 */
onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <!-- the lab's constant-size box: everything inside it, no scrolling -->
  <CdscBox>
    <!-- The lab's standard PANDA first page ("Thanks for joining us!",
         Set Up/1-First Block/setupnew.jpeg), rebuilt as text so it can be
         edited; the mascot is cropped from panda.png in the same folder -->
    <div class="flex flex-col items-center px-6 py-2">
      <h1 ref="title" class="text-5xl font-bold text-center mb-3">Thanks for joining us!</h1>
      <p class="text-2xl text-center mb-10">For the best study experience, please do the following:</p>

      <div class="w-full flex items-center gap-6">
        <ol class="flex-1 text-left text-3xl space-y-8">
          <li>1. Make sure your <b>sound is on</b>.</li>
          <li>2. Enlarge your window to <b>full screen.</b></li>
          <li>3. <b>Scroll up</b> so that your webcam image is not in view.</li>
        </ol>
        <img
          src="@/assets/cdsc_default/panda_mascot.png"
          alt=""
          draggable="false"
          class="w-[130px] shrink-0 select-none"
        />
      </div>
    </div>

    <template #footer>
      <!-- Call-to-action button -->
      <Button ref="button" id="begintask" @click="finish()" size="lg">
        I'm ready!
        <i-lucide-arrow-right />
      </Button>
    </template>
  </CdscBox>
</template>

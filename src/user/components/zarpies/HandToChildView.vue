<script setup>
// Hand-over page, shown to the parent after the sound check: asks them to get
// their child in front of the screen, then help the child click Start. The
// next view (the task intro video) plays automatically; the Start click is
// also what lets the browser play the child's videos with sound.
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

const api = useViewAPI()

function start() {
  api.goNextView()
}

api.setAutofill(start)
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <div class="text-center w-[90%]">
      <h1 class="text-2xl font-bold mb-6">Great! We are now ready for your child to join us!</h1>
      <p class="text-lg mb-4">
        Please have your child sit in front of the computer, and make sure they are looking at the screen and can hear
        the sound.
      </p>
      <!-- replaced 2026-10-02 by the lab's standard PANDA wording below
      <p class="text-lg mb-4">
        Please let your child make all the choices on their own. There are no right or wrong answers, so please do not
        help or give hints.
      </p>
      -->
      <!-- the lab's standard PANDA text (the "mouse click info" page), word for word -->
      <p class="text-lg mb-4">
        For this activity, we are interested in what your child thinks on their own! If your child knows how to use a
        mouse to click on the computer, please allow them to do the clicking. If your child is unfamiliar with using a
        mouse, they can point to the screen to show their response, and you can do the clicking for them.
      </p>
      <p class="text-lg mb-4">
        We ask that you do not provide your child with any feedback, until after the study is complete. Thank you!
      </p>
      <p class="text-lg mb-8">
        Once your child is in position, please help them click the Start button below. A video will then play for your
        child automatically.
      </p>
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="handtochild-start" @click="start()">
        Start
      </Button>
    </div>
  </ConstrainedTaskWindow>
</template>

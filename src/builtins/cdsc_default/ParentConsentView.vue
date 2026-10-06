<script setup>
// CDSC default parent consent: the lab's standard consent slides (PANDA
// consent and assent slides, version of 2024-12-17), rebuilt in code so they
// can be edited, one slide per page:
//   1-6. the information slides (ConsentSections.vue), with Back / Next
//   7.   the permission slide: the lab's narration for parents (24 s) is
//        played as sound and the parent signs in the signature box
//        (SignatureBox.vue). The Continue button is gray until they have
//        signed, then solid and clickable (they need not wait for the
//        narration to finish; the child, on the next page, must).
//        Clicking it gives consent and moves to the next view (the child's
//        own yes / no, ChildConsentView.vue).
// The signature is saved with the study's data as a small picture, unless
// SAVE_SIGNATURE is false (then only the fact that they signed is saved).
//
// Every page is scaled, like a slide, to fit the window: all of it is on
// screen at once and the page cannot be scrolled (ChildStage.vue,
// ScaleToFit.vue).
//
// In design.js, give the view meta: { requiresConsent: false, setConsented:
// true }. The study-specific parts of the text are in
// src/user/components/consentStudyInfo.js.
import { computed, ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import ScaleToFit from '@/uikit/layouts/ScaleToFit.vue'
import SignatureBox from '@/uikit/components/cdsc/SignatureBox.vue'
import { isFastForward } from '@/uikit/components/cdsc/fastForward'
import ConsentSections, { SECTION_TITLES } from '@/uikit/components/cdsc/ConsentSections.vue'
import ConsentSlide from '@/uikit/components/cdsc/ConsentSlide.vue'
import narration from '@/assets/cdsc_default/consent/consent_parent.m4a'

const api = useViewAPI()

const N_INFO = SECTION_TITLES.length
const page = ref(1) // 1-6 information slides, 7 the permission slide
const heard = ref(false) // the narration on the permission slide has played to the end
const signed = ref(false) // something has been drawn in the signature box
const signature = ref(null)
// the parent may sign and go on without waiting for the narration to finish
const fastForward = isFastForward() // development only: no need to sign
const canContinue = computed(() => signed.value || fastForward)

// keep the drawn signature with the data (a PNG of a few kB), or only that they signed
const SAVE_SIGNATURE = true

function consent() {
  if (!canContinue.value) return
  api.recordPageData({
    consent: true,
    signed: signed.value,
    signature: SAVE_SIGNATURE && signed.value ? signature.value.image() : null,
  })
  api.goNextView()
}

api.setAutofill(() => {
  api.recordPageData({ consent: 'autofilled' })
  api.goNextView()
})
</script>

<template>
  <ChildStage class="p-4">
    <!-- the narration of the permission slide (outside the scaled part, for its Play button) -->
    <AutoplayAudio v-if="page > N_INFO" :src="heard ? null : narration" @ended="heard = true" />

    <!-- 1-6. the information slides -->
    <ScaleToFit v-if="page <= N_INFO" :width="1000">
      <ConsentSlide :title="SECTION_TITLES[page - 1]">
        <div class="min-h-[380px] flex items-center">
          <ConsentSections :section="page" class="w-full" />
        </div>
      </ConsentSlide>
      <!-- Next at the bottom centre, Back at the left -->
      <div class="relative max-w-[980px] mx-auto mt-4 flex justify-center">
        <Button
          v-if="page > 1"
          variant="outline"
          size="lg"
          class="absolute left-0 top-0"
          id="consent-back"
          @click="page -= 1"
        >
          <i-fa6-solid-arrow-left class="mr-2" /> Back
        </Button>
        <Button variant="default" size="lg" id="consent-next" @click="page += 1">
          Next <i-fa6-solid-arrow-right class="ml-2" />
        </Button>
      </div>
    </ScaleToFit>

    <!-- 7. the permission slide -->
    <ScaleToFit v-else :width="1000">
      <ConsentSlide>
        <div class="min-h-[380px] flex flex-col items-center justify-center text-center">
          <p class="bg-[#fdfbdc] text-4xl leading-snug px-6 py-3 mb-7">
            Now, we need the <b class="text-[#5b62e8]">parent or legal guardian</b> and the
            <b class="text-[#8a5be8]">child</b> participating in this study to <b>give us their permission</b> to be a
            part of our research.
          </p>
          <p class="text-2xl mb-7 max-w-[560px]">
            First, we will ask for parents’ permission. Then, on the next slide, we will ask for the kids’!
          </p>
          <p class="text-3xl mb-2">
            <b class="text-[#5b62e8]">Parents:</b> Please <b>sign your name below</b> to consent.
          </p>
          <p class="text-xs max-w-[760px] mb-3">
            *Note: If you or your child <b>does not agree</b> to participate, you can opt out of this study by exiting
            out of your browser. Your webcam will turn off, all video footage recorded up to this point will be deleted,
            and the file will be destroyed.
          </p>

          <div class="w-[640px] mb-4">
            <SignatureBox ref="signature" @change="signed = $event" />
          </div>

          <!-- gray until the parent has signed, then solid and clickable -->
          <Button
            :variant="canContinue ? 'default' : 'secondary'"
            size="lg"
            class="text-xl px-10 py-6"
            :class="{ 'cursor-not-allowed text-muted-foreground': !canContinue }"
            id="consent-agree"
            :disabled="!canContinue"
            @click="consent()"
          >
            Continue <i-fa6-solid-arrow-right class="ml-2" />
          </Button>
        </div>
      </ConsentSlide>
      <div class="max-w-[980px] mx-auto mt-4">
        <Button variant="outline" size="lg" id="consent-back" @click="page -= 1">
          <i-fa6-solid-arrow-left class="mr-2" /> Back
        </Button>
      </div>
    </ScaleToFit>
  </ChildStage>
</template>

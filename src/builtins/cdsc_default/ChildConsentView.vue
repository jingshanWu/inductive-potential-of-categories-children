<script setup>
// CDSC default child consent (assent), shown right after the parent's
// consent: the last of the lab's consent slides (PANDA consent and assent
// slides, version of 2024-12-17), rebuilt in code so it can be edited.
//
// The lab's narration for kids (20 s) is played as sound, then the child
// answers by clicking the big YES or NO (hot spots, see HotSpots.vue), which
// only become clickable once the narration has finished. YES moves on to the
// study. NO ends the study here, as in the lab's Qualtrics version: a closing
// screen tells the family they can exit, and there is no way back. The answer
// is recorded.
//
// The page is scaled, like a slide, to fit the window: all of it is on screen
// at once and the page cannot be scrolled (ChildStage.vue, ScaleToFit.vue).
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import AutoplayAudio from '@/uikit/components/cdsc/AutoplayAudio.vue'
import ChildStage from '@/uikit/layouts/ChildStage.vue'
import ScaleToFit from '@/uikit/layouts/ScaleToFit.vue'
import ConsentSlide from '@/uikit/components/cdsc/ConsentSlide.vue'
import HotSpots from '@/uikit/components/cdsc/HotSpots.vue'
import narration from '@/assets/cdsc_default/consent/consent_child.m4a'
import kidsRaisingHands from '@/assets/cdsc_default/consent/kids_raising_hands.png'
import questionMark from '@/assets/cdsc_default/consent/question_mark.jpg'
import yesImage from '@/assets/cdsc_default/consent/assent_yes.svg'
import noImage from '@/assets/cdsc_default/consent/assent_no.svg'

const api = useViewAPI()

// 'question' (narration, then YES / NO) -> yes -> next view
//                                       -> no  -> 'declined' (the study ends here)
const screen = ref('question')
const spoken = ref(false) // the narration has played to the end

const options = [
  { id: 'yes', image: yesImage },
  { id: 'no', image: noImage },
]

if (!api.persist.isDefined('assentResponses')) {
  api.persist.assentResponses = []
}

function answer({ id, rt }) {
  api.persist.assentResponses = [...api.persist.assentResponses, { response: id, rt }]
  api.recordPageData({ assent: id, responses: api.persist.assentResponses })
  if (id === 'yes') {
    api.goNextView()
  } else {
    api.saveData(true)
    screen.value = 'declined'
  }
}

function autofill() {
  api.recordPageData({ assent: 'autofilled', responses: [] })
  api.goNextView()
}
api.setAutofill(autofill)
</script>

<template>
  <ChildStage class="p-4">
    <!-- the narration (outside the scaled part, for its Play button) -->
    <AutoplayAudio v-if="screen === 'question'" :src="spoken ? null : narration" @ended="spoken = true" />

    <ScaleToFit :width="1000">
      <ConsentSlide>
        <!-- the question -->
        <div v-if="screen === 'question'" class="text-center">
          <p class="inline-block bg-[#fdfbdc] text-4xl px-6 py-2 mb-3">
            Perfect — now, let’s hear from the <b class="text-[#8a5be8]">kids</b>!
          </p>
          <img :src="kidsRaisingHands" alt="" draggable="false" class="mx-auto h-[130px] mb-3" />
          <p class="text-2xl mb-3">
            <b class="text-[#5b62e8]">Kids:</b> Please <b>answer the following question</b> by clicking “<b
              class="text-[#3bd13b]"
              >yes</b
            >” or “<b class="text-[#e8442a]">no</b>”.
          </p>
          <div class="flex items-center justify-center gap-4 mb-1">
            <img :src="questionMark" alt="" draggable="false" class="h-[44px] -rotate-12" />
            <p class="border-2 border-[#3f51a8] bg-[#f3fbf3] text-2xl font-bold px-4 py-1">
              Question: Would you like to do this online activity with us?
            </p>
            <img :src="questionMark" alt="" draggable="false" class="h-[44px] rotate-12" />
          </div>

          <!-- YES / NO become clickable once the narration has finished -->
          <div class="w-full h-[190px]">
            <HotSpots :options="options" :columns="2" :margin="14" :disabled="!spoken" @choose="answer" />
          </div>

          <p class="text-xs max-w-[760px] mx-auto">
            *Note: If you or your child <b>does not agree</b> to participate, you can opt out of this study by exiting
            out of your browser. Your webcam will turn off, all video footage recorded up to this point will be deleted,
            and the file will be destroyed.
          </p>
        </div>

        <!-- the child said no: the study stops here -->
        <div v-else class="min-h-[380px] flex flex-col items-center justify-center text-center">
          <h1 class="text-3xl font-bold mb-6">That's okay! Thank you for your time.</h1>
          <p class="text-xl max-w-[700px]">
            You can now exit out of your browser. Your webcam will turn off, all video footage recorded up to this point
            will be deleted, and the file will be destroyed.
          </p>
        </div>
      </ConsentSlide>
    </ScaleToFit>
  </ChildStage>
</template>

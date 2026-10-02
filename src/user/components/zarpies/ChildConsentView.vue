<script setup>
// Child consent (assent), shown after the parent's consent. Rebuilt in code
// from the slide in the lab's standard PANDA assent video, so the wording can
// be edited (all text is in CHILD_ASSENT in stimuli.js).
//
// The question is read aloud, then the child answers by clicking the big YES
// or NO (hot spots, see HotSpots.vue). YES moves on to the study. NO ends
// the study here, as in the lab's Qualtrics version: a closing screen tells
// the family they can exit, and there is no way back. The answer is recorded.
import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
import AutoplayAudio from './AutoplayAudio.vue'
import HotSpots from './HotSpots.vue'
import { CHILD_ASSENT, stimulusUrl } from './stimuli'

const api = useViewAPI()

// 'question' (audio, then YES / NO) -> yes -> next view
//                                   -> no  -> 'declined' (the study ends here)
const screen = ref('question')
const spoken = ref(false) // the question has been read aloud to the end

const options = CHILD_ASSENT.options.map((option) => ({ id: option.id, image: stimulusUrl(option.image) }))

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
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- the question -->
    <div v-if="screen === 'question'" class="text-center w-[95%]">
      <AutoplayAudio :src="spoken ? null : stimulusUrl(CHILD_ASSENT.audio)" @ended="spoken = true" />

      <h1 class="text-3xl font-bold mb-4">{{ CHILD_ASSENT.heading }}</h1>
      <p class="text-xl mb-4">{{ CHILD_ASSENT.instruction }}</p>
      <p class="text-2xl font-bold mb-2">{{ CHILD_ASSENT.question }}</p>

      <!-- YES / NO become clickable once the question has been read aloud -->
      <div class="w-full h-[250px]">
        <HotSpots :options="options" :columns="2" :disabled="!spoken" @choose="answer" />
      </div>

      <p class="text-xs text-muted-foreground mt-2">{{ CHILD_ASSENT.note }}</p>
    </div>

    <!-- the child said no: the study stops here -->
    <div v-else class="text-center w-[90%]">
      <h1 class="text-2xl font-bold mb-6">That's okay! Thank you for your time.</h1>
      <p class="text-lg mb-8">
        You can now exit out of your browser. Your webcam will turn off, all video footage recorded up to this point
        will be deleted, and the file will be destroyed.
      </p>
    </div>
  </ConstrainedTaskWindow>
</template>

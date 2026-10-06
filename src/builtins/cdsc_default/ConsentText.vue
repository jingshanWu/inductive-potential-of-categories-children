<script setup>
// The lab's consent as one page of text (the six information slides, without
// their pictures). Register it in design.js as the study's consent text, so
// the "View consent" button in the top bar shows it:
//   api.setAppComponent('informed_consent_text', ConsentText)
import ConsentSections, { SECTION_TITLES } from './ConsentSections.vue'
</script>

<template>
  <div class="p-3 pt-2 text-left">
    <h1 class="text-3xl font-bold">Informed Consent</h1>
    <hr class="mt-2 mb-3 h-px" />
    <div v-for="(title, i) in SECTION_TITLES" :key="i" class="mb-6">
      <h2 class="text-2xl font-bold mb-2">{{ title }}</h2>
      <ConsentSections :section="i + 1" :pictures="false" class="!text-base" />
    </div>
  </div>
</template>

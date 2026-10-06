<script setup>
// The frame of one of the lab's consent slides: a white card with the NYU
// torch in the corner, the "CONSENT" badge and, if given, the underlined
// title. The slide's content goes inside.
import torch from './assets/consent/nyu_torch.png'

defineProps({
  title: { type: String, default: null },
})
</script>

<template>
  <div class="relative w-full max-w-[980px] mx-auto rounded-xl bg-white text-black shadow px-10 pt-5 pb-8 text-left">
    <img :src="torch" alt="" draggable="false" class="absolute left-4 top-3 h-[44px] opacity-60 select-none" />
    <div class="text-center mb-3">
      <span class="inline-block bg-black text-[#7dfbb2] text-lg tracking-wide px-4 py-0.5">CONSENT</span>
    </div>
    <h1 v-if="title" class="text-center text-5xl font-bold mb-7">
      <span class="border-b-2 border-black">{{ title }}</span>
    </h1>
    <slot />
  </div>
</template>

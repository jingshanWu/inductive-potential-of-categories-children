<script setup>
/**
 * SignatureBox Component
 *
 * WHAT IT IS
 * - A box to sign in with the mouse, a finger or a pen, like the signature
 *   question of the lab's Qualtrics consent ("Please enter your signature.",
 *   "SIGN HERE", a line to sign on and "clear" to start again).
 *
 * HOW IT IS USED
 *     <SignatureBox ref="signature" @change="signed = $event" />
 *
 * - @change: fires with true once something has been drawn, and with false
 *   after "clear".
 * - The component's image() gives the signature as a PNG data URL (null if
 *   nothing has been drawn), e.g. signature.value.image().
 * - It also works inside a scaled page (ScaleToFit.vue).
 */

import { onMounted, ref } from 'vue'

const emit = defineEmits(['change'])

// size of the drawing, in its own pixels (the box can be shown at any size)
const WIDTH = 900
const HEIGHT = 220

const canvas = ref(null)
const signed = ref(false)
let context = null
let drawing = false

onMounted(() => {
  context = canvas.value.getContext('2d')
  context.lineWidth = 3.5
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#111111'
})

// where the pointer is, in the drawing's own pixels
function point(event) {
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * WIDTH) / rect.width,
    y: ((event.clientY - rect.top) * HEIGHT) / rect.height,
  }
}

function begin(event) {
  drawing = true
  canvas.value.setPointerCapture(event.pointerId)
  const { x, y } = point(event)
  context.beginPath()
  context.moveTo(x, y)
  context.lineTo(x + 0.1, y + 0.1) // a click alone leaves a dot
  context.stroke()
  if (!signed.value) {
    signed.value = true
    emit('change', true)
  }
}

function move(event) {
  if (!drawing) return
  const { x, y } = point(event)
  context.lineTo(x, y)
  context.stroke()
}

function end() {
  drawing = false
}

function clear() {
  context.clearRect(0, 0, WIDTH, HEIGHT)
  signed.value = false
  emit('change', false)
}

function image() {
  return signed.value ? canvas.value.toDataURL('image/png') : null
}

defineExpose({ image, clear })
</script>

<template>
  <div class="w-full bg-[#f5f5f6] px-5 pt-3 pb-4 text-left">
    <p class="text-lg text-[#555555] mb-2">Please enter your signature.</p>
    <div class="relative bg-white border border-[#d8d8d8]">
      <!-- the hints under the drawing: "SIGN HERE", the line and its x -->
      <span
        v-if="!signed"
        class="absolute inset-0 flex items-center justify-center text-5xl font-bold tracking-wide text-[#e6e6e6] select-none pointer-events-none"
        >SIGN HERE</span
      >
      <span class="absolute left-[3%] right-[3%] bottom-[18%] border-b-2 border-[#333333] pointer-events-none"></span>
      <span
        class="absolute left-[3.5%] bottom-[19%] text-xl leading-none text-[#999999] select-none pointer-events-none"
        >×</span
      >
      <canvas
        ref="canvas"
        :width="WIDTH"
        :height="HEIGHT"
        class="relative block w-full touch-none cursor-crosshair"
        id="signature-canvas"
        @pointerdown.prevent="begin"
        @pointermove.prevent="move"
        @pointerup="end"
        @pointercancel="end"
      ></canvas>
      <button
        type="button"
        class="absolute right-[3%] bottom-[2%] text-lg text-[#d0312d] bg-transparent border-0 cursor-pointer"
        id="signature-clear"
        @click="clear()"
      >
        clear
      </button>
    </div>
  </div>
</template>

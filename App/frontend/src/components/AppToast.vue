<script setup lang="ts">
import { toastMessage } from '@/composables/useToast';
</script>

<template>
  <Transition
    enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-2"
    leave-active-class="transition duration-200" leave-to-class="opacity-0"
  >
    <div v-if="toastMessage" role="status" class="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit max-w-[85%] rounded-full bg-ink px-5 py-2 text-center text-sm text-white shadow-lg">
      {{ toastMessage }}
    </div>
  </Transition>
</template>

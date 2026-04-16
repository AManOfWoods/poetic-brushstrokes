<template>
  <Teleport to="body">
    <Transition name="toast-card">
      <div
        v-if="toastState.visible"
        class="pointer-events-none fixed inset-x-4 top-20 z-[90] sm:left-auto sm:right-6 sm:w-[380px]"
      >
        <div
          class="pointer-events-auto overflow-hidden rounded-[24px] border shadow-2xl backdrop-blur-xl"
          :class="containerClass"
        >
          <div class="absolute inset-0 opacity-90" :class="glowClass"></div>

          <div class="relative p-5">
            <div class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                :class="iconWrapClass"
              >
                <CheckCircle2Icon v-if="toastState.variant === 'success'" class="h-5 w-5" />
                <CircleAlertIcon v-else-if="toastState.variant === 'error'" class="h-5 w-5" />
                <BellIcon v-else class="h-5 w-5" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-base font-semibold tracking-[0.08em] text-ink-wash">
                  {{ toastState.title }}
                </p>
                <p class="mt-1 text-sm leading-6 text-ink-wash/80">
                  {{ toastState.message }}
                </p>
              </div>

              <button
                class="rounded-full p-1.5 text-ink-wash/45 transition-colors hover:bg-black/5 hover:text-ink-wash/80"
                type="button"
                @click="toastService.hide()"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-white/60">
              <div class="toast-progress h-full rounded-full" :class="progressClass" :style="progressStyle"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell as BellIcon, CheckCircle2 as CheckCircle2Icon, CircleAlert as CircleAlertIcon, X as XIcon } from 'lucide-vue-next'
import { toastService, toastState } from '@/services/toast'

const containerClass = computed(() => {
  if (toastState.variant === 'success') {
    return 'border-[#8fb197]/35 bg-[linear-gradient(135deg,rgba(255,250,243,0.96),rgba(243,250,244,0.96))]'
  }

  if (toastState.variant === 'error') {
    return 'border-[#d29b8d]/35 bg-[linear-gradient(135deg,rgba(255,248,244,0.96),rgba(254,241,239,0.96))]'
  }

  return 'border-[#d8c7ad]/35 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(248,244,235,0.96))]'
})

const glowClass = computed(() => {
  if (toastState.variant === 'success') {
    return 'bg-[radial-gradient(circle_at_top_right,rgba(116,154,120,0.18),transparent_55%)]'
  }

  if (toastState.variant === 'error') {
    return 'bg-[radial-gradient(circle_at_top_right,rgba(214,123,96,0.18),transparent_55%)]'
  }

  return 'bg-[radial-gradient(circle_at_top_right,rgba(212,169,93,0.18),transparent_55%)]'
})

const iconWrapClass = computed(() => {
  if (toastState.variant === 'success') {
    return 'border-[#8fb197]/30 bg-[#eff7ef] text-[#5d8064]'
  }

  if (toastState.variant === 'error') {
    return 'border-[#d29b8d]/30 bg-[#fcf0ec] text-[#c96a58]'
  }

  return 'border-[#d8c7ad]/30 bg-[#faf4ea] text-[#b1833f]'
})

const progressClass = computed(() => {
  if (toastState.variant === 'success') {
    return 'bg-[linear-gradient(90deg,#7ca883,#5f8466)]'
  }

  if (toastState.variant === 'error') {
    return 'bg-[linear-gradient(90deg,#df8f75,#ca6556)]'
  }

  return 'bg-[linear-gradient(90deg,#d3ab67,#bc8a44)]'
})

const progressStyle = computed(() => ({
  animationDuration: `${toastState.duration}ms`,
}))
</script>

<style scoped>
.toast-card-enter-active,
.toast-card-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.toast-card-enter-from,
.toast-card-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.toast-progress {
  transform-origin: left center;
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}
</style>

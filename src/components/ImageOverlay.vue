<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  images: string[]
  initial?: number
}>()
const emit = defineEmits<{ close: [] }>()

const current = ref(props.initial ?? 0)

function prev() {
  current.value = (current.value - 1 + props.images.length) % props.images.length
}
function next() {
  current.value = (current.value + 1) % props.images.length
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <button class="overlay__close" aria-label="Close" @click="emit('close')">✕</button>

      <div class="overlay__stage">
        <button
          v-if="images.length > 1"
          class="overlay__nav overlay__nav--prev"
          aria-label="Previous"
          @click="prev"
        >
          ‹
        </button>

        <img
          :src="images[current]"
          class="overlay__img"
          :alt="`Photo ${current + 1} of ${images.length}`"
        />

        <button
          v-if="images.length > 1"
          class="overlay__nav overlay__nav--next"
          aria-label="Next"
          @click="next"
        >
          ›
        </button>
      </div>

      <div v-if="images.length > 1" class="overlay__footer">
        <span class="overlay__counter">{{ current + 1 }} / {{ images.length }}</span>
        <div class="overlay__thumbs">
          <img
            v-for="(img, i) in images"
            :key="i"
            :src="img"
            :alt="`Thumbnail ${i + 1}`"
            class="overlay__thumb"
            :class="{ 'overlay__thumb--active': i === current }"
            @click="current = i"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 1rem;

  &__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.12);
    border: none;
    color: white;
    font-size: 1.4rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    line-height: 1;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  &__stage {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 90vw;
    max-height: 75vh;
  }

  &__img {
    max-width: 80vw;
    max-height: 75vh;
    object-fit: contain;
    border-radius: 8px;
    user-select: none;
  }

  &__nav {
    background: rgba(255, 255, 255, 0.12);
    border: none;
    color: white;
    font-size: 2.5rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s;
    line-height: 1;
    padding-bottom: 0.1rem;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  &__counter {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }

  &__thumbs {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90vw;
  }

  &__thumb {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.5;
    border: 2px solid transparent;
    transition: opacity 0.15s, border-color 0.15s;

    &:hover {
      opacity: 0.8;
    }

    &--active {
      opacity: 1;
      border-color: white;
    }
  }
}
</style>

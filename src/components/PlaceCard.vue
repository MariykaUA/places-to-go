<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Place } from '../types/place'
import ImageOverlay from './ImageOverlay.vue'

const props = defineProps<{ place: Place }>()
const emit = defineEmits<{ delete: [id: string]; edit: [place: Place] }>()

const overlayOpen = ref(false)
const overlayIndex = ref(0)

function openOverlay(index = 0) {
  overlayIndex.value = index
  overlayOpen.value = true
}

const RATING_MAP: Record<string, { label: string; cls: string }> = {
  'amazing':         { label: '🌟 Amazing',         cls: 'rating--amazing' },
  'would try again': { label: '👍 Would try again',  cls: 'rating--would-try' },
  'okay..':          { label: '😐 Okay..',           cls: 'rating--okay' },
  'nothing special': { label: '🤷 Nothing special',  cls: 'rating--nothing' },
  'very bad':        { label: '👎 Very bad',          cls: 'rating--bad' },
  'not visited':     { label: '🗺️ Not visited',       cls: 'rating--not-visited' }
}

const ratingInfo = computed(() => RATING_MAP[props.place.rating] ?? null)

const seasonClass = computed(() => {
  if (!props.place.season) return ''
  const key = props.place.season === 'All seasons' ? 'All' : props.place.season
  return `season--${key}`
})

const formattedDate = computed(() =>
  new Date(props.place.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
)

const extraCount = computed(() => props.place.images.length - 1)
</script>

<template>
  <article class="card">
    <div
      class="card__image"
      :class="{ 'card__image--placeholder': !place.images.length }"
    >
      <template v-if="place.images.length">
        <img :src="place.images[0]" :alt="place.name" />
        <button class="card__image-btn" aria-label="View photos" @click="openOverlay(0)">
          <span>{{ extraCount > 0 ? `+${extraCount} more` : '🔍 View' }}</span>
        </button>
      </template>
      <span v-else>☕</span>
    </div>

    <div class="card__body">
      <div class="card__header">
        <div class="card__title-group">
          <h3 class="card__name">{{ place.name }}</h3>
          <div class="card__meta">
            <span v-if="place.type" class="card__type">{{ place.type }}</span>
            <span v-if="place.season" class="card__season" :class="seasonClass">
              {{ place.season === 'All' ? 'All seasons' : place.season }}
            </span>
          </div>
        </div>
        <span v-if="ratingInfo" class="card__rating" :class="ratingInfo.cls">{{ ratingInfo.label }}</span>
      </div>

      <p v-if="place.knownFor" class="card__known-for">
        <span aria-hidden="true">✨</span> {{ place.knownFor }}
      </p>

      <p v-if="place.address" class="card__address">
        <span aria-hidden="true">📍</span> {{ place.address }}
      </p>

      <a
        v-if="place.website"
        :href="place.website"
        class="card__website"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span aria-hidden="true">🔗</span> {{ place.website.replace(/^https?:\/\//, '') }}
      </a>

      <p v-if="place.notes" class="card__notes">{{ place.notes }}</p>

      <div v-if="place.visitors.length" class="card__visitors">
        <span aria-hidden="true">👥</span>
        <div class="tags">
          <span v-for="v in place.visitors" :key="v" class="tag">{{ v }}</span>
        </div>
      </div>

      <div class="card__footer">
        <span class="card__date">{{ formattedDate }}</span>
        <div class="card__actions">
          <button class="edit-btn" @click="emit('edit', place)">Edit</button>
          <button class="delete-btn" @click="emit('delete', place.id)">Delete</button>
        </div>
      </div>
    </div>

    <ImageOverlay
      v-if="overlayOpen"
      :images="place.images"
      :initial="overlayIndex"
      @close="overlayOpen = false"
    />
  </article>
</template>

<style lang="scss" scoped>
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(107, 66, 38, 0.14);
  }

  &__image {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: var(--accent-light);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }

    &:hover img {
      transform: scale(1.03);
    }
  }

  &__image-btn {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0.5rem;

    span {
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 20px;
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.15s;
    }
  }

  &__image:hover &__image-btn span {
    opacity: 1;
  }

  &__body {
    padding: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    flex: 1;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__title-group {
    min-width: 0;
  }

  &__name {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    margin-top: 0.2rem;
    flex-wrap: wrap;
  }

  &__type {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  &__season {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.1rem 0.5rem;
    border-radius: 20px;

    &.season--Spring     { background: #e8f5e9; color: #2e7d32; }
    &.season--Summer     { background: #fff8e1; color: #e65100; }
    &.season--Autumn     { background: #fff3e0; color: #bf360c; }
    &.season--Winter     { background: #e3f2fd; color: #1565c0; }
    &.season--All        { background: #f3e8ff; color: #6b21a8; }
  }

  &__rating {
    flex-shrink: 0;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    white-space: nowrap;

    &.rating--amazing    { background: #e8f5ee; color: #2d7a4f; }
    &.rating--would-try  { background: #e8f5f1; color: #1a7a5e; }
    &.rating--okay       { background: #fef3c7; color: #92400e; }
    &.rating--nothing    { background: #f3f4f6; color: #4b5563; }
    &.rating--bad        { background: #fdecea; color: #c0392b; }
    &.rating--not-visited{ background: #efeff5; color: #5b5b7a; }
  }

  &__known-for {
    font-size: 0.875rem;
    color: var(--primary);
    font-style: italic;
    display: flex;
    gap: 0.3rem;
  }

  &__address {
    font-size: 0.875rem;
    color: var(--text-muted);
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
  }

  &__website {
    font-size: 0.8rem;
    color: var(--accent);
    text-decoration: none;
    display: flex;
    gap: 0.3rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover { text-decoration: underline; }
  }

  &__notes {
    font-size: 0.875rem;
    color: var(--text);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__visitors {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  &__date {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    gap: 0.4rem;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag {
  padding: 0.15rem 0.55rem;
  background: var(--accent-light);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--primary);
  font-weight: 500;
}

.edit-btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 500;
  transition: all 0.15s;

  &:hover {
    background: var(--accent-light);
    border-color: var(--accent);
    color: var(--primary);
  }
}

.delete-btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 500;
  transition: all 0.15s;

  &:hover {
    background: var(--liked-no-bg);
    border-color: var(--liked-no);
    color: var(--liked-no);
  }
}
</style>

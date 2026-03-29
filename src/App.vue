<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Place } from './types/place'
import PlaceForm from './components/PlaceForm.vue'
import PlaceCard from './components/PlaceCard.vue'

const STORAGE_KEY = 'places-v1'

const places = ref<Place[]>([])
const showForm = ref(false)
const editingPlace = ref<Place | null>(null)

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  places.value = (JSON.parse(raw) as any[]).map(p => ({
    knownFor: '',
    season: '',
    website: '',
    visitors: [],
    ...p,
    images: p.images ?? (p.image ? [p.image] : []),
    // migrate old liked boolean to rating string
    rating: p.rating ?? (p.liked === true ? 'would try again' : p.liked === false ? 'very bad' : '')
  }))
})

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places.value))
}

function addPlace(data: Omit<Place, 'id' | 'createdAt'>) {
  places.value.unshift({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  persist()
  cancelForm()
}

function updatePlace(updated: Place) {
  const idx = places.value.findIndex(p => p.id === updated.id)
  if (idx !== -1) places.value[idx] = updated
  persist()
  cancelForm()
}

function deletePlace(id: string) {
  places.value = places.value.filter(p => p.id !== id)
  persist()
}

function startEdit(place: Place) {
  editingPlace.value = place
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelForm() {
  showForm.value = false
  editingPlace.value = null
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="header__title">☕ Places</h1>
      <button v-if="!showForm" class="add-btn" @click="showForm = true">
        + Add Place
      </button>
    </header>

    <main class="main">
      <Transition name="slide">
        <PlaceForm
          v-if="showForm"
          :place="editingPlace ?? undefined"
          @submit="addPlace"
          @update="updatePlace"
          @cancel="cancelForm"
        />
      </Transition>

      <p v-if="!places.length && !showForm" class="empty">
        🗺️ No places yet — add your first one!
      </p>

      <div v-if="places.length" class="grid">
        <PlaceCard
          v-for="p in places"
          :key="p.id"
          :place="p"
          @edit="startEdit"
          @delete="deletePlace"
        />
      </div>
    </main>
  </div>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
}

.header {
  background: var(--primary);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

.add-btn {
  padding: 0.5rem 1.2rem;
  background: white;
  color: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.95rem;
  transition: background 0.15s;

  &:hover {
    background: var(--accent-light);
  }
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 5rem 2rem;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

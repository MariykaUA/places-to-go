<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import type { Place } from './types/place'
import PlaceForm from './components/PlaceForm.vue'
import PlaceCard from './components/PlaceCard.vue'

const places  = ref<Place[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingPlace = ref<Place | null>(null)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'))
  unsubscribe = onSnapshot(q, snapshot => {
    places.value = snapshot.docs.map(d => ({ ...d.data() as Omit<Place, 'id'>, id: d.id }))
    loading.value = false
  }, () => { loading.value = false })
})

onUnmounted(() => unsubscribe?.())

async function addPlace(data: Omit<Place, 'id' | 'createdAt'>) {
  await addDoc(collection(db, 'places'), { ...data, createdAt: new Date().toISOString() })
  cancelForm()
}

async function updatePlace(updated: Place) {
  const { id, ...data } = updated
  await updateDoc(doc(db, 'places', id), data)
  cancelForm()
}

async function deletePlace(id: string) {
  await deleteDoc(doc(db, 'places', id))
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

function exportData() {
  const json = JSON.stringify(places.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `places-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="header__title">☕ Places</h1>
      <div class="header__actions">
        <button v-if="!showForm" class="add-btn" @click="showForm = true">+ Add</button>
        <button v-if="places.length" class="icon-btn" title="Export" @click="exportData">↓</button>
      </div>
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

      <div v-if="loading" class="loading">Loading…</div>

      <p v-else-if="!places.length && !showForm" class="empty">
        🗺️ No places yet — add your first one!
      </p>

      <div v-else-if="places.length" class="grid">
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

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  cursor: pointer;

  &:hover { background: var(--accent-light); }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;

  &:hover { background: rgba(255, 255, 255, 0.28); }
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.loading {
  text-align: center;
  color: var(--text-muted);
  padding: 5rem 2rem;
  font-size: 1rem;
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
.slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from,
.slide-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>

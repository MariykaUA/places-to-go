<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import type { Place } from './types/place'
import PlaceForm from './components/PlaceForm.vue'
import PlaceCard from './components/PlaceCard.vue'

const places  = ref<Place[]>([])
const showForm = ref(false)
const editingPlace = ref<Place | null>(null)

const filterSeason = ref<string>('')
const filterRating = ref<string>('all')
const showFilters = ref(false)

const hasActiveFilters = computed(() => filterSeason.value !== '' || filterRating.value !== 'all')

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All']

const RATINGS = [
  { value: 'amazing',         label: '🌟 Amazing',          cls: 'rating--amazing' },
  { value: 'would try again', label: '👍 Would try again',  cls: 'rating--would-try' },
  { value: 'okay..',          label: '😐 Okay..',           cls: 'rating--okay' },
  { value: 'nothing special', label: '🤷 Nothing special',  cls: 'rating--nothing' },
  { value: 'very bad',        label: '👎 Very bad',          cls: 'rating--bad' },
  { value: 'not visited',     label: '🗺️ Not visited',       cls: 'rating--not-visited' },
]

const filteredPlaces = computed(() =>
  places.value.filter(p => {
    const seasonMatch = !filterSeason.value
      || (p.seasons ?? []).includes(filterSeason.value)
    const ratingMatch = filterRating.value === 'all' || p.rating === filterRating.value
    return seasonMatch && ratingMatch
  })
)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'))
  unsubscribe = onSnapshot(q, snapshot => {
    places.value = snapshot.docs.map(d => ({ ...d.data() as Omit<Place, 'id'>, id: d.id }))
  })
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

</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="header__title">☕ Places</h1>
      <div class="header__actions">
        <button
          v-if="!showForm"
          class="filter-toggle"
          :class="{ 'filter-toggle--active': showFilters || hasActiveFilters }"
          @click="showFilters = !showFilters"
        >
          <span class="filter-toggle__icon">⚙</span> Filter
          <span v-if="hasActiveFilters" class="filter-toggle__dot" />
        </button>
        <button v-if="!showForm" class="add-btn" @click="showForm = true">+ Add</button>
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

      <Transition name="collapse">
      <div v-if="places.length && !showForm && showFilters" class="filters">
        <div class="filter-row">
          <span class="filter-label">Season</span>
          <div class="filter-group">
            <button
              class="filter-btn"
              :class="{ active: filterSeason === '' }"
              @click="filterSeason = ''"
            >All</button>
            <button
              v-for="s in SEASONS"
              :key="s"
              class="filter-btn"
              :class="[`season-btn--${s}`, { active: filterSeason === s }]"
              @click="filterSeason = s"
            >{{ s === 'All' ? 'All year' : s }}</button>
          </div>
        </div>

        <div class="filter-divider" />

        <div class="filter-row">
          <span class="filter-label">Rating</span>
          <div class="filter-group">
            <button
              class="filter-btn"
              :class="{ active: filterRating === 'all' }"
              @click="filterRating = 'all'"
            >All</button>
            <button
              v-for="r in RATINGS"
              :key="r.value"
              class="filter-btn"
              :class="[`filter-btn--${r.cls}`, { active: filterRating === r.value }]"
              @click="filterRating = r.value"
            >{{ r.label }}</button>
          </div>
        </div>
      </div>
      </Transition>

      <p v-if="!places.length && !showForm" class="empty">
        🗺️ No places yet — add your first one!
      </p>

      <p v-if="places.length && !filteredPlaces.length && !showForm" class="empty">
        No places match the selected filters.
      </p>

      <div v-if="filteredPlaces.length" class="grid">
        <PlaceCard
          v-for="p in filteredPlaces"
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

.filter-toggle {
  position: relative;
  padding: 0.5rem 1rem;
  background: transparent;
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s;
  cursor: pointer;

  &:hover { background: rgba(255, 255, 255, 0.12); border-color: white; }

  &--active { background: rgba(255, 255, 255, 0.18); border-color: white; }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
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

.filters {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 1.5rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.filter-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding-top: 0.35rem;
  min-width: 3.5rem;
  flex-shrink: 0;
}

.filter-divider {
  height: 1px;
  background: var(--border);
  margin: 0 1rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filter-btn {
  padding: 0.28rem 0.75rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
  line-height: 1.4;

  &:hover { border-color: var(--accent); color: var(--primary); background: var(--accent-light); }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  // Season active states keep primary color
  &[class*="season-btn--"].active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  // Rating active states use each rating's color
  &.filter-btn--rating--amazing.active    { background: #2d7a4f; border-color: #2d7a4f; color: white; }
  &.filter-btn--rating--would-try.active  { background: #1a7a5e; border-color: #1a7a5e; color: white; }
  &.filter-btn--rating--okay.active       { background: #92400e; border-color: #92400e; color: white; }
  &.filter-btn--rating--nothing.active    { background: #4b5563; border-color: #4b5563; color: white; }
  &.filter-btn--rating--bad.active        { background: #c0392b; border-color: #c0392b; color: white; }
  &.filter-btn--rating--not-visited.active{ background: #5b5b7a; border-color: #5b5b7a; color: white; }
}

.slide-enter-active,
.slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from,
.slide-leave-to     { opacity: 0; transform: translateY(-8px); }

.collapse-enter-active,
.collapse-leave-active { transition: all 0.22s ease; overflow: hidden; }
.collapse-enter-from,
.collapse-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>

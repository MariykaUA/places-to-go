<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Place } from '../types/place'

type PlaceInput = Omit<Place, 'id' | 'createdAt'>

const props = defineProps<{ place?: Place }>()

const emit = defineEmits<{
  submit: [data: PlaceInput]
  update: [place: Place]
  cancel: []
}>()

const isEditing = computed(() => !!props.place)

const TYPES = ['Cafe', 'Restaurant', 'Bar', 'Coworking', 'Library', 'Other']
const SEASONS = [
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Autumn', label: 'Autumn' },
  { value: 'Winter', label: 'Winter' },
  { value: 'All',    label: 'All seasons' }
]
const RATINGS = [
  { value: 'amazing',          label: 'Amazing',          emoji: '🌟' },
  { value: 'would try again',  label: 'Would try again',  emoji: '👍' },
  { value: 'okay..',           label: 'Okay..',           emoji: '😐' },
  { value: 'nothing special',  label: 'Nothing special',  emoji: '🤷' },
  { value: 'very bad',         label: 'Very bad',         emoji: '👎' },
  { value: 'not visited',      label: 'Not visited',      emoji: '🗺️' }
]

const name        = ref(props.place?.name        ?? '')
const images      = ref<string[]>([...(props.place?.images ?? [])])
const address     = ref(props.place?.address     ?? '')
const rating      = ref(props.place?.rating      ?? '')
const type        = ref(props.place?.type        ?? '')
const knownFor    = ref(props.place?.knownFor    ?? '')
const season      = ref(props.place?.season      ?? '')
const website     = ref(props.place?.website     ?? '')
const notes       = ref(props.place?.notes       ?? '')
const visitors    = ref<string[]>([...(props.place?.visitors ?? [])])
const visitorInput = ref('')
const nameError   = ref(false)

function compressImage(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const MAX = 900
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = dataUrl
  })
}

async function onImagesChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  for (const file of files) {
    const raw = await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = ev => resolve(ev.target!.result as string)
      reader.readAsDataURL(file)
    })
    images.value.push(await compressImage(raw))
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeImage(i: number) {
  images.value.splice(i, 1)
}

function addVisitor() {
  const v = visitorInput.value.trim()
  if (v && !visitors.value.includes(v)) visitors.value.push(v)
  visitorInput.value = ''
}

function removeVisitor(v: string) {
  visitors.value = visitors.value.filter(x => x !== v)
}

function onVisitorKey(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addVisitor() }
}

function handleSubmit() {
  if (!name.value.trim()) { nameError.value = true; return }
  const data: PlaceInput = {
    name:     name.value.trim(),
    images:   [...images.value],
    address:  address.value.trim(),
    rating:   rating.value,
    type:     type.value,
    knownFor: knownFor.value.trim(),
    season:   season.value,
    website:  website.value.trim(),
    notes:    notes.value.trim(),
    visitors: [...visitors.value]
  }
  if (isEditing.value) {
    emit('update', { ...props.place!, ...data })
  } else {
    emit('submit', data)
  }
}
</script>

<template>
  <div class="form">
    <h2 class="form__title">{{ isEditing ? 'Edit Place' : 'Add a Place' }}</h2>

    <div class="row">
      <div class="field" :class="{ 'field--error': nameError }">
        <label class="field__label">Name *</label>
        <input
          v-model="name"
          class="field__input"
          placeholder="e.g. Coffee House"
          @input="nameError = false"
        />
        <span v-if="nameError" class="field__error">Name is required</span>
      </div>

      <div class="field">
        <label class="field__label">Type</label>
        <select v-model="type" class="field__input">
          <option value="">Select type</option>
          <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="field">
        <label class="field__label">Address</label>
        <input v-model="address" class="field__input" placeholder="123 Main St, City" />
      </div>

      <div class="field">
        <label class="field__label">Website</label>
        <input v-model="website" class="field__input" type="url" placeholder="https://..." />
      </div>
    </div>

    <div class="row">
      <div class="field">
        <label class="field__label">Known for</label>
        <input v-model="knownFor" class="field__input" placeholder="e.g. Best espresso, cozy vibe..." />
      </div>

      <div class="field">
        <label class="field__label">Best season</label>
        <div class="season-btns">
          <button
            v-for="s in SEASONS"
            :key="s.value"
            class="season-btn"
            :class="[`season-btn--${s.value}`, { 'season-btn--active': season === s.value }]"
            type="button"
            @click="season = season === s.value ? '' : s.value"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="field__label">Photos</label>
      <input type="file" accept="image/*" multiple class="field__file" @change="onImagesChange" />
      <div v-if="images.length" class="image-grid">
        <div v-for="(img, i) in images" :key="i" class="image-thumb">
          <img :src="img" :alt="`Photo ${i + 1}`" />
          <button class="image-thumb__remove" type="button" aria-label="Remove" @click="removeImage(i)">✕</button>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="field__label">How was it?</label>
      <div class="rating-grid">
        <button
          v-for="r in RATINGS"
          :key="r.value"
          class="rating-btn"
          :class="[`rating-btn--${r.value.replace(/\s+/g, '-')}`, { 'rating-btn--active': rating === r.value }]"
          type="button"
          @click="rating = rating === r.value ? '' : r.value"
        >
          <span class="rating-btn__emoji">{{ r.emoji }}</span>
          <span class="rating-btn__label">{{ r.label }}</span>
        </button>
      </div>
    </div>

    <div class="field">
      <label class="field__label">Notes</label>
      <textarea
        v-model="notes"
        class="field__input field__textarea"
        placeholder="What was special about this place?"
        rows="3"
      />
    </div>

    <div class="field">
      <label class="field__label">Who visited?</label>
      <div class="visitor-row">
        <input
          v-model="visitorInput"
          class="field__input"
          placeholder="Add a name and press Enter..."
          @keydown="onVisitorKey"
        />
        <button class="visitor-add" type="button" @click="addVisitor">Add</button>
      </div>
      <div v-if="visitors.length" class="tags">
        <span v-for="v in visitors" :key="v" class="tag">
          {{ v }}
          <button class="tag__remove" type="button" @click="removeVisitor(v)">×</button>
        </span>
      </div>
    </div>

    <div class="form__actions">
      <button class="btn btn--cancel" type="button" @click="emit('cancel')">Cancel</button>
      <button class="btn btn--save" type="button" @click="handleSubmit">
        {{ isEditing ? 'Save Changes' : 'Save Place' }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  margin-bottom: 2rem;

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 1.5rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1.25rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border);
  }
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;

  &__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__input {
    padding: 0.6rem 0.875rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--text);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: var(--accent); }
  }

  &__textarea { resize: vertical; min-height: 80px; }

  &__file {
    font-size: 0.9rem;
    color: var(--text-muted);
    cursor: pointer;
  }

  &__error { font-size: 0.8rem; color: var(--liked-no); }

  &--error .field__input { border-color: var(--liked-no); }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.image-thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);

  img { width: 100%; height: 100%; object-fit: cover; }

  &__remove {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.55);
    border: none;
    color: white;
    font-size: 0.75rem;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;

    &:hover { background: var(--liked-no); }
  }
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;

  @media (max-width: 560px) { grid-template-columns: repeat(2, 1fr); }
}

.rating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s;

  &__emoji { font-size: 1.3rem; line-height: 1; }
  &__label { font-size: 0.75rem; font-weight: 500; color: var(--text-muted); text-align: center; }

  &:hover { border-color: var(--accent); background: var(--accent-light); }

  &--active {
    .rating-btn__label { font-weight: 700; }
  }

  &--amazing         { &.rating-btn--active { background: #e8f5ee; border-color: #2d7a4f; .rating-btn__label { color: #2d7a4f; } } }
  &--would-try-again { &.rating-btn--active { background: #e8f5f1; border-color: #1a7a5e; .rating-btn__label { color: #1a7a5e; } } }
  &--okay\.\.        { &.rating-btn--active { background: #fef3c7; border-color: #b45309; .rating-btn__label { color: #92400e; } } }
  &--nothing-special { &.rating-btn--active { background: #f3f4f6; border-color: #9ca3af; .rating-btn__label { color: #4b5563; } } }
  &--very-bad        { &.rating-btn--active { background: #fdecea; border-color: #c0392b; .rating-btn__label { color: #c0392b; } } }
  &--not-visited     { &.rating-btn--active { background: #efeff5; border-color: #8b8baa; .rating-btn__label { color: #5b5b7a; } } }
}

.season-btns {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.season-btn {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.15s;

  &:hover { border-color: var(--accent); color: var(--text); }
  &--active { font-weight: 600; }

  &--Spring { &.season-btn--active { background: #e8f5e9; border-color: #4caf50; color: #2e7d32; } }
  &--Summer { &.season-btn--active { background: #fff8e1; border-color: #ffb300; color: #e65100; } }
  &--Autumn { &.season-btn--active { background: #fff3e0; border-color: #ff7043; color: #bf360c; } }
  &--Winter { &.season-btn--active { background: #e3f2fd; border-color: #42a5f5; color: #1565c0; } }
  &--All    { &.season-btn--active { background: #f3e8ff; border-color: #a855f7; color: #6b21a8; } }
}

.visitor-row {
  display: flex;
  gap: 0.5rem;

  .field__input { flex: 1; margin: 0; }
}

.visitor-add {
  padding: 0.6rem 1rem;
  background: var(--accent-light);
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.15s;

  &:hover { background: var(--accent); color: white; }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  background: var(--accent-light);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: 500;

  &__remove {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    transition: color 0.15s;

    &:hover { color: var(--liked-no); }
  }
}

.btn {
  padding: 0.6rem 1.3rem;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  transition: all 0.15s;

  &--cancel {
    background: transparent;
    color: var(--text-muted);
    border: 1.5px solid var(--border);
    &:hover { background: var(--border); }
  }

  &--save {
    background: var(--primary);
    color: white;
    &:hover { background: var(--primary-hover); }
  }
}
</style>

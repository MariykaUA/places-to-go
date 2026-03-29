<script setup lang="ts">
import { ref } from 'vue'
import type { Place } from '../types/place'

type PlaceInput = Omit<Place, 'id' | 'createdAt'>

const emit = defineEmits<{
  submit: [place: PlaceInput]
  cancel: []
}>()

const TYPES = ['Cafe', 'Restaurant', 'Bar', 'Coworking', 'Library', 'Other']

const name = ref('')
const image = ref('')
const imagePreview = ref('')
const address = ref('')
const liked = ref<boolean | null>(null)
const type = ref('')
const notes = ref('')
const visitors = ref<string[]>([])
const visitorInput = ref('')
const nameError = ref(false)

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    image.value = ev.target!.result as string
    imagePreview.value = image.value
  }
  reader.readAsDataURL(file)
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
  if (e.key === 'Enter') {
    e.preventDefault()
    addVisitor()
  }
}

function handleSubmit() {
  if (!name.value.trim()) {
    nameError.value = true
    return
  }
  emit('submit', {
    name: name.value.trim(),
    image: image.value,
    address: address.value.trim(),
    liked: liked.value,
    type: type.value,
    notes: notes.value.trim(),
    visitors: [...visitors.value]
  })
}
</script>

<template>
  <div class="form">
    <h2 class="form__title">Add a Place</h2>

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

    <div class="field">
      <label class="field__label">Address</label>
      <input v-model="address" class="field__input" placeholder="123 Main St, City" />
    </div>

    <div class="field">
      <label class="field__label">Image</label>
      <input type="file" accept="image/*" class="field__file" @change="onImageChange" />
      <img v-if="imagePreview" :src="imagePreview" class="field__preview" alt="Preview" />
    </div>

    <div class="field">
      <label class="field__label">Did you like it?</label>
      <div class="liked-btns">
        <button
          class="liked-btn"
          :class="{ 'liked-btn--yes': liked === true }"
          type="button"
          @click="liked = liked === true ? null : true"
        >
          👍 Liked
        </button>
        <button
          class="liked-btn"
          :class="{ 'liked-btn--no': liked === false }"
          type="button"
          @click="liked = liked === false ? null : false"
        >
          👎 Didn't like
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
      <button class="btn btn--save" type="button" @click="handleSubmit">Save Place</button>
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

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
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

    &:focus {
      border-color: var(--accent);
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 80px;
  }

  &__file {
    font-size: 0.9rem;
    color: var(--text-muted);
    cursor: pointer;
  }

  &__preview {
    margin-top: 0.5rem;
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }

  &__error {
    font-size: 0.8rem;
    color: var(--liked-no);
  }

  &--error .field__input {
    border-color: var(--liked-no);
  }
}

.liked-btns {
  display: flex;
  gap: 0.5rem;
}

.liked-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  transition: all 0.15s;

  &:hover {
    background: var(--accent-light);
  }

  &--yes {
    background: var(--liked-yes-bg);
    border-color: var(--liked-yes);
    color: var(--liked-yes);
    font-weight: 600;
  }

  &--no {
    background: var(--liked-no-bg);
    border-color: var(--liked-no);
    color: var(--liked-no);
    font-weight: 600;
  }
}

.visitor-row {
  display: flex;
  gap: 0.5rem;

  .field__input {
    flex: 1;
    margin: 0;
  }
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

  &:hover {
    background: var(--accent);
    color: white;
  }
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

    &:hover {
      color: var(--liked-no);
    }
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

    &:hover {
      background: var(--border);
    }
  }

  &--save {
    background: var(--primary);
    color: white;

    &:hover {
      background: var(--primary-hover);
    }
  }
}
</style>

<template>
  <div>
    <div class="flex" @click="pickFile">
      <slot><k-icon name="im:image"></k-icon></slot>
    </div>
    <input
      ref="picker"
      type="file"
      :multiple="multiple"
      hidden
      accept="image/*"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults } from 'vue'
import { Dict } from '@cordisjs/client'
import { genId } from '@satorijs/plugin-im-utils'

const picker = ref<HTMLInputElement>()

const emit = defineEmits(['add'])

const model = defineModel<Dict<{ b64: string; type: string }>>({ default: {} })
const props = withDefaults(
  defineProps<{
    accept: string
    multiple: boolean
  }>(),
  {
    multiple: false,
  }
)

function pickFile() {
  picker.value!.click()
}

async function handleChange(event: Event) {
  if (picker.value?.files) {
    const files = picker.value.files
    const b64s: any[] = []
    await Promise.all(
      Array.from(files).map((file) => {
        return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            let id: string = undefined as any
            const result = reader.result as string | null
            if (result) {
              id = genId()
              b64s.push({ b64: result, type: file.type })
              model.value[id] = { b64: result, type: file.type }
            }
            resolve(result)
          }
          reader.onerror = reject
        })
      })
    )
    emit('add', b64s)
  }
}
</script>

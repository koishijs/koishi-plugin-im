<template>
  <div>
    <k-layout v-if="shared.shouldLogin">
      <k-im-login />
    </k-layout>
    <k-layout v-else>
      <template #header>bbb</template>
      <template #menu>
        <div class="flex flex-row gap-2">
          <el-input class="w-100" v-model="keyword" #prefix>
            <k-icon name="search"></k-icon>
          </el-input>
          <el-button class="p-0 h-8 w-8 shrink-0" @click.stop="trigger($event)">
            <k-icon name="add"></k-icon>
          </el-button>
          <el-button class="p-0 h-8 w-8 shrink-0" @click.stop="trigger($event)">
            <k-icon name="external"></k-icon>
          </el-button>
        </div>
      </template>
      <template #left>
        <k-im-chat-list />
      </template>
      <k-im-window-message />
      <template #right><k-im-aside /></template>
    </k-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import shared from './shared'

const currentAside = ref<string>()
onMounted(() => {
  shared.value.currentUser = null
  shared.value.shouldLogin = true
})

const keyword = ref<string>()

const trigger = (event) => {}
</script>

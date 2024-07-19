<template>
  <div>
    <div v-if="!messageItems.length"></div>
    <div v-else class="pt-2.5">
      <virtual-list :data="messageItems" max-height="calc(100vh - 13rem)" key-name="id">
        <template #default="slotProps">
          <message-item :message="slotProps" />
        </template>
        <template #footer> </template>
      </virtual-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { Message } from '@satorijs/plugin-im-database'
import MessageItem from './message-item.vue'

const messageItems = ref([
  { id: '1', uid: 1, content: 'ME' },
  {
    id: '1',
    uid: 1,
    content:
      '<virtual-list v-else :data="messageItems" max-height="calc(100vh - 9.25rem)" key-name="id">\r\n' +
      '        <template #default="slotProps">\r\n' +
      '          <message-item :data="slotProps" />\r\n' +
      '        </template>\r\n' +
      '        <template #footer> </template>\r\n' +
      '      </virtual-list>',
  },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
  { id: '1', uid: 1, content: 'ME' },
])

function getMessageList(direction: 'top' | 'bottom') {
  if (direction === 'top') {
    messageItems.value.push(...[{ id: '1', uid: 1, content: 'ME' }])
  }
}
</script>

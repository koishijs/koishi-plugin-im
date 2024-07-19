<template>
  <div class="k-im-tab flex">
    <span
      v-for="(item, index) in data"
      :key="index"
      :style="{ flexGrow: item.grow || 1 }"
      @click="emit('item-click', index)"
    >
      <template v-if="item.isIcon === true"> <k-icon :name="item.label" /> </template
      ><template v-else>
        {{ item.label }}
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
declare interface TabProps {
  label: string
  isIcon: boolean
  grow?: number
}

const emit = defineEmits(['item-click'])

const props = defineProps<{
  data: Array<TabProps>
}>()
</script>

<style scoped lang="scss">
.k-im-tab {
  overflow: hidden;

  span {
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
    transition: all 0.1s ease-out;

    &:hover {
      background-color: var(--bg3);
      color: var(--active);
    }

    &.active {
      background-color: #ddd;
      font-weight: bold;
    }
  }
}
</style>

<template>
  <span :class="{ active: isActive }" @click="handleClick">
    <slot></slot>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TabItem',
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const handleClick = () => {
      props.onClick()
    }

    return {
      handleClick,
    }
  },
})
</script>

<style scoped>
.active {
  background-color: #ddd;
  font-weight: bold;
}
</style>

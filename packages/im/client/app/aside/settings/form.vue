<template>
  <div class="flex flex-col p-4">
    <div class="font-size-4.5">
      <slot name="title">设定</slot>
      <im-divider size="1px"></im-divider>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

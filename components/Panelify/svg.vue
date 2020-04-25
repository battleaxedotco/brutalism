<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8px" style="width: 8px">
    <g v-if="icon == 'x'" :style="{ 'stroke': color, 'stroke-width': '4px', 'fill': 'none' }">
      <line x1="7" y1="7" x2="25" y2="25"/>
      <line x1="25" y1="7" x2="7" y2="25"/>
    </g>
    <g v-else class="padded-right" :style="{ 'stroke': color, 'stroke-width': '4px', 'fill': 'none' }">
      <polyline points="13.82 24.8 5.01 15.99 13.81 7.19"/>
      <polyline points="28.82 24.8 20.01 15.99 28.81 7.19"/>
    </g>
  </svg>
</template>

<script> 
export default {
  props: {
    icon: {
      type: String,
      default: 'x'
    },
    color: {
      type: String,
      default: '#b7b7b7'
    }
  }
};
</script>

<style>
</style>
<template>
  <span :class="[ 'annotation', { uppercase } ]" :style="{
    color: color,
    'font-size': size,
    'font-family': font,
    'letter-spacing': letterSpacing
  }">
    <span v-if="$slots.default">
      <slot />
    </span>
    <span v-else-if="text">{{text}}</span>
  </span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '14px'
    },
    font: {
      type: String,
      default: '"Open Sans", sans-serif'
    },
    color: {
      type: String,
      default: 'var(--default-color)'
    }
  }
}
</script>

<style>
.annotation {
  margin-bottom: 1ch;
}
.uppercase {
  text-transform: uppercase;
}
</style>
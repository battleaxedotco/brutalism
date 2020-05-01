<template>
  <span :class="[ 'annotation', { uppercase } ]" :style="{
    color: color,
    'font-size': size,
    'font-family': font,
    'letter-spacing': letterSpacing,
    'margin': margin
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
    },
    uppercase: {
      type: Boolean,
      default: false
    },
    letterSpacing: {
      type: String,
      default: 'normal'
    },
    margin: {
      type: String,
      default: '0px 0px 1ch 0px'
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
<template>
  <span class="link-wrapper">
    <a class="link-text"
      :style="{
        'text-decoration': underline ? 'underline' : 'none',
        color: color
      }"
      @click="goTo" 
      v-if="$slots.default"><slot />
    </a>
  </span>
</template>

<script>
import { openURL } from 'cluecumber'

export default {
  props: {
    url: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'var(--color-selection)'
    },
    underline: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    goTo() {
      if (this.url.length)
        openURL(this.url)
    }
  }
}
</script>

<style>
.link-text {
  cursor: pointer;
}
</style>
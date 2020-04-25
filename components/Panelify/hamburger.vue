<template>
  <svg viewBox="0 0 24 24" class="hamburger">
    <path :style="getMenuStyle()" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
  </svg>
</template>

<script>
export default {
  props: {
    color: String,
  },
  methods: {
    getMenuStyle() {
      return `
        fill: ${this.color};
      `
    }
  }
};
</script>

<style >
.hamburger {
  width: 20px;
}
</style>
<template>
  <span
    :class="[`brutalism-icon mdi mdi-${icon}`, url.length ? 'link' : '']"
    @click="handleClick"
    :style="{
      'font-size': size,
      width: size,
      color: color,
    }"
  >
  </span>
</template>

<script>
import { openURL } from "cluecumber";

export default {
  props: {
    name: {
      type: String,
      default: "home",
    },
    color: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    mdi: {
      type: Boolean,
      default: true,
    },
    fa: {
      type: Boolean,
      default: false,
    },
    battleaxe: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: "",
    },
  },
  computed: {
    icon() {
      return this.name.replace(/mdi-/, "");
    },
  },
  methods: {
    handleClick() {
      this.$emit("click");
      if (this.url.length) openURL(this.url);
    },
  },
};
</script>

<style>
.mdi:before,
.mdi-set {
  box-sizing: border-box;
  /* font-size: 16px !important; */
}

.brutalism-icon {
  font-size: 24px;
}

.brutalism-icon.link {
  cursor: pointer;
}

.prefixIcon {
  margin-right: 4px;
}
</style>

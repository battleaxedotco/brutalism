<template>
  <div
    class="progress-bar-wrapper"
    :style="{
      top: realTop,
      zIndex: realZIndex,
      opacity: value >= 100 ? 1 : 1,
    }"
  >
    <div class="progress-bar-container">
      <div
        class="progress-bar-value"
        :style="{
          width: realPercent,
          height: realSize,
          background: realColor,
          'transition-property': 'width',
          'transition-delay': delay,
          'transition-duration': duration,
          'transition-timing-function': timing,
        }"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    percent: {
      type: Number,
      default: 0,
    },
    delay: {
      type: String,
      default: "20ms",
    },
    duration: {
      type: String,
      default: "120ms",
    },
    timing: {
      type: String,
      default: "var(--quad)",
    },
    size: {
      type: Number,
      default: 2,
    },
    color: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
      default: 0,
    },
    zIndex: {
      type: [String, Number],
      default: 100,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    realPercent() {
      return `${this.realValue}%`;
    },
    realZIndex() {
      return isNaN(+this.zIndex) ? 99 : +this.zIndex;
    },
    realTransition() {
      return `width ${this.timing}`;
    },
    realSize() {
      return `${this.size}px`;
    },
    realColor() {
      if (!this.color.length) return `var(--color-selection);`;
      else {
        if (!/-/.test(this.color)) return this.color;
        return `var(--color-${this.color
          .replace(/var\(/, "")
          .replace(/(--color-|color-)/, "")
          .replace(/\)$/, "")})`;
      }
    },
  },
  data: () => ({
    realValue: 0,
    realTop: 0,
    locked: false,
  }),
  mounted() {
    this.realValue = this.percent || this.value;
    this.getRealTop();
  },
  watch: {
    percent(val) {
      this.realValue = val;
    },
    value(val) {
      this.realValue = val >= 0 && val <= 100 ? val : val >= 100 ? 100 : 0;
    },
    realValue(val, lastVal) {
      if (val >= 100 || val <= 0 || lastVal >= 100 || lastVal <= 0) {
        this.getRealTop();
        setTimeout(() => {
          this.realValue = val >= 0 && val <= 100 ? val : val >= 100 ? 100 : 0;
        }, 220);
      } else
        this.realValue = val >= 0 && val <= 100 ? val : val >= 100 ? 100 : 0;
      this.$emit("input", val);
      if (val > 0 && lastVal == 0) this.$emit("show", true);
      else if (val >= 100)
        setTimeout(() => {
          this.$emit("show", false);
        }, 500);
    },
  },
  methods: {
    getRealTop() {
      this.realTop = `${
        this.value >= 100 || this.percent >= 100
          ? this.size * -1
          : this.value > 0 || this.percent > 0
          ? 0
          : this.size * -1
      }px`;
    },
    reset() {
      if (this.debug) console.log("RESET");
      this.$emit("reset");
      this.realValue = 0;
      this.locked = false;
    },
  },
};
</script>

<style>
.progress-bar-wrapper {
  transition: top 200ms var(--quad) 0ms, opacity 500ms var(--quad) 20ms;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0;
  height: fit-content;
  z-index: 100;
}
.progress-bar-container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.progress-bar-value {
  background-color: var(--color-selection);
}
</style>

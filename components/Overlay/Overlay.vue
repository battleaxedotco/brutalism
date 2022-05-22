<template>
  <div>
    <div
      :class="['overlay-wrapper', state ? 'overlay-active' : 'overlay-idle']"
      :style="{
        backdropFilter: `blur(${this.realBlur})`,
        transition: `opacity ${state ? inSpeed : outSpeed} var(--quint) 0ms`,
        zIndex: realZIndex,
        pointerEvents: pointerEventContext,
      }"
    >
      <div
        class="overlay-content"
        :style="{
          zIndex: realZIndex + 1,
        }"
      >
        <slot />
      </div>
      <div
        class="overlay-background"
        :style="{
          backgroundColor: realBackground,
          opacity: opacity,
          zIndex: realZIndex,
        }"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    inSpeed: {
      type: String,
      default: "350ms",
    },
    blur: {
      type: [Number, String],
      default: "0px",
    },
    outSpeed: {
      type: String,
      default: "700ms",
    },
    pointerEvents: {
      type: Boolean,
      default: false,
    },
    zIndex: {
      type: [String, Number],
      default: "99",
    },
    background: {
      type: String,
      default: "var(--color-header)",
    },
    opacity: {
      type: [String, Number],
      default: 0.875,
    },
  },
  data() {
    return {
      show: this.state,
      realPercent: 0,
    };
  },
  watch: {
    state(val) {
      this.show = val;
      if (!val) {
        this.$emit("hide");
        setTimeout(() => {
          this.$emit("after-hide");
        }, this.outMS);
      } else {
        this.$emit("show");
        setTimeout(() => {
          this.$emit("after-show");
        }, this.inMS);
      }
    },
  },
  computed: {
    realZIndex() {
      return isNaN(+this.zIndex) ? 99 : +this.zIndex;
    },
    realBackground() {
      if (!this.background.length) return `var(--color-header);`;
      else {
        if (!/-/.test(this.background)) return this.background;
        return `var(--color-${this.background
          .replace(/var\(/, "")
          .replace(/(--color-|color-)/, "")
          .replace(/\)$/, "")})`;
      }
    },
    pointerEventContext() {
      if (!this.state) return "none";
      else if (this.pointerEvents && this.state) return "all";
      else if (this.state) return "none";
      else return "none";
    },
    outMS() {
      let temp = +("" + this.outSpeed).replace(/[^\d]*$/, "").trim();
      return !isNaN(temp) ? temp : 700;
    },
    inMS() {
      let temp = +("" + this.inSpeed).replace(/[^\d]*$/, "").trim();
      return !isNaN(temp) ? temp : 350;
    },
    realBlur() {
      let temp = this.blur;
      if (/number/.test(typeof temp)) return `${this.blur}px`;
      else return this.blur;
    },
  },
  mounted() {},
  methods: {
    reset() {
      this.$emit("show", false);
    },
    getStyle() {
      return `opacity: ${this.state ? "1" : "0"};`;
    },
    getProgressStyle() {
      return `width: ${this.score}`;
    },
  },
};
</script>

<style>
.overlay-wrapper {
  width: 100vw;
  height: calc(100vh - 1px);
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-background {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 98;
}

.overlay-content {
  opacity: 1;
  z-index: 99;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.overlay-active {
  opacity: 1;
}

.overlay-idle {
  opacity: 0;
}
</style>

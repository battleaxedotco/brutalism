<template>
  <div
    class="notification-container"
    :style="{
      zIndex: realZIndex,
      transition: `top ${state ? inSpeed : outSpeed} var(--quint) ${
        this.delay
      }, bottom ${state ? inSpeed : outSpeed} var(--quint) ${this.delay}`,
      backdropFilter: `blur(${this.realBlur})`,
      padding: padding,
      height: height,
      backgroundColor: realBackground,
      opacity: opacity,
      top: bottom ? '' : realState ? `0px` : `${heightInvert}px`,
      bottom: !bottom ? '' : realState ? `0px` : `${heightInvert}px`,
    }"
  >
    <div
      class="notification-content"
      :style="{
        justifyContent: justifyContent,
        alignItems: alignItems,
        flexDirection: flexDirection,
        flexWrap: flexWrap,
      }"
    >
      <slot v-if="$slots.default" />
      <Anno v-else-if="text && text.length" :color="this.realColor">{{
        text
      }}</Anno>
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
    text: {
      type: String,
      default: "",
    },
    zIndex: {
      type: [String, Number],
      default: "99",
    },
    padding: {
      type: String,
      default: "16px 10px 10px 10px",
    },
    height: {
      type: String,
      default: "60px",
    },
    inSpeed: {
      type: String,
      default: "160ms",
    },
    outSpeed: {
      type: String,
      default: "160ms",
    },
    delay: {
      type: String,
      default: "20ms",
    },
    blur: {
      type: [Number, String],
      default: "0px",
    },
    background: {
      type: String,
      default: "#3370b7",
    },
    color: {
      type: String,
      default: "#fff",
    },
    opacity: {
      type: [String, Number],
      default: 1,
    },
    flexDirection: {
      type: String,
      default: "row",
    },
    justifyContent: {
      type: String,
      default: "flex-start",
    },
    alignItems: {
      type: String,
      default: "center",
    },
    flexWrap: {
      type: String,
      default: "none",
    },
    marginTop: {
      type: String,
      default: "0px",
    },
    bottom: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    hover: false,
    realState: false,
    heightInvert: "",
  }),
  computed: {
    realZIndex() {
      return isNaN(+this.zIndex) ? 99 : +this.zIndex;
    },
    realBackground() {
      return this.sanitizeColorValue(this.background, "#3370b7");
    },
    realColor() {
      return this.sanitizeColorValue(this.color, "#fff");
    },
    outMS() {
      return this.timeValueAsMS(this.outSpeed, 160);
    },
    inMS() {
      return this.timeValueAsMS(this.inSpeed, 160);
    },
    realBlur() {
      let temp = this.blur;
      if (/number/.test(typeof temp)) return `${this.blur}px`;
      else return this.blur;
    },
  },
  methods: {
    timeValueAsMS(property, defaultValue) {
      let temp = +("" + property).replace(/[^\d]*$/, "").trim(),
        delayTemp = +("" + this.delay).replace(/[^\d]*$/, "").trim();
      return !isNaN(temp) ? temp + delayTemp : defaultValue;
    },
    sanitizeColorValue(property, defaultValue) {
      if (!property.length) return defaultValue;
      else {
        if (!/-/.test(property)) return property;
        return `var(--color-${property
          .replace(/var\(/, "")
          .replace(/(--color-|color-)/, "")
          .replace(/\)$/, "")})`;
      }
    },
    calculateHeightInvert() {
      this.heightInvert = this.bottom
        ? -(this.$el.getBoundingClientRect().height + 1)
        : -(this.$el.getBoundingClientRect().height + 1);
    },
    show() {
      this.realState = true;
    },
    close() {
      console.log("Close?");
      this.$emit("close");
      this.realState = false;
    },
    setCSS(prop, data) {
      document.documentElement.style.setProperty(
        `${/^\-\-/.test(prop) ? prop : "--" + prop}`,
        data
      );
    },
    getCSS(prop) {
      return window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(`${/^\-\-/.test(prop) ? prop : "--" + prop}`);
    },
  },
  mounted() {
    this.calculateHeightInvert();
  },
  watch: {
    realState(val) {
      if (val)
        setTimeout(() => {
          document.addEventListener("click", this.close, {
            once: true,
          });
        }, 120);
      else {
        document.removeEventListener("click", this.close);
      }
    },
  },
};
</script>

<style>
.notification-container {
  box-sizing: border-box;
  display: flex;
  left: 0;
  width: 100vw;
  position: absolute;
  justify-content: center;
  align-items: center;
}
.notification-content {
  box-sizing: border-box;
  width: 100%;
  display: flex;
}
</style>
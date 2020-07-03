<template>
  <!-- 
    Issues:
      - How to best handle total degrees?
      - Surely both scrolls need v-model. Can't figure out a decent way to sync both to one another reliably
   -->
  <div class="rotation-control-wrapper">
    <div
      class="rotation-control-icon"
      :style="{
        transform: realRotation,
      }"
      v-pan.prevent.mouse="panHandle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <circle class="rotation-controller" cx="12" cy="12" r="9" />
        <line class="rotation-controller" x1="12" y1="12" x2="12" y2="3" />
      </svg>
    </div>
    <Input-Scroll
      ref="rotation"
      flat
      v-model="totalRotations"
      @change="updateRotations"
      suffix="x"
    />
    <div style="width: 4px;" />
    <Input-Scroll
      ref="radian"
      flat
      v-model="totalRadians"
      @change="updateRadians"
    />
    <Input-Scroll :value="totalNum" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    totalRadians: 0,
    totalRotations: 0,
    totalNum: 0,
    radians: 0,
    rotations: 0,
    lastDelta: 0,
    hasReportedPan: false,
    isPanning: false,
    inputting: false,
    hasFocus: false,
    val: 0,
  }),
  computed: {
    realRotation() {
      return `rotate(${this.total.radians}deg)`;
    },
    // totalNum() {
    //   return Math.floor(this.radians / 360) * 360 + (this.radians % 360);
    // },
    total: {
      get() {
        return {
          radians: this.lastDelta % 360,
          rotations: Math.floor(this.lastDelta / 360),
        };
      },
      set(val) {
        this.totalNum = val;
        let isPos = val > 0;
        let tempRotations;
        let tempVal = isPos ? val : val * -1;
        tempRotations = Math.floor(tempVal / 360);
        this.lastDelta = isPos ? tempVal % 360 : (tempVal * -1) % -360;
        tempRotations = isPos ? tempRotations : tempRotations * -1;
        this.totalRotations = tempRotations;
        this.totalRadians = this.lastDelta;

        this.$refs.radian.set(this.lastDelta);
        console.log("TOTAL:", tempVal);
        console.log("RADIANS:", this.lastDelta);
        console.log("ROTATIONS:", Math.floor(tempVal / 360));
      },
    },
  },
  directives: {
    pan: require("vue-pan").default,
  },
  methods: {
    correctTotal() {},
    panHandle(evt) {
      if (evt.isFirst) this.hasReportedPan = false;
      this.hasFocus = this.isPanning = !evt.isFinal;
      this.inputting = false;
      this.$refs.radian.blur();
      this.$refs.rotation.blur();
      if (!this.hasFocus) {
        this.blur();
        this.lastDelta = evt.offset.x / 2;
        return null;
      }
      let offsetx = evt.offset.x / 2;
      if (this.lastDelta == offsetx) return null;
      let delta = offsetx > this.lastDelta ? 1 : -1;
      let direction = delta > 0 ? "right" : "left";
      if (this.debug)
        console.log(
          `amount: ${offsetx} !== ${this.lastDelta}`,
          `val: ${delta} ==> ${direction}`
        );
      this.increment(delta);
      this.lastDelta = offsetx;
    },
    blur() {
      console.log("Released");
    },
    updateRadians(value) {
      if (value < 0 && this.totalRotations > 0) {
        console.log("LAST:", value);
        value = 360 + value;
        console.log("NEW:", value);
      }

      this.total = value + Math.floor(this.totalRotations * 360);
    },
    updateRotations(value) {
      this.total = this.totalRadians + Math.floor(value * 360);
    },
    increment(delta) {
      let result = +this.val + delta;
      // result = !this.lazy
      //   ? +(+this.val + amount).toFixed(this.toFixed)
      //   : +this.val + amount;
      // result = this.clamp(result);
      this.val = result;
      console.log(delta);
    },
  },
};
</script>

<style>
.rotation-controller {
  fill: none;
  stroke: var(--color-icon);
  stroke-miterlimit: 10;
  stroke-width: 2px;
}

.rotation-control-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
}
</style>

<template>
  <!-- 
    Has issues...
    - Clicking on either extreme doesn't work. Causes infinite loop on forcible reassign of val/percent
    - Assigning override value doesn't register after watchers, even sequentially
    - Min/Max values seem broken. Slider doesn't move when inputting either

    Decent start. Click, dragging, and input works for 99% of slider except both extremes
   -->

  <div class="slider-control-wrapper">
    <div class="slider-control-container">
      <div v-if="label.length" class="slider-control-label">
        <Input-Scroll
          @focus="hasFocus = true"
          @blur="hasFocus = false"
          v-model="val"
          :min="min"
          :max="max"
          :label="label"
        />
      </div>
      <div
        class="slider-hitbox"
        ref="hitbox"
        @click="testClick"
        :style="getHitBoxHeight()"
      >
        <div class="slider-control-value" ref="track">
          <div
            v-pan.prevent.mouse="panHandle"
            :class="['slider-control-slider', hasFocus ? 'active' : 'idle']"
            ref="slider"
            :style="getSliderStyle()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
      default: 0,
    },
    debug: {
      type: Boolean,
      default: false,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
  },
  data: () => ({
    isMounted: false,
    heightOffset: 0,
    widthOffset: 0,
    percent: 0,
    ratio: 0,
    val: 0,
    sliderPos: 0,
    lastSliderPos: 0,
    startPos: 0,
    hasFocus: false,
    isDragging: false,
    checkClick: false,
  }),
  watch: {
    isDragging(val) {
      this.hasFocus = val;
    },
    value(val) {
      this.val = val;
    },
    // Controlled by Input-Scroll, only when not dragging
    val(val) {
      if (!this.isDragging) {
        // console.log(val);
        let modifier;
        modifier = this.min * -1;
        let min = this.min + modifier;
        let max = this.max + modifier;
        let ratioToMax = 100 / max;
        let temp = (val - this.min) * ratioToMax;
        if (temp >= 0 && temp <= 100) this.percent = temp;
      }
      this.$emit("input", val);
    },
    // Global, controlled via both Input and Dragging
    percent(val) {
      let temp = (val / 100) * this.trackWidth;
      if (!this.isDragging) {
        this.sliderPos = temp;
      } else {
        // this.val = val;
        this.adjustValueToCurrentPos(temp);
      }
    },
    sliderPos(val, lastVal) {
      if (val <= 0 || val >= this.trackWidth) {
        this.sliderPos = lastVal;
        this.lastSliderPos = lastVal;
      }
      // if (this.checkClick) this.adjustValueToCurrentPos();
    },
  },
  mounted() {
    this.isMounted = true;
    let rect = this.$refs.slider.getBoundingClientRect();
    this.heightOffset = (rect.height / 2) * -1 + 2;
    this.widthOffset = (rect.width / 2) * -1;
    this.trackWidth = this.$refs.track.getBoundingClientRect().width;
    // this.ratio = this.getRatioPerTrackWidth();
    if (this.val < this.min) this.val = this.min;
  },
  directives: {
    pan: require("vue-pan").default,
  },
  methods: {
    testClick(evt) {
      try {
        // this.checkClick = true;
        let temp = evt.clientX;
        let result = 0;
        let offset = this.$refs.hitbox.getBoundingClientRect().left;
        let trackOffset = this.$refs.track.getBoundingClientRect().left;
        if (
          temp - trackOffset >= trackOffset &&
          temp - trackOffset <= this.trackWidth
        ) {
          result = temp - trackOffset;
        } else if (temp - trackOffset <= trackOffset) {
          result = 0.1;
        } else if (temp - trackOffset >= this.trackWidth) {
          result = this.trackWidth;
        }
        this.adjustValueToCurrentPos(result);
      } catch (err) {
        //
      }
    },
    adjustValueToCurrentPos(val) {
      const self = this;
      // console.log(val);
      // if (val <= 0.1) {
      //   this.override = true;
      //   this.val = this.min;
      //   return null;
      // } else if (val >= 100) {
      //   this.override =
      //   this.val = this.max;
      //   return null;
      // }
      let temp = Math.floor((val / this.trackWidth) * 100);
      if (temp >= 0 && temp <= 100) {
        let modifier;
        modifier = this.min * -1;
        let min = this.min + modifier;
        let max = this.max + modifier;
        let result = Math.floor((val / this.trackWidth) * max) + this.min;
        this.val = result;
      }
    },
    getHitBoxHeight() {
      return `height: ${this.heightOffset * -2 + 4}px;`;
    },
    // When dragging the slider
    panHandle(evt) {
      if (evt.isFirst) {
        // Lock out other functions to ensure only dragging value is being used
        this.isDragging = true;
        this.startPos = this.sliderPos;
      } else if (evt.isFinal) {
        // On end, unlock v-model and input
        this.isDragging = false;
        this.startPos = this.sliderPos;
      }
      // Assign the offset to the starting position to determine current position, then rewrite percent
      let temp = evt.offset.x;
      this.sliderPos = temp + this.startPos;
      let clamped = this.sliderPos >= 0 ? this.sliderPos : 0;
      clamped =
        this.sliderPos <= this.trackWidth ? this.sliderPos : this.trackWidth;
      this.percent = Math.floor((clamped / this.trackWidth) * 100);
      console.log(this.percent);
    },
    getPercentageOfRatio(value, ratio) {
      return value * ratio;
    },
    getCurrentSliderPosByPercent(percent) {},
    getSliderStyle() {
      let style = "";
      if (this.isMounted) {
        style += `
          top: ${this.heightOffset}px;
          left: ${this.realWidthOffset + this.sliderPos}px;
        `;
      }
      return style;
    },
  },
  computed: {
    realWidthOffset() {
      return this.widthOffset;
    },
  },
};
</script>

<style>
.wrapper > .slider-control-wrapper {
  margin-top: 8px;
}

.slider-control-wrapper {
  width: 100%;
  box-sizing: border-box;
}
.slider-control-container {
  display: flex;
  flex-direction: column;
}

.slider-control-value {
  position: relative;
  box-sizing: border-box;
  height: 4px;
  width: 100%;
  border-radius: 10px;
  background: var(--color-header);
  margin: 0px 10px;
}

.slider-control-label {
  margin-bottom: 8px;
}

.slider-control-slider {
  position: absolute;
  border-radius: 10px;
  border-width: 2px;
  border-style: solid;
  width: 10px;
  height: 10px;
}

.slider-control-slider.idle {
  border-color: var(--color-default);
}

.slider-control-slider.active {
  border-color: var(--color-selection);
}

.slider-hitbox {
  /* background: rgba(255, 0, 0, 0.5); */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

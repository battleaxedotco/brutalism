<template>
  <div :class="['color-picker-wrapper', { disabled, readOnly }]">
    <div @click="promptColorPicker" v-if="$slots.default">
      <slot />
    </div>
    <div class="color-picker-container" v-else>
      <div class="color-picker-swatch" @click="promptColorPicker">
        <div
          class="color-picker-swatch-content"
          :style="{
            borderColor: this.active ? 'var(--color-selection)' : '#fff',
            background: this.styleString,
          }"
        />
      </div>
      <div :class="['color-picker-label']">
        <!-- v-if="!editable" -->
        {{ this.realModel.hex }}
      </div>
    </div>
  </div>
</template>

<script>
var rgb = require("color-space/rgb");
var cmyk = require("color-space/cmyk");

export default {
  props: {
    readOnly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [Object, String],
      default: () => {
        return {
          red: 255,
          green: 0,
          blue: 0,
        };
      },
    },
    model: {
      type: String,
      default: "hex",
    },
    label: {
      type: String,
      default: "Some color value",
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    activeModel: "",
    type: "colorPicker",
    active: false,
    realModel: {
      hex: "",
      cmyk: {
        cyan: 0,
        magenta: 0,
        yellow: 0,
        black: 0,
      },
      rgb: {
        red: 127,
        green: 127,
        blue: 127,
      },
      hsb: {
        hue: 127,
        saturation: 127,
        brightness: 127,
      },
      lab: {
        L: 127,
        A: 127,
        B: 127,
      },
    },
  }),
  computed: {
    styleString() {
      return this.realModel.hex;
    },
    activeValue() {
      return this.realModel[this.activeModel] || null;
    },
  },
  mounted() {
    this.activeModel = this.model;
    this.realModel[this.activeModel] = this.value;
    this.updateModelToKey();
  },
  watch: {
    value: {
      handler(val) {
        this.realModel[this.activeModel] = val;
        this.updateModelToKey();
      },
      deep: true,
    },
  },
  methods: {
    async promptColorPicker() {
      return true;
    },
    // validateActiveValueAndDetermineModel() {
    //   if (/string/i.test(this.value)) return "hex";
    //   else if (this.value && this.value.red) return "rgb";
    //   else if (this.value && this.value.cyan) return "cmyk";
    //   else return "hex";
    // },
    updateModelToKey(key) {
      if (!key || arguments < 1) key = this.activeModel;
      if (key == "hex") {
        this.realModel.rgb = this.fromHex(this.realModel.hex);
        this.realModel.cmyk = this.toCMYK(this.realModel.rgb);
      } else if (key == "rgb") {
        this.realModel.hex = this.toHex(this.realModel.rgb);
        this.realModel.cmyk = this.toCMYK(this.realModel.rgb);
      } else if (key == "cmyk") {
        this.realModel.rgb = this.toRGB(this.realModel.cmyk);
        this.realModel.hex = this.toHex(this.realModel.rgb);
      }
    },
    /**
     * Conversion from RGB to Hex
     *
     * @param {String} rgb
     */
    toHex(RGB) {
      // console.log("TO RGB:", RGB);
      return (
        "#" +
        ((1 << 24) + (RGB.red << 16) + (RGB.green << 8) + RGB.blue)
          .toString(16)
          .slice(1)
      );
    },
    /**
     * Conversion from Hex to RGB
     *
     * @param {String} hex Hexadecimal string to convert
     * @returns {Object} RGB format
     */
    fromHex(hex) {
      // console.log(hex);
      try {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
          red: parseInt(result[1], 16),
          green: parseInt(result[2], 16),
          blue: parseInt(result[3], 16),
        };
      } catch (err) {
        console.error(hex, this.activeModel);
        console.error(err);
      }
    },
    toCMYK(RGB) {
      let result = rgb.cmyk([RGB.red, RGB.blue, RGB.green]).map((arg) => {
        return +("" + arg.toFixed(2));
      });
      return {
        cyan: result[0],
        magenta: result[1],
        yellow: result[2],
        black: result[3],
      };
    },
    toRGB(CMYK) {
      let result = cmyk.rgb([CMYK.cyan, CMYK.magenta, CMYK.yellow, CMYK.black]);
      return {
        red: Math.round(result[0]),
        green: Math.round(result[1]),
        blue: Math.round(result[2]),
      };
    },
  },
};
</script>

<style></style>

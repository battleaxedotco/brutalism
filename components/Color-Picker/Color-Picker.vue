<template>
  <div :class="['color-picker-wrapper', { disabled }]" @input="updateValue">
    <div @click="promptColorPicker" v-if="$slots.default">
      <slot />
    </div>
    <div class="color-picker-container" v-else>
      <div class="color-picker-swatch" @click="promptColorPicker">
        <div
          class="color-picker-swatch-content"
          :style="{
            borderColor: this.active ? 'var(--color-selection)' : '#fff',
            background: this.realValue.length ? this.realValue : 'transparent',
          }"
        />
      </div>
      <div class="color-picker-label">
        {{
          showValue
            ? realValue.length
              ? realValue
              : placeholder
            : label.length
            ? label
            : placeholder
        }}
      </div>
    </div>
  </div>
</template>

<script>
import spy from "cep-spy";
import { evalScript } from "cluecumber";

export default {
  props: {
    label: {
      type: String,
      default: "Custom color",
    },
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "No value",
    },
    showValue: {
      type: Boolean,
      default: false,
    },
    prefsId: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    val: "",
    lastModified: "value",
    active: false,
    schema: [
      {
        apps: ["AEFT"],
        callback: "promptAEFT",
      },
      {
        apps: ["PHXS"],
        callback: "promptPHXS",
      },
      {
        apps: ["ILST"],
        callback: "promptLegacy",
      },
    ],
  }),
  computed: {
    validHex() {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.value);
    },
    realValue: {
      get() {
        return this[this.lastModified];
      },
      set(val) {
        this.lastModified = "val";
        this.val = val;
      },
    },
    hostColor: {
      get() {},
      set(val) {
        this.val = this.rgbToHex(val);
        this.$emit("input", this.val);
        return val;
      },
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.lastModified = "value";
        this.$emit("update", val);
      }
    },
    val(val) {
      if (val) {
        this.lastModified = "val";
        this.$emit("update", val);
      }
    },
  },
  mounted() {
    if (this.debug) console.log(this);
  },
  methods: {
    updateValue(value) {
      this.value = value;
    },
    reset() {
      this.hostColor = null;
      this.active = false;
    },
    async promptColorPicker() {
      this.active = true;
      let isFound = this.schema.find((item) => {
        return item.apps.includes(spy.appName);
      });
      let result = !isFound
        ? await this.promptLegacy()
        : await this[`${isFound.callback}`]();
      this.active = false;
      if (result) this.hostColor = temp;
    },
    async promptAEFT() {
      console.log("Prompt AEFT");
    },
    async promptPHXS() {
      let result = await evalScript(`(function() {
        var lastColor = app.foregroundColor;
        var color = app.showColorPicker();
        if (color) {
          var result = app.foregroundColor;
          app.foregroundColor = lastColor;
          return JSON.stringify({
            type: "RGB",
            red: result.rgb.red,
            green: result.rgb.green,
            blue: result.rgb.blue
          })
        } else return false;
      }())`);
      if (result) this.hostColor = result;
    },
    async promptLegacy() {
      console.log("Prompt Legacy");
    },
    rgbToHex(rgbArray) {
      if (this.debug) console.log(rgbArray);
      let temp;
      if (!(rgbArray instanceof Array)) {
        if (
          /object/i.test(typeof rgbArray) &&
          Object.keys(rgbArray).includes("red")
        ) {
          temp = [rgbArray.red, rgbArray.green, rgbArray.blue];
        } else {
          console.log("Unknown format:", rgbArray);
          return null;
        }
      } else temp = rgbArray;
      while (temp.length > 3) temp.pop();
      return `#${temp
        .map((c) => {
          c = c <= 255 ? Math.abs(Math.floor(c)).toString(16) : 0;
          return c.length < 2 ? `0${c}` : c;
        })
        .join("")}`;
    },
  },
};
</script>

<style>
.color-picker-container {
  display: flex;
  justify-self: flex-start;
  flex-wrap: nowrap;
}

.color-picker-container.disabled {
  opacity: 0.4;
}

.color-picker-label {
  display: flex;
  align-items: center;
  padding: 0px 10px;
}

.color-picker-swatch {
  cursor: pointer;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border: 0.5px solid black;
}
.color-picker-swatch-content {
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <!-- 
    This is getting too obtuse with color models. Should be revamped so that models
    can accept either 'red' or 'r', Object.keys iterate with first letter.toLowerCase() to use

    Not sure how to implement LAB, HSB, Spot or Gradient yet
   -->
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
      <div
        :class="[
          'color-picker-label',
          {
            uppercase,
          },
        ]"
        v-if="!editable"
      >
        {{
          showValue
            ? styleString.length
              ? styleString
              : placeholder
            : label.length
            ? label
            : placeholder
        }}
      </div>
      <div v-else :class="['color-picker-input', realModel, { filled, flat }]">
        <div v-if="realModel == 'hex'">
          <Input
            @input="updateValue"
            prefix="#"
            :max-length="6"
            :flat="flat"
            :filled="filled"
            uppercase
            placeholder="value"
            v-model="inputval"
            :style="{
              width: realInputWidth,
            }"
          />
        </div>
        <div v-else-if="realModel == 'rgb'" style="display: flex;">
          <Input-Scroll
            style="width: 40px;"
            prefix="R"
            v-model="model.rgb.red"
            :flat="flat"
            :filled="filled"
            :max="255"
            :min="0"
          />
          <Input-Scroll
            style="width: 40px;"
            prefix="G"
            v-model="model.rgb.green"
            :flat="flat"
            :filled="filled"
            :max="255"
            :min="0"
          />
          <Input-Scroll
            style="width: 40px;"
            prefix="B"
            v-model="model.rgb.blue"
            :flat="flat"
            :filled="filled"
            :max="255"
            :min="0"
          />
        </div>
        <div v-else-if="realModel == 'cmyk'" style="display: flex;">
          <Input-Scroll
            style="width: 40px;"
            prefix="C"
            v-model="model.cmyk.cyan"
            :flat="flat"
            :filled="filled"
            :max="100"
            :min="0"
          />
          <Input-Scroll
            style="width: 40px;"
            prefix="M"
            v-model="model.cmyk.magenta"
            :flat="flat"
            :filled="filled"
            :max="100"
            :min="0"
          />
          <Input-Scroll
            style="width: 40px;"
            prefix="Y"
            v-model="model.cmyk.yellow"
            :flat="flat"
            :filled="filled"
            :max="100"
            :min="0"
          />
          <Input-Scroll
            style="width: 40px;"
            prefix="K"
            v-model="model.cmyk.black"
            :flat="flat"
            :filled="filled"
            :max="100"
            :min="0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const isBrowser = !window.__adobe_cep__;
const spy = window.__adobe_cep__ ? require("cep-spy").default : null;
import { evalScript } from "cluecumber";

export default {
  props: {
    label: {
      type: String,
      default: "Custom color",
    },
    colorModel: {
      type: String,
      default: "hex",
    },
    value: {
      type: [String, Object],
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
    editable: {
      type: Boolean,
      default: false,
    },
    uppercase: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    inputWidth: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    val: "",
    hostValue: null,
    model: {
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
    inputval: "",
    lastModified: "value",
    active: false,
    type: "colorPicker",
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
        callback: "promptILST",
      },
    ],
  }),
  // http://www.easyrgb.com/en/math.php
  // http://www.brucelindbloom.com/index.html?Equations.html
  computed: {
    shouldUpdateVModelObject() {
      return this.realModel !== "hex" && /object/i.test(this.value);
    },
    validHex() {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.value);
    },
    realModel() {
      let possibles = ["hex", "rgb", "cmyk", "lab", "hsb"];
      let found = possibles.find((model) => {
        return model == this.colorModel.toLowerCase();
      });
      return found ? found : possibles[0];
    },
    styleString() {
      // if (this.debug) console.log(this.value, this.realModel)
      // if (this.realModel == 'hex' && !this.value.length)
      if (/string/i.test(typeof this.value) && !this.realValue.length)
        return "transparent";
      // if (this.debug) console.log('PASSED')
      if (this.realModel == "cmyk") {
        let result = this.cmykToHex();
        // if (this.debug) console.log(result)
        return result;
      } else if (this.realModel == "hex") {
        return this.realValue.length ? this.realValue : "transparent";
      } else if (this.realModel == "rgb") {
        return `rgb(${this.activeModel.red}, ${this.activeModel.green}, ${this.activeModel.blue})`;
      } else {
        return "transparent";
      }
    },
    valueAsString() {
      let str = this.realModel == "hex" ? this.styleString : "";
      let temp = {};
      Object.keys(this.activeModel).forEach((key) => {
        if (key !== "type") temp[key] = this.activeModel[key];
      });
      if (this.realModel !== "hex") {
        str = `${this.realModel.toLowerCase()}(`;
        Object.keys(temp).forEach((key, index) => {
          if (key !== "type")
            str += `${temp[key]}${
              index !== Object.keys(temp).length - 1 ? ", " : ""
            }`;
        });
        str += ")";
      }
      return str;
    },
    activeModel() {
      return this.model[this.realModel];
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
    realInputWidth() {
      if (this.inputWidth) return this.inputWidth;
      else if (this.flat) return "52px";
      else if (this.filled) return "54px";
      else return "52px";
    },
    hostColor: {
      get() {
        return this.hostValue;
      },
      set(val) {
        this.hostValue = val;
        if (/hex/i.test(this.realModel)) {
          this.val = this.rgbToHex(val);
          this.$emit("input", this.val);
        }
        return val;
      },
    },
  },
  watch: {
    valueAsString(val) {
      if (this.shouldUpdateVModelObject) {
        this.$emit("update", this.activeModel);
        this.$emit("input", this.activeModel);
        // if (this.debug) console.log('STRING:', val, this.realModel)
      }
    },
    realValue(value) {
      // if (this.debug) console.log('REAL VAL:', value)
      if (this.prefsId.length) this.setPrefsById(this.prefsId, value);
      this.$emit("update", value);
    },
    activeModel(value) {
      if (this.debug) console.log("ACTIVE MODEL:", value);
    },
    value(val) {
      // if (this.debug) console.log(val, this.realModel)
      if (val) {
        this.lastModified = "value";
        if (this.realModel == "hex") this.inputval = val.replace(/^#/, "");
        else {
          if (this.debug) console.log("MODEL NOT SET:", val);
        }
      }
    },
    val(val) {
      if (val) {
        this.lastModified = "val";
        if (this.realModel == "hex") this.inputval = val.replace(/^#/, "");
        else {
          if (this.debug) console.log("VAL NOT SET:", val);
        }
      }
    },
    inputval(val) {
      if (this.realModel == "hex") {
        if (!val.length) this.realValue = "";
        else this.updateValue(val);
      } else {
        if (this.debug) console.log("INPUTVAL NOT SET:", val);
      }
    },
  },
  mixins: [require("../mixinPrefs").default],
  mounted() {
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let lastState = this.checkPrefsFor(this.prefsId);
      if (lastState === null) {
        // Do nothing...
      } else {
        let content = lastState.value;
        this.val = content;
        this.$emit("prefs", content);
      }
    } else if (this.value) {
      if (this.realModel == "hex") this.inputval = this.value.replace("#", "");
      else Object.assign(this.activeModel, this.value);
    }
  },
  methods: {
    hexToRgb() {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
        this.styleString
      );
      return result
        ? {
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16),
          }
        : null;
    },
    cmykToHex() {
      let c = this.model.cmyk.cyan / 100,
        m = this.model.cmyk.magenta / 100,
        y = this.model.cmyk.yellow / 100,
        k = this.model.cmyk.black / 100;
      function padZero(str) {
        return "000000".substr(str.length) + str;
      }

      var cyan = (c * 255 * (1 - k)) << 16;
      var magenta = (m * 255 * (1 - k)) << 8;
      var yellow = (y * 255 * (1 - k)) >> 0;
      var black = 255 * (1 - k);
      var white = black | (black << 8) | (black << 16);
      var color = white - (cyan | magenta | yellow);
      return "#" + padZero(color.toString(16));
    },
    updateValue(value) {
      this.realValue = `#${value}`;
      if (this.validateAsHexString(`${value}`))
        this.$emit("input", `#${value}`);
    },
    validateAsHexString(value) {
      return (
        value.length < 7 && /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
      );
    },
    reset() {
      this.hostColor = null;
      this.active = false;
    },
    async promptColorPicker() {
      if (isBrowser) {
        if (this.debug)
          console.error("Cannot launch Adobe Color-Picker in browser.");
        return null;
      }
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
      let result = await evalScript(`(function () {
        function setComp() {
            if (app.activeViewer) {
                app.activeViewer.setActive();
                thisComp = app.project.activeItem;
                return thisComp || thisComp instanceof CompItem;
            } else return app.project.items[0];
        }
        // 
        // Set comp and layer
        // 
        var thisComp = setComp();
        var thisLayer = thisComp.layers.addShape();
        // 
        // Record selected properties then deselect them
        // 
        var lastSelection = makeIterable(thisComp.selectedProperties);
        toggleAllSelection(lastSelection, false);
        // 
        // Create temporary color control, Edit Value command
        // 
        var colorControl = thisLayer.Effects.addProperty("ADBE Color Control")
        colorControl.property("ADBE Color Control-0001").selected = true;
        app.executeCommand(+app.findMenuCommandId("Edit Value..."))
        var result = colorControl.property("ADBE Color Control-0001").value;
        // 
        // Remove control, try to restore selection, return result
        // 
        thisLayer.remove();
        toggleAllSelection(lastSelection, true);
        // 
        return JSON.stringify(result)
    
        function toggleAllSelection(list, status) {
            for (var i = 1; i <= list.length; i++) 
                list[i].selected = status        
        }
        function makeIterable(original) {
            var clone = [];
            for (var i = 0; i < original.length; i++)
                clone.push(original[i])
            return clone;
        }
      }())`);

      // Not sure how to handle Cancel events
      // Seem identical to user entering FF0000
      if (result) {
        if (!this.isFF0000(result)) {
          this.hostColor = result;
        }
      }
    },
    isFF0000(targ) {
      let res = [1, 0, 0, 1];
      for (let i = 0; i < res.length; i++) if (res[i] !== targ[i]) return false;
      return true;
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
    async promptILST() {
      let prev = {};
      if (!/hex/i.test(this.realModel)) Object.assign(prev, this.activeModel);
      else {
        let temp = this.hexToRgb();
        Object.assign(prev, temp);
      }
      let inputColor;
      if (/rgb|hex/i.test(this.realModel))
        inputColor = `var temp = new RGBColor();
          temp.red = ${prev.red || 127};
          temp.green = ${prev.green || 127};
          temp.blue = ${prev.blue || 127};`;
      else if (/cmyk/i.test(this.realModel))
        inputColor = `var temp = new CMYKColor();
          temp.cyan = ${prev.cyan || 0};
          temp.magenta = ${prev.magenta || 0};
          temp.yellow = ${prev.yellow || 0};
          temp.black = ${prev.black || 0}`;
      let outputColor = /rgb|hex/i.test(this.realModel)
        ? `{
            type: "RGB",
            red: Math.round(result.red),
            green: Math.round(result.green),
            blue: Math.round(result.blue)
          }`
        : /cmyk/i.test(this.realModel)
        ? `{
            type: "CMYK",
            cyan: Math.round(result.cyan),
            magenta: Math.round(result.magenta),
            yellow: Math.round(result.yellow),
            black: Math.round(result.black),
          }`
        : `return null;`;

      let code = `(function() {
        ${inputColor}
        var result = app.showColorPicker(temp);
        if (result !== temp) {
          return JSON.stringify(${outputColor})
        } else return false;
      }())`;
      let result = await evalScript(code);
      if (!result) return null;
      if (result && this.realModel == "hex") this.hostColor = result;
      else {
        Object.assign(this.activeModel, result);
      }
    },
    async promptLegacy() {
      if (this.debug) console.log("Prompt Legacy");
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
          if (this.debug) console.log("Unknown format:", rgbArray);
          return null;
        }
      } else temp = rgbArray;
      while (temp.length > 3) temp.pop();
      if (spy.appName == "AEFT")
        temp = temp.map((col) => {
          return +(col * 255).toFixed(0);
        });
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
.color-picker-container,
.color-picker-wrapper {
  display: flex;
  justify-self: flex-start;
  flex-wrap: nowrap;
  align-items: center;
}

.color-picker-wrapper {
  box-sizing: border-box;
  height: 22px;
}

.color-picker-wrapper.readOnly {
  pointer-events: none;
  cursor: default;
}

.color-picker-wrapper.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.color-picker-label {
  display: flex;
  align-items: center;
  padding: 0px 10px;
}

.color-picker-label.uppercase {
  text-transform: uppercase;
}

.color-picker-input {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  margin-left: 6px;
}

.color-picker-input .input-container {
  margin: 0px;
}
.color-picker-input .input-container input,
.color-picker-input .input-container {
  font-size: 10px;
}

.color-picker-input:not(.filled):not(.flat),
.color-picker-input.filled {
  margin-top: 2.5px;
}

.color-picker-input .input-inside.default.active {
  border-radius: 3px 3px 0px 0px;
}

.color-picker-wrapper .default.input-inside,
.color-picker-wrapper .filled.input-inside {
  padding-left: 4px;
}

.color-picker-input .input-container {
  padding: 0px;
}

.color-picker-swatch {
  cursor: pointer;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 0.5px solid black;
}
.color-picker-swatch-content {
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  width: 100%;
  height: 100%;
}

.color-picker-input .input-scroll-container {
  margin-right: 4px;
}
</style>

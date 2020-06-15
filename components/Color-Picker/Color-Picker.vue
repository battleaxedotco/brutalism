<template>
  <div :class="['color-picker-wrapper', { disabled }]">
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
      <div class="color-picker-label" v-if="!editable">
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
      <div v-else class="color-picker-input">
        <Input
          @input="updateValue"
          prefix="#"
          :max-length="6"
          flat
          uppercase
          placeholder="hex value"
          v-model="inputval"
          style="width: fit-content; max-width: 64px;"
        />
      </div>
    </div>
  </div>
</template>

<script>
const isBrowser = !window.__adobe_cep__;
const spy = window.__adobe_cep__ ? require("cep-spy") : null;
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
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    val: "",
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
    realValue(value) {
      if (this.prefsId.length) this.setPrefsById(this.prefsId, value);
    },
    value(val) {
      if (val) {
        this.lastModified = "value";
        this.$emit("update", val);
        // this.inputval = val;
      }
    },
    val(val) {
      if (val) {
        this.lastModified = "val";
        this.$emit("update", val);
        // this.inputval = val;
      }
    },
    inputval(val) {
      if (!val.length) this.realValue = "";
      else this.updateValue(val);
      // this.realValue = val;
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
    }
  },
  methods: {
    updateValue(value) {
      if (this.validateAsHexString(value)) {
        this.realValue = `#${value}`;
      }
      // this.value = value;
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
.color-picker-input .input-container input {
  margin-top: -2px;
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

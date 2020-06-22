<template>
  <div
    :class="[{ disabled, readOnly, pseudo, noLabel }, 'textarea-container']"
    :style="[
      {
        width: width,
      },
    ]"
  >
    <span class="textarea-label" v-if="label.length && !noLabel">{{ label }}</span>
    <div
      :class="[
        { flat, filled },
        'textarea-wrapper',
        !flat && !filled ? 'default' : '',
        hasIcon ? 'hasIcon' : '',
      ]"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      :style="[
        !hasIcon
          ? {
              'justify-content': alignPos,
            }
          : {},
      ]"
    >
      <div :class="['textarea-contents', pseudo ? 'pseudo' : '']" @click="$emit('clickinside')">
        <Icon
          v-if="prependOuterIcon.length"
          class="textarea-prepend-outer-icon"
          :name="prependOuterIcon"
          :size="iconSize"
          @click="$emit('prepend-outer-click')"
        />
        <div
          :class="[
            { filled },
            'textarea-inside',
            !flat && !filled ? 'default' : '',
            hasFocus ? 'active' : 'idle',
          ]"
        >
          <Icon
            v-if="prependIcon.length"
            class="textarea-prepend-icon"
            :color="activeColor"
            :name="prependIcon"
            :size="iconSize"
          />
          <textarea
            title
            :wrap="wrap"
            ref="input"
            :placeholder="placeholder"
            :class="[
              { flat, filled },
              'textarea-value',
              !flat && !filled ? 'default' : '',
              hasFocus ? 'active' : 'idle',
              pseudo ? 'pseudo' : '',
            ]"
            :style="[
              {
                color: activeColor,
              },
            ]"
            v-model="val"
            :spellcheck="spellcheck"
            :rows="rows"
            :cols="cols"
            @blur="blur"
            @focus="focus"
            @input="inputEvent"
            @mouseup="altFocus"
            @keyup.enter.ctrl="submit"
            :tabindex="disabled ? '-1' : ''"
          />
          <div
            class="textarea-resizer"
            :class="[
              { flat, filled },
              'textarea-value',
              !flat && !filled ? 'default' : '',
              hasFocus ? 'active' : 'idle',
              !resizeable ? 'hidden' : '',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16.41"
              height="16.41"
              viewBox="0 0 16.41 16.41"
            >
              <line class="resizer-svg" x1="15.71" y1="0.71" x2="0.71" y2="15.71" />
              <line class="resizer-svg" x1="15.71" y1="6.21" x2="6.21" y2="15.71" />
              <line class="resizer-svg" x1="15.71" y1="11.71" x2="11.71" y2="15.71" />
            </svg>
          </div>
          <Icon
            v-if="appendIcon.length"
            style="padding-right: 5px;"
            class="textarea-append-icon"
            :color="activeColor"
            :name="appendIcon"
            :size="iconSize"
          />
        </div>
        <Icon
          v-if="appendOuterIcon.length"
          :size="iconSize"
          class="textarea-append-outer-icon"
          :name="appendOuterIcon"
          @click="$emit('append-outer-click')"
        />
      </div>
      <div
        :class="['indicator-wrapper', hasIcon ? 'hasIcon' : '']"
        :style="[
          {
            'justify-content': alignPos,
          },
        ]"
      >
        <div
          v-if="!filled"
          :class="[hasFocus || hover ? 'active' : 'idle', 'textarea-indicator']"
          :style="[
            {
              background: hasFocus ? realColor : 'var(--color-default)',
              height: underlineSize,
            },
          ]"
        />
      </div>
    </div>
    <!-- <div class="textarea-error-message">{{ error }}</div> -->
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    noLabel: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "var(--color-selection)"
    },
    debug: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    flat: {
      type: Boolean,
      default: false
    },
    filled: {
      type: Boolean,
      default: false
    },
    underlineSize: {
      type: String,
      default: "1.5px"
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    cols: {
      type: Number,
      default: null
    },
    rows: {
      type: Number,
      default: 2
    },
    wrap: {
      type: String,
      default: "soft"
    },
    prependIcon: {
      type: String,
      default: ""
    },
    appendIcon: {
      type: String,
      default: ""
    },
    prependOuterIcon: {
      type: String,
      default: ""
    },
    appendOuterIcon: {
      type: String,
      default: ""
    },
    autoSelect: {
      type: Boolean,
      default: false
    },
    truncate: {
      type: Boolean,
      default: false
    },
    spellcheck: {
      type: Boolean,
      default: false
    },
    iconSize: {
      type: String,
      default: "16px"
    },
    prefsId: {
      type: String,
      default: ""
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    pseudo: {
      type: Boolean,
      default: false
    },
    resizeable: {
      type: Boolean,
      default: true
    }
  },
  mixins: [
    require("../mixinStyleProps").default,
    require("../mixinPrefs").default
  ],
  data: () => ({
    val: null,
    lastVal: null,
    hasFocus: false,
    type: "textArea",
    hover: false,
    error: "Something went wrong"
  }),
  mounted() {
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let lastState = this.checkPrefsFor(this.prefsId);
      if (lastState === null) {
        this.val = this.lastVal = this.value;
      } else {
        this.val = this.lastVal = lastState.value;
        this.$emit("prefs", lastState);
      }
    } else {
      this.val = this.lastVal = this.value;
    }
    if (!this.resizeable) this.$refs.input.style.resize = "none";
  },
  watch: {
    value(val) {
      this.val = val;
    },
    // val(value) {
    // 	if (value !== this.lastVal) this.$emit("update", value);
    // 	this.lastVal = value;
    // },
    hasFocus(val) {
      this.$emit(val ? "focus" : "blur");
      if (!val) {
        if (this.val !== this.lastVal) {
          this.$emit("update", this.val);
          if (this.prefsId.length) this.setPrefsById(this.prefsId, this.val);
        }
        this.lastVal = this.val;
      }
    }
  },
  computed: {
    alignPos() {
      return this.left ? "flex-start" : this.right ? "flex-end" : "center";
    },
    hasIcon() {
      return (
        this.appendIcon.length ||
        this.appendOuterIcon.length ||
        this.prependIcon.length ||
        this.prependOuterIcon.length
      );
    },
    activeColor() {
      return this.hasFocus && this.filled
        ? "var(--color-input-focus-text)"
        : this.filled && this.hover && !this.hasFocus
        ? "var(--default-color) !important"
        : this.filled
        ? "var(--color-icon)"
        : this.flat && this.hasFocus
        ? this.realColor
        : "";
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
    }
  },
  methods: {
    altFocus(evt) {
      if (this.autoSelect) evt.preventDefault();
    },
    focus(evt = null) {
      this.hasFocus = true;
      this.$refs.input.focus();
      if (this.autoSelect)
        this.$nextTick(() => {
          if (evt.target.select) evt.target.select();
        });
    },
    blur() {
      this.hasFocus = false;
      this.$refs.input.blur();
    },
    reset() {
      this.hasFocus = this.hover = false;
    },
    inputEvent(evt) {
      this.$emit("change", this.val);
    },
    submit() {
      this.$emit("submit", this.val);
      this.blur();
    }
  }
};
</script>

<style>
.textarea-container {
  padding: 1px 4px;
  margin: 6px 0px;
  width: calc(100% - 8px);
  font-size: 12px;
  font-family: "Open Sans", sans-serif;
  color: var(--color-icon);
}

.textarea-container.readOnly {
  pointer-events: none;
}

.textarea-wrapper {
  display: flex;
  justify-content: center;
  align-items: baseline;
  flex-wrap: wrap;
  position: relative;
  /* height: 22px; */
}
.textarea-wrapper.hasIcon {
  justify-content: flex-start;
}

.textarea-label {
  font-size: 10px;
  position: relative;
  top: -4px;
}

.textarea-contents,
.textarea-inside {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
}

.textarea-value::selection {
  background-color: var(--highlight-bg);
  color: var(--highlight-text);
}

.truncate {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.textarea-value {
  margin: 0px;
  /* padding: 2px 0px 2px 4px; */
  overflow: visible;
  background: transparent;
  outline: none;
  border: none !important;
  resize: vertical;
  border-style: solid;
  width: 100%;
  color: var(--default-color);
  border-radius: 2px 2px 0px 0px;
}

.textarea-inside:hover:not(.active) {
  color: var(--default-color) !important;
}

.textarea-inside.filled.idle {
  background: var(--color-input);
  border: 1.5px solid var(--color-input-border) !important;
  color: var(--color-input-text) !important;
}

.textarea-inside.filled.active {
  background: var(--color-input-focus);
  border: 1.5px solid var(--color-input-focus-border) !important;
  color: var(--color-input-focus-text) !important;
}

.textarea-value.active:not(.flat):not(.filled) {
  background: var(--color-input-focus);
  color: var(--color-input);
}

.textarea-contents,
.textarea-inside {
  border-radius: 3px;
  display: flex;
  align-items: baseline;
}

.textarea-error-message {
  padding: 4px;
}

.textarea-indicator {
  background: var(--color-selection);
  transition: all 200ms var(--quad) 20ms;
  display: flex;
  justify-content: center;
  /* bottom: 0px;
	position: absolute;
	left: 0px; */
}

.indicator-wrapper {
  width: 100%;
  display: flex;
  overflow: visible;
}

.indicator-wrapper.hasIcon {
  width: calc(100% - 26px);
  justify-content: flex-start;
}

.flat .textarea-indicator.active,
.default .textarea-indicator {
  width: 100%;
}
.flat .textarea-indicator.idle {
  width: 0%;
}

.textarea-append-outer-icon,
.textarea-prepend-outer-icon {
  padding: 0px 5px;
  margin: 2px 0px 0px 0px;
  height: 100%;
}

.textarea-prepend-icon {
  padding-left: 5px;
}

.textarea-append-icon {
  padding-right: 5px;
}

textarea::-webkit-scrollbar {
  width: 8px;
}
textarea::-webkit-scrollbar-thumb {
  border-radius: 15px;
}

textarea::-webkit-scrollbar-button {
  height: 0px;
  display: none;
}

textarea.flat::-webkit-scrollbar-corner {
  display: block;
  background-color: var(--color-bg);
}
textarea::-webkit-scrollbar-track-piece {
  display: block;
  height: 100%;
}
textarea::-webkit-resizer {
  display: block;
  border: none;
  /* background: var(--color-bg); */
}
.input-value.active::-webkit-resizer,
.input-value.active::-webkit-scrollbar-corner {
  background: red;
}
textarea.default.idle::-webkit-resizer {
  background: var(--color-bg) !important;
}
textarea.flat.idle::-webkit-resizer {
  background: var(--color-bg);
}
textarea.filled.idle::-webkit-resizer {
  background: var(--color-input);
}
textarea.filled.active::-webkit-resizer {
  background: var(--color-input-focus);
}
.active.filled::-webkit-resizer {
  background-color: var(--color-input-focus) !important;
}

.idle.filled::-webkit-resizer {
  background-color: var(--color-input) !important;
}
.textarea-resizer {
  pointer-events: none;
  position: absolute;
  right: 1px;
  bottom: 1px;
  overflow: visible;
  width: 7px;
  height: 7px;
}

.filled .textarea-resizer {
  right: 2px;
}
.textarea-resizer > svg {
  width: 100%;
  height: 7px;
  position: absolute;
}

.resizer-svg {
  fill: none;
  stroke: #fff;
  stroke-miterlimit: 10;
  stroke-width: 2px;
}

.filled.idle::-webkit-scrollbar,
.filled.idle::-webkit-scrollbar-corner {
  background-color: var(--color-scrollbar);
}
.filled.idle::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
}
.filled.idle::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover);
}

.filled.active::-webkit-scrollbar,
.filled.active::-webkit-scrollbar-corner {
  background-color: var(--color-input-focus);
}
.filled.active::-webkit-scrollbar-thumb {
  background: #a8a8a8;
  border-radius: 15px;
}
.filled.active::-webkit-scrollbar-thumb:hover {
  background: #8f8f8f;
}

.filled.active > svg > line {
  stroke: var(--color-input-focus-text);
  fill: none;
}

.textarea-resizer.hidden {
  display: none;
}

/* .default.active::-webkit-scrollbar-corner {
	background: var(--color-input-focus);
}
.default.idle::-webkit-scrollbar-corner {
	background: var(--color-bg);
} */

.textarea-value.pseudo {
  cursor: pointer !important;
}

.textarea-value:not(.flat).idle::-webkit-scrollbar,
.textarea-value:not(.flat).idle::-webkit-scrollbar-corner {
  background-color: var(--color-scrollbar);
}
.textarea-value:not(.flat).idle::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
}
.textarea-value:not(.flat).idle::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover);
}

.textarea-value:not(.flat).active::-webkit-scrollbar,
.textarea-value:not(.flat).active::-webkit-scrollbar-corner {
  background-color: var(--color-input-focus);
}

.textarea-value:not(.flat).active::-webkit-scrollbar-corner {
  margin-top: 7px;
}
.textarea-value:not(.flat).active::-webkit-scrollbar-thumb {
  background: #a8a8a8;
  border-radius: 15px;
}
.textarea-value:not(.flat).active::-webkit-scrollbar-thumb:hover {
  background: #8f8f8f;
}

.textarea-value:not(.flat).active > svg > line {
  stroke: var(--color-input-focus-text);
}
</style>

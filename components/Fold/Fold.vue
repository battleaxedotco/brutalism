<template>
  <div
    class="fold"
    :style="{ 'margin-top': marginTop, margin: margin, padding: padding }"
  >
    <div class="fold-label" @click="toggle">
      <div class="fold-label-text">{{ label }}</div>
      <div class="fold-icon" :class="{ flip: !isOpen }">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
      </div>
    </div>
    <!-- We should use v-show instead of v-if, but can't assign v-show
          to a slot: https://github.com/vuejs/vue/issues/5326
        
        So instead we can wrap it in a <div> and use v-show there,
        otherwise the data inside will be reset whenever the user
        folds and unfolds. Checkboxes, inputs, etc. will all reset
    -->
    <div
      class="fold-content"
      v-if="persistent"
      v-show="isOpen"
      :style="{ padding: innerPadding }"
    >
      <slot />
    </div>
    <div v-else>
      <div
        class="fold-content"
        v-if="isOpen"
        :style="{ padding: innerPadding }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    isOpen: null,
    type: "fold",
  }),
  mixins: [
    require("../mixinStyleProps").default,
    require("../mixinPrefs").default,
  ],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    persistent: {
      type: Boolean,
      default: true,
    },
    innerPadding: {
      type: String,
      default: "",
    },
    prefsId: {
      type: String,
      default: "",
    },
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
      this.$emit("click");
      this.$emit("clicked");
      if (this.prefsId) {
        this.setPrefsById(this.prefsId, this.isOpen);
      }
    },
  },
  watch: {
    open(val) {
      this.toggle();
    },
    isOpen(val) {
      this.$emit(val ? "open" : "close");
    },
  },
  created() {
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let lastState = this.checkPrefsFor(this.prefsId);
      if (lastState === null) {
        this.isOpen = this.open;
      } else {
        this.isOpen = lastState.value;
        this.$emit("prefs", lastState);
      }
    } else {
      this.isOpen = this.open;
    }
  },
};
</script>

<style>
.fold {
  border-top: solid var(--fold-border-width) var(--fold-border);
  width: 100%;
  cursor: default;
  padding-bottom: 0;
  margin-bottom: 0 !important;
  cursor: default;
  user-select: none;
}

.fold-content > .fold {
  width: calc(100% - 10px);
  padding-left: 10px;
}
.fold-label {
  padding: 6px 0;
  display: flex;
  flex-wrap: none;
  justify-content: space-between;
}
.fold-label-text {
  text-transform: uppercase;
  letter-spacing: 0.25ch;
  user-select: none;
}
.fold-icon {
  float: right;
  margin-top: -2px;
  fill: var(--color-icon);
  height: 18px;
  transform-origin: 50% 50%;
  transition: all 0.15s cubic-bezier(0, 0, 0.2, 1);
}
.fold-icon.flip {
  transform: rotate(-90deg);
}
.fold-content {
  padding-bottom: 8px;
}
</style>

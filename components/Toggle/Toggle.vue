<template>
  <div
    @click="updateState"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    :class="['toggle-item', { disabled, centered, custom, readOnly }]"
    :style="{ color: color }"
  >
    <slot v-if="hasSlotContent" />
    <div class="toggle-contents" v-else>
      <Icon :name="activeIcon" :size="size" />
      <span v-if="label.length" class="label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    onIcon: {
      type: String,
      default: "checkbox-intermediate"
    },
    offIcon: {
      type: String,
      default: "checkbox-blank-outline"
    },
    custom: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: "18px"
    },
    color: {
      type: String,
      default: ""
    },
    centered: {
      type: Boolean,
      default: false
    },
    checkbox: {
      type: Boolean,
      default: false
    },
    radio: {
      type: Boolean,
      default: false
    },
    switch: {
      type: Boolean,
      default: false
    },
    debug: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    },
    prefsId: {
      type: String,
      default: ""
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  mixins: [require("../mixinPrefs").default],
  mounted() {
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let lastState = this.checkPrefsFor(this.prefsId);
      if (lastState === null) {
        this.realState = this.state;
      } else {
        this.realState = lastState.value;
        this.$emit("prefs", lastState);
      }
    }
  },
  data: function() {
    return {
      type: "toggle",
      realState: this.state,
      sets: [
        {
          name: "radio",
          onIcon: "radiobox-marked",
          offIcon: "radiobox-blank"
        },
        {
          name: "checkbox",
          onIcon: "checkbox-intermediate",
          offIcon: "checkbox-blank-outline"
        },
        {
          name: "switch",
          onIcon: "toggle-switch",
          offIcon: "toggle-switch-off"
        }
      ]
    };
  },
  computed: {
    hasSlotContent() {
      return this.$slots.default;
    },
    activeIcon() {
      let activeSet = this.sets.find(item => {
        return this[item.name];
      });
      let result = !activeSet
        ? this.realState || this.value
          ? this.onIcon
          : this.offIcon
        : this.realState || this.value
        ? activeSet.onIcon
        : activeSet.offIcon;
      return result;
    }
  },
  watch: {
    state(val) {
      this.realState = val;
      this.$emit("input", val);
    },
    value(val) {
      this.realState = val;
      this.$emit("input", val);
    }
  },
  methods: {
    updateState() {
      if (this.disabled || this.readOnly) return null;
      this.$emit("click");
      this.realState = !this.realState;
      this.$emit("update", this.realState);
      this.$emit("input", this.realState);
      if (this.prefsId.length) {
        this.setPrefsById(this.prefsId, this.realState);
      }
    }
  }
};
</script>

<style scoped>
.toggle-contents {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: center;
}

.toggle-item {
  box-sizing: border-box;
  width: fit-content;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  overflow: hidden;
  color: var(--color-icon);
}

.toggle-item.readOnly {
  pointer-events: none;
}

.toggle-item:not(.custom) {
  align-items: center;
}
.toggle-item.custom {
  align-items: flex-start;
}

.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.label {
  padding-left: 6px;
}
.custom .label {
  margin-top: 2px;
}
</style>

<template>
  <div :class="['brutalism-select-wrapper', { disabled, labelOnTop }]">
    <div :class="['brutalism-position-offset', { labelOnTop }]">
      <div v-if="label.length" class="select-label">{{ label }}</div>
      <div
        :class="[
          'select-container',
          open ? 'active' : inside && !open ? 'hover' : 'idle',
          override ? 'override' : '',
          !flat ? 'default' : '',
          { flat },
        ]"
        @click="toggleOpen"
      >
        <div
          :class="[
            'select-contents',
            !flat ? 'default' : '',
            appName == 'PHXS' ? 'PHXS' : '',
            { flat },
          ]"
          @mouseenter="inside = true"
          @mouseleave="inside = false"
        >
          <div class="select-value" v-if="!prompt.length">
            <Option v-if="activeItem.model" :model="activeItem.model" />
            <Option v-else-if="activeItem.node" :node="activeItem.node" />
            <div v-else>{{ activeItem.label }}</div>
          </div>
          <div class="select-value" v-else>
            <div>{{prompt}}</div>
          </div>
          <div class="select-arrow">
            <svg width="18" style="fill: var(--color-icon);" height="18" viewBox="0 0 24 24">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </div>
        </div>
        <ul
          :class="['select-menu', open ? 'show' : 'hidden']"
          v-if="isMounted && menu.length && !$slots.default"
          :style="getMenuStyle()"
        >
          <li
            v-for="(item, i) in menu"
            :key="i"
            :ref="i"
            @click="activeItem = item"
            @mouseenter="item.hover = true"
            @mouseleave="item.hover = false"
            :class="[
              'select-menu-item',
              item.active ? 'active' : 'idle',
              indicatorToRight ? 'reverse' : '',
              noIndicator ? 'no-indicator' : '',
              appName == 'PHXS' ? 'PHXS' : '',
            ]"
          >
            <div
              v-if="!noIndicator && $slots.indicator && !prompt.length"
              :style="{
                visibility:
                  item.active && !noIndicator && $slots.indicator && open
                    ? 'visible'
                    : 'hidden',
                margin: !indicatorToRight
                  ? '0px 3px 0px 0px'
                  : '0px 0px 0px 3px',
              }"
            >
              <slot name="indicator" v-if="$slots.indicator" />
            </div>
            <Icon
              name="check"
              v-if="!$slots.indicator && !noIndicator && !prompt.length"
              size="16px"
              :style="`width: 20px; height: 16px; margin-top: -6px; padding: 0px ${
                indicatorToRight ? '3px 0px 6px' : '3px 0px 3px'
              }; visibility: ${item.active && open ? 'visible' : 'hidden'}`"
            />
            <span
              :class="[
                'select-menu-item-label',
                appName == 'PHXS' ? 'PHXS' : '',
              ]"
            >{{ item.label || item.value }}</span>
          </li>
        </ul>
        <ul
          :class="['select-menu', open ? 'show' : 'hidden']"
          v-else-if="isMounted && menu.length"
          :style="getMenuStyle()"
        >
          <li
            v-for="(item, i) in menu"
            :key="i"
            :ref="i"
            @click="activeItem = item"
            @mouseenter="item.hover = true"
            @mouseleave="item.hover = false"
            :class="[
              'select-menu-item',
              item.active ? 'active' : 'idle',
              indicatorToRight ? 'reverse' : '',
              noIndicator ? 'no-indicator' : '',
              appName == 'PHXS' ? 'PHXS' : '',
              prompt.length ? 'prompted' : ''
            ]"
          >
            <div
              v-if="!noIndicator && $slots.indicator && !prompt.length"
              :style="{
                visibility:
                  item.active && !noIndicator && $slots.indicator && open
                    ? 'visible'
                    : 'hidden',
                margin: !indicatorToRight
                  ? '0px 3px 0px 0px'
                  : '0px 0px 0px 3px',
                
              }"
            >
              <slot name="indicator" v-if="$slots.indicator" />
            </div>
            <Icon
              name="check"
              v-if="!$slots.indicator && !noIndicator && !prompt.length"
              size="16px"
              :style="`width: 20px; height: 16px; margin-top: -6px; padding: 0px ${
                indicatorToRight ? '3px 0px 6px' : '3px 0px 3px'
              }; visibility: ${item.active && open ? 'visible' : 'hidden'}`"
            />
            <Option v-if="item.model" :model="item.model" />
            <Option v-else-if="item.node" :node="item.node" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import spy from "cep-spy";

export default {
  components: {
    Option: require("./Option.vue").default
  },
  props: {
    label: {
      type: String,
      default: ""
    },
    debug: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => {
        return [];
      }
    },
    noIndicator: {
      type: Boolean,
      default: false
    },
    indicatorToRight: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    active: {
      type: Number,
      default: 0
    },
    value: {
      type: String,
      default: ""
    },
    prefsId: {
      type: String,
      default: ""
    },
    flat: {
      type: Boolean,
      default: false
    },
    top: {
      type: Boolean,
      default: false
    },
    labelOnTop: {
      type: Boolean,
      default: false
    },
    prompt: {
      type: String,
      default: ""
    }
  },
  computed: {
    appName() {
      return spy.appName;
    },
    activeItem: {
      get() {
        if (!this.menu || !this.menu.length) return { label: "none" };
        return (
          this.menu.find(item => {
            return item.active;
          }) || this.menu[0]
        );
      },
      set(item) {
        this.menu.forEach(entry => {
          entry.active = false;
        });
        item.active = true;
        // this.$emit('input', item.value)
        if (this.prefsId.length) {
          if (this.debug) console.log("Setting prefsid", item.index);
          this.setPrefsById(this.prefsId, item.index);
        }
      }
    },
    activeIndex: {
      get() {
        if (!this.menu || !this.menu.length) return -1;
      },
      set(val) {
        if (this.debug) console.log("Setting index to:", val);
        // if (val > 0 || val > this.menu.length + 1) return -1;
        if (val > -1 && val < this.menu.length) {
          let target = this.menu[val];
          if (target) {
            this.activeItem = target;
            target.active = true;
          }
        } else {
          return null;
        }
      }
    },
    activeValue: {
      get() {
        return this.activeItem.value;
      },
      set(val) {
        let target = this.menu.find(item => {
          return item.value == val;
        });
        if (target) {
          this.activeItem = target;
          this.$emit("input", val);
        } else {
          console.log("No item found with query value of:", val);
        }
      }
    }
  },
  watch: {
    open(val) {
      const self = this;
      if (!val) {
        this.override = true;
      }
      this.$emit(val ? "open" : "close");
    },
    inside(val) {
      // console.log("INSIDE IS", val);
    },
    activeItem(val) {
      if (val && this.menu.length) {
        this.$emit("update", val.value);
      }
    },
    items(val) {
      if (val && val.length) this.buildMenu();
    },
    active(val) {
      this.activeIndex = val;
    },
    value(val) {
      this.activeValue = val;
    },
    activeValue(val) {
      this.$emit("input", val);
    }
  },
  mounted() {
    window.addEventListener("click", () => {
      if (!this.inside) this.open = false;
    });
    window.addEventListener("mousemove", evt => {
      if (this.override) this.override = false;
    });
    if (this.debug) {
      console.log(this);
      console.log(this.$slots);
    }
    const self = this;
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let temp = this.checkPrefsFor(this.prefsId);
      if (temp === null) {
        // this.realState = this.state;
      } else {
        console.log("Prefsid found:", temp.value);
        this.startIndex = temp.value;
        this.$emit("prefs", temp);
      }
    }
    this.init();
    this.isMounted = true;

    if (this.debug) {
      console.log("Slots:", this.$slots);
      setTimeout(() => {
        console.log(self.$slots.overlay);
      }, 2000);
    }
  },
  mixins: [require("../mixinPrefs").default],
  data: () => ({
    open: false,
    inside: false,
    override: false,
    isMounted: false,
    startIndex: -1,
    type: "select",
    menu: []
  }),
  methods: {
    toggleOpen() {
      if (this.menu.length) this.open = !this.open;
    },
    init() {
      this.buildMenu();
    },
    buildMenu() {
      this.menu = [];
      let list = [];
      // If an array of standard objects or strings
      if (!this.$slots.default && this.items.length) {
        this.items.forEach((entry, index) => {
          let item = {
            index: index,
            active: false,
            hover: false
          };

          if (/string/i.test(typeof entry)) {
            item["label"] = item["value"] = entry;
          } else {
            item["label"] = entry["label"] || entry["name"];
            item["value"] =
              entry["value"] || entry["label"] || entry["name"] || item.index;
          }
          list.push(item);
        });
        this.menu = list;
        if (!this.prompt.length)
          this.activeIndex =
            this.startIndex > -1 ? this.startIndex : this.active;
      } else if (this.$slots.default) {
        // Else if a collection of vNodes or Slots
        this.$slots.default.forEach((slot, index) => {
          let item = {
            value: slot.data.attrs.value,
            index: index,
            active: false,
            hover: false
          };
          if (slot.children) {
            if (!/vue-component/i.test(slot.children[0].tag)) {
              item["node"] = slot;
            } else {
              let str = `<${slot.children[0].componentOptions.tag} `;
              Object.keys(slot.children[0].componentOptions.propsData).forEach(
                key => {
                  str += `${key}="${slot.children[0].componentOptions.propsData[key]}"`;
                }
              );
              str += " />";
              item["model"] = str;
            }
            list.push(item);
          }
        });
        this.menu = list;
        if (!this.prompt.length)
          this.activeIndex =
            this.startIndex > -1 ? this.startIndex : this.active;
      }
      if (this.debug)
        console.log(
          "Active is currently:",
          this.activeItem.label || this.activeItem.value
        );
    },
    getMenuStyle() {
      let style = "z-index: 200 !important;";
      if (this.top) style += "top: 16px;";
      else style += "bottom: 16px;";
      return style;
    },
    determineIfUpOrDown() {
      const self = this;
      this.$nextTick(() => {
        return (
          window.innerHeight - this.$el.getBoundingClientRect().bottom > 100
        );
      });
    },
    determineMaxHeight() {
      return this.determineIfUpOrDown()
        ? window.innerHeight -
            this.$el.getBoundingClientRect().bottom -
            this.padding
        : this.$el.getBoundingClientRect().top -
            window.innerHeight +
            window.innerHeight;
    }
  }
};
</script>

<style>
.brutalism-select-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: baseline;
  box-sizing: border-box;
  position: relative;
  min-height: 25px;
}

.brutalism-select-wrapper.labelOnTop {
  min-height: 48px;
}

.brutalism-position-offset {
  display: flex;
  box-sizing: border-box;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: flex-start;
  box-sizing: border-box;
  position: absolute;
  left: 0px;
}
.brutalism-position-offset.labelOnTop {
  flex-direction: column;
}

.select-label {
  box-sizing: border-box;
  height: 23px;
  display: flex;
  align-items: center;
  color: var(--color-icon);
  margin-right: 6px;
}

.select-container {
  box-sizing: border-box;
}

.select-container:not(.active) {
  overflow: hidden;
}

.select-container.flat {
  margin-top: 1.5px;
}

.select-arrow {
  box-sizing: border-box;
  margin-left: 6px;
  height: 18px;
}

.select-menu {
  top: 0px;
  position: relative;
  box-sizing: border-box;
  border-color: var(--color-dropdown-border);
  border-style: solid;
  box-shadow: 1.5px 1.5px 1px 0px rgba(0, 0, 0, 0.2);
  border-width: 0px 1px 1px 1px;
  /* border-width: 0px 1.5px 1.5px 1.5px;
  box-shadow: 1.5px 1.5px 1px 0px rgba(0, 0, 0, 0.6); */
}

.select-menu.hidden {
  height: 0px;
  visibility: hidden;
}

.select-menu.show {
  visibility: visible;
}

.select-contents {
  padding: 2px 4px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-contents.default {
  border: 1.5px solid var(--color-dropdown-border);
  background: var(--color-dropdown);
  border-radius: 2px;
}

.select-container.active > .select-contents.default.PHXS {
  border-color: var(--color-dropdown-item-hover);
}

.select-container:hover:not(.active):not(.override) > .select-contents {
  background: var(--color-dropdown-hover);
}

ul {
  padding-left: 0px;
  margin: 0px;
}

.select-menu-item {
  font-size: 11px;
  padding: 3px 0;
  cursor: default;
  list-style-type: none;
  display: flex;
  justify-content: flex-start;
  z-index: 200 !important;
  align-items: center;
  background-color: var(--color-dropdown-item);
}

.select-menu-item.prompted {
  padding: 3px;
}

.select-menu-item.PHXS {
  color: #000;
}

.select-menu-item.no-indicator {
  padding: 2px 20px 2px 6px;
}

.select-menu-item.reverse {
  padding: 3px 0px 3px 3px;
  flex-direction: row-reverse;
  justify-content: space-between;
}

.select-menu-item:hover {
  background-color: var(--color-dropdown-item-hover);
}
.select-menu-item.PHXS:hover {
  background-color: var(--color-dropdown-item-hover);
  color: #fff;
}

.select-menu-item.active:not(.PHXS) {
  color: var(--color-selection);
}

.select-menu-item .brutalism-icon {
  font-size: 18px;
}

.select-value .brutalism-icon {
  font-size: 14px;
}

.select-menu-item > .option-wrapper > .brutalism-icon {
}

.select-menu-item-label {
}

option {
  padding: 0px;
}
</style>

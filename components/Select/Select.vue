<template>
  <div :class="['brutalism-select-wrapper', { disabled }]">
    <div class="brutalism-position-offset">
      <div v-if="label.length" class="select-label">{{ label }}</div>
      <div
        :class="[
          'select-container',
          open ? 'active' : inside && !open ? 'hover' : 'idle',
          override ? 'override' : '',
          !flat ? 'default' : '',
          { flat },
        ]"
        @click="open = !open"
      >
        <div
          :class="['select-contents', !flat ? 'default' : '', { flat }]"
          @mouseenter="inside = true"
          @mouseleave="inside = false"
        >
          <div class="select-value">
            <Option v-if="activeItem.model" :model="activeItem.model" />
            <Option v-else-if="activeItem.node" :node="activeItem.node" />
            <div v-else>{{ activeItem.label }}</div>
          </div>
          <div class="select-arrow">
            <svg
              width="18"
              style="fill: var(--color-icon);"
              height="18"
              viewBox="0 0 24 24"
            >
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
            ]"
          >
            <Icon
              name="check"
              v-if="!noIndicator"
              size="16px"
              :style="`width: 20px; height: 16px; margin-top: -6px; padding: 0px ${
                indicatorToRight ? '3px 0px 6px' : '3px 0px 3px'
              }; visibility: ${item.active && open ? 'visible' : 'hidden'}`"
            />
            <span class="select-menu-item-label">
              {{ item.label || item.value }}
            </span>
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
            ]"
          >
            <div
              v-if="!noIndicator"
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
              v-if="!$slots.indicator && !noIndicator"
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
export default {
  components: {
    Option: require("./Option.vue").default,
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    debug: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
    noIndicator: {
      type: Boolean,
      default: false,
    },
    indicatorToRight: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Number,
      default: 0,
    },
    value: {
      type: String,
      default: "",
    },
    prefsId: {
      type: String,
      default: "",
    },
    flat: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    activeItem: {
      get() {
        if (!this.menu || !this.menu.length) return { label: "none" };
        return (
          this.menu.find((item) => {
            return item.active;
          }) || this.menu[0]
        );
      },
      set(item) {
        this.menu.forEach((entry) => {
          entry.active = false;
        });
        item.active = true;
        if (this.prefsId.length) {
          if (this.debug) console.log("Setting prefsid", item.index);
          this.setPrefsById(this.prefsId, item.index);
        }
      },
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
      },
    },
    activeValue: {
      get() {
        return this.activeItem.value;
      },
      set(val) {
        let target = this.menu.find((item) => {
          return item.value == val;
        });
        if (target) {
          this.activeItem = target;
          this.$emit("input", val);
        } else {
          console.log("No item found with query value of:", val);
        }
      },
    },
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
  },
  mounted() {
    window.addEventListener("click", () => {
      if (!this.inside) this.open = false;
    });
    window.addEventListener("mousemove", (evt) => {
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
    menu: [],
  }),
  methods: {
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
            hover: false,
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
        this.activeIndex = this.startIndex > -1 ? this.startIndex : this.active;
      } else if (this.$slots.default) {
        // Else if a collection of vNodes or Slots
        this.$slots.default.forEach((slot, index) => {
          let item = {
            value: slot.data.attrs.value,
            index: index,
            active: false,
            hover: false,
          };
          if (slot.children) {
            if (!/vue-component/i.test(slot.children[0].tag)) {
              item["node"] = slot;
            } else {
              let str = `<${slot.children[0].componentOptions.tag} `;
              Object.keys(slot.children[0].componentOptions.propsData).forEach(
                (key) => {
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
        this.activeIndex = this.startIndex > -1 ? this.startIndex : this.active;
      }
      if (this.debug)
        console.log(
          "Active is currently:",
          this.activeItem.label || this.activeItem.value
        );
    },
    getMenuStyle() {
      let style = "z-index: 200 !important;";
      if (this.determineIfUpOrDown()) style += "top: 16px;";
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
    },
  },
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

.brutalism-position-offset {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: baseline;
  box-sizing: border-box;
  position: absolute;
  left: 0px;
}

.select-label {
  color: var(--color-text-label);
  margin-right: 6px;
}

.select-container {
  box-sizing: border-box;
}

.select-container.default {
  border: 1.5px solid var(--color-dropdown-border);
  background: var(--color-dropdown);
  border-radius: 2px;
}

.select-container:hover:not(.active):not(.override) > .select-contents {
  background: var(--color-dropdown-hover);
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
  /* border: 1.5px solid var(--color-dropdown-border); */
  box-shadow: 1.5px 1.5px 1px 0px rgba(0, 0, 0, 0.6);
}

.select-menu.hidden {
  border-width: 0px;
  height: 0px;
  visibility: hidden;
}

.select-menu.show {
  visibility: visible;
}

.select-contents {
  padding: 1px 4px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-height: 20px;
}
ul {
  padding-left: 0px;
  margin: 0px;
}

.select-menu-item {
  padding: 2px 10px 2px 2px;
  font-size: 12px;
  cursor: default;
  list-style-type: none;
  display: flex;
  justify-content: flex-start;
  z-index: 200 !important;
  align-items: center;
  background-color: var(--color-dropdown-item);
}

.select-menu-item.no-indicator {
  padding: 2px 20px 2px 6px;
}

.select-menu-item.reverse {
  padding: 2px 2px 2px 10px;
  flex-direction: row-reverse;
  justify-content: space-between;
}

.select-menu-item:hover {
  background-color: var(--color-dropdown-item-hover);
}

.select-menu-item.active {
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

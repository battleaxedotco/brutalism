<template>
  <div class="brutalism-select-wrapper">
    <div class="select-label">{{ label }}</div>
    <div
      :class="[
        'select-container',
        open ? 'active' : inside && !open ? 'hover' : 'idle',
      ]"
      @click="open = !open"
      :style="getContainerStyle()"
    >
      <div
        :class="['select-contents']"
        @mouseenter="inside = true"
        @mouseleave="inside = false"
        ref="contents"
      >
        <div class="select-value">{{ activeItem.label }}</div>
        <div class="select-arrow">
          <svg
            width="18"
            style="fill: var(--color-icon)"
            height="18"
            viewBox="0 0 24 24"
          >
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          </svg>
        </div>
      </div>
      <ul
        v-if="isMounted && menu.length"
        class="select-menu"
        :style="getMenuStyle()"
        ref="children"
      >
        <li
          v-for="(item, i) in menu"
          :key="i"
          :ref="i"
          @click="activeItem = item"
          @mouseenter="item.hover = true"
          @mouseleave="item.hover = false"
          :class="['select-menu-item', item.active ? 'active' : 'idle']"
        >
          <Icon
            name="check"
            v-if="item.active"
            size="16px"
            style="width: 20px; height: 16px; margin-top: -6px;"
          />
          <div v-else style="width: 20px" />
          <span class="select-menu-item-label">
            {{ item.label || item.value }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "Label here:",
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
      },
    },
  },

  watch: {
    open(val) {
      console.log(`OPEN IS:`, val);
    },
  },
  mounted() {
    window.addEventListener("click", () => {
      if (!this.inside) this.open = false;
    });
    this.init();
    this.isMounted = true;
    this.getContainerStyle();
  },
  data: () => ({
    open: false,
    inside: false,
    isMounted: false,
    containerWidth: 0,
    menu: [
      {
        label: "Default Figure",
        value: "Default Figure",
        index: 0,
        active: true,
        hover: false,
      },
      {
        label: "Tabuluar Lining",
        value: "tabular lining",
        index: 1,
        active: false,
        hover: false,
      },
      {
        label: "Proportional Oldstyle",
        value: "Proportional Oldstyle",
        index: 2,
        active: false,
        hover: false,
      },
      {
        label: "Proportional Lining",
        value: "Proportional Lining",
        index: 3,
        active: false,
        hover: false,
      },
      {
        label: "Tabular Oldstyle",
        value: "Tabular Oldstyle",
        index: 4,
        active: false,
        hover: false,
      },
    ],
  }),
  methods: {
    init() {
      this.buildMenu();
    },
    buildMenu() {
      return this.menu;
    },
    getMenuStyle() {
      const self = this;
      this.$nextTick(() => {
        let style = `
          max-height: ${self.determineMaxHeight()}px;
          width: 100%;
        `;
        if (self.determineIfUpOrDown()) style += "top: 16px;";
        else style += "bottom: 16px;";

        if (self.open) style += ``;
        else style += `visibility: hidden;`;

        let contents = self.$refs.children;
        if (contents) {
          let children = self.$refs.children.children;
          console.log(children);
        }

        return style;
      });
    },
    determineIfUpOrDown() {
      return true;
      // return window.innerHeight - this.$el.getBoundingClientRect().bottom > 100;
    },
    getContainerStyle() {
      const self = this;

      this.$nextTick(() => {
        let children = this.$refs.children;
        // console.log("Checking...");
        if (children) {
          // console.log("Hidden:", children.getBoundingClientRect());
          self.showChildren = true;
          // console.log("Displayed:", children.getBoundingClientRect());
          self.showChildren = false;
          // let rect = children.getBoundingClientRect();
          // let style = children.style;
          // console.log(rect);
          // // console.log(style);
        }
        // console.log(children);
        return "";
      });
    },
    determineMaxHeight() {
      // return this.determineIfUpOrDown()
      //   ? window.innerHeight -
      //       this.$el.getBoundingClientRect().bottom -
      //       this.padding
      //   : this.$el.getBoundingClientRect().top -
      //       window.innerHeight +
      //       window.innerHeight;
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
}
.select-label {
  color: var(--color-text-label);
  margin-right: 6px;
}

.select-container {
  border: 1.5px solid var(--color-dropdown-border);
  border-radius: 2px;
  background: var(--color-dropdown);
  width: fit-content;
  position: relative;
  box-sizing: border-box;
}

.select-container:hover:not(.active) > .select-contents {
  background: var(--color-dropdown-hover);
}
.select-arrow {
  box-sizing: border-box;
  margin-left: 6px;
  height: 18px;
}

.select-contents {
  padding: 1px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-menu {
  position: absolute;
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
  align-items: center;
  background-color: var(--color-dropdown-item);
}

.select-menu-item:hover {
  background-color: var(--color-dropdown-item-hover);
}

.select-menu-item.active {
  color: var(--color-selection);
}

.select-menu-item-label {
  display: flex;
  flex-wrap: nowrap;
  width: fit-content;
  word-wrap: none;
}
</style>

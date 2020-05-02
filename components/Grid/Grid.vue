<template>
  <div class="brutalism-grid-wrapper" :style="{
    height: height
  }">
    <div class="brutalism-grid-content" :style="getStyle()">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    template: {
      type: String,
      default: ''
    },
    grid: {
      type: String,
      default: ''
    },
    gridArea: {
      type: String,
      default: ''
    },
    gridTemplate: {
      type: String,
      default: ''
    },
    column: {
      type: Boolean,
      default: false
    },
    gap: {
      type: String,
      default: "4px"
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  computed: {
    templateString() {
			if (this.template.length) return this.template;
			return `repeat(${this.$slots.default.length}, 1fr)`
		},
  },
  methods: {
    getStyle() {
      let style = `grid-gap: ${this.gap};`;
      if (!this.grid.length && !this.gridTemplate.length) {
        style += `${ !this.column ? "grid-template-columns"
            : "grid-template-rows"
        }: ${this.templateString};`
      } else if (this.grid.length) {
        style += this.grid.replace(/\;$/, '') + ';'
      } 
      // else if (this.gridTemplate.length) {
      //   console.log('Check')
      //   style += `grid-template: ` + this.gridTemplate.replace(/\;$/, '') + ';'
      // }
      if (this.gridArea.length) style += this.gridArea.replace(/\;$/, '') + ';'
      // console.log(style);
			return style;
		}
  }
}
</script>

<style>
.brutalism-grid-wrapper, .brutalism-grid-content {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.brutalism-grid-content {
  display: grid;
}
</style>
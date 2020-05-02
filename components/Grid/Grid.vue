<template>
  <div class="brutalism-grid-wrapper">
    <div class="brutalism-grid-content" :style="getStyle()">

    </div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    template: {
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
    }
  },
  computed: {
    templateString() {
			if (this.template.length) return this.template;
			return `repeat(${this.$slots.default.length}, 1fr);`
		},
  },
  methods: {
    getStyle() {
			let style = `grid-gap: ${this.gap};`;
			style += `${ this.column ? "grid-template-columns"
					: "grid-template-rows"
      }: ${this.templateString};`
      console.log(style);
			return style;
		}
  }
}
</script>

<style>

</style>
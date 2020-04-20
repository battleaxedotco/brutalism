<template>
	<div class="divider" :style="getStyle()"></div>
</template>

<script>
export default {
	props: {
		vertical: {
			type: Boolean,
			default: false
		}
	},
	mixins: [require("../mixinStyleProps").default],
	methods: {
		getStyle() {
			return `
				border-width: ${this.vertical ? "1px 0px 0px 0px" : "0px 1px 0px 0px"};
				margin: 0px ${this.padding.length ? this.padding : "3"}px;
			`;
		}
	}
};
</script>

<style>
.divider {
	border-style: solid;
	border-color: var(--divider-light);
}
</style>

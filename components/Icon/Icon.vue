<template>
	<span :class="`mdi mdi-${icon}`" :style="{ 'font-size': size, width: size, color: color }"></span>
</template>

<script>
export default {
	props: {
		name: {
			type: String,
			default: "home"
		},
		color: {
			type: String,
			default: ""
		},
		size: {
			type: String,
			default: "24px"
		},
		mdi: {
			type: Boolean,
			default: true
		},
		fa: {
			type: Boolean,
			default: false
		},
		battleaxe: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		icon() {
			return this.name.replace(/mdi-/, "");
		}
	}
};
</script>

<style>
.mdi:before,
.mdi-set {
	box-sizing: border-box;
	/* font-size: 16px !important; */
}

.prefixIcon {
	margin-right: 4px;
}
</style>

<template>
	<div class="panel-info">
		<span :class="{ capitalize, uppercase }">{{
			text ? text : defaultText
		}}</span>
		<span><slot /></span>
	</div>
</template>

<script>
const spy = window.__adobe_cep__
	? require("cep-spy").default
	: require("../../utils/fakeSpy").default;

export default {
	props: {
		text: {
			type: String,
			default: ""
		},
		name: {
			type: Boolean,
			default: false
		},
		version: {
			type: Boolean,
			default: false
		},
		uppercase: {
			type: Boolean,
			default: false
		},
		capitalize: {
			type: Boolean,
			default: false
		},
		route: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		spyName() {
			return this.route
				? this.$route.name
				: this.name
				? spy.extName
				: "Panel info";
		},
		defaultText() {
			if (!this.name && !this.version) return `Panel info`;
			return `${
				this.name || this.route
					? `${this.spyName}${
							(this.name || this.route) && this.version
								? " - "
								: ""
					  }`
					: ""
			}${this.version ? spy.extVersion : ""}`;
		}
	}
};
</script>

<style scoped>
.panel-info {
	user-select: none;
	cursor: default;
	display: flex;
	flex-direction: column;
	line-height: 3ch;
	margin-top: 8px;
}

.uppercase {
	text-transform: uppercase;
}

.capitalize {
	text-transform: capitalize;
}
</style>

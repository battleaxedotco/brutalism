<template>
	<div class="footer-container">
		<transition name="lift">
			<div class="footer" v-show="showFooterMsg">{{msg}}</div>
		</transition>
	</div>
</template>

<script>
export default {
	props: {
		footerMessage: {
			type: String,
			default: ""
		},
		timeout: {
			type: Number,
			default: 2000
		}
	},
	data: () => ({
		msg: null,
		showFooterMsg: false
	}),
	watch: {
		footerMessage(val) {
			if (val) {
				this.showFooterMsg = true;
				this.msg = val;

				setTimeout(() => {
					this.msg = val;
					this.$emit("update:footerMessage", null);
				}, this.timeout);
			} else {
				this.showFooterMsg = false;
			}
		}
	},
	computed: {
		hasSlotData() {
			return this.$slots.default[0];
		}
	}
};
</script>

<style>
.footer-container {
	width: 100vw;
	z-index: 1;
	position: absolute;
	bottom: 0;
	left: 0;
	overflow: hidden;
}
.footer {
	background-color: var(--color-selection);
	text-align: center;
	padding: 4px 20px;
	line-height: 1.15em;
	/* white-space: pre-wrap; */
	word-wrap: break-word;
	font-family: inherit;
	bottom: 0;
}
.lift-enter-active,
.lift-leave-active {
	transition: all 0.5s;
}
.lift-enter,
.lift-leave-to {
	transform: translateY(40px);
}
</style>

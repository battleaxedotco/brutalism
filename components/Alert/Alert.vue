<template>
	<div
		class="alert-overlay"
		:style="getOverlayStyle()"
		@mouseenter="inside = true"
		@mouseleave="inside = false"
	>
		<div
			ref="container"
			class="alert-container"
			:style="getContainerStyle()"
		>
			<div
				ref="wrapper"
				:class="['alert-wrapper', { open }]"
				:style="getWrapperStyle()"
			>
				<div class="alert-contents" v-if="!$slots.default">
					<div class="alert-text">
						{{ text }}
					</div>
					<div
						v-if="dismissable"
						class="dismiss-button"
						@click="open = false"
					>
						<Icon name="close" />
					</div>
				</div>
				<slot v-else />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		debug: {
			type: Boolean,
			default: false
		},
		state: {
			type: Boolean,
			default: false
		},
		dismissable: {
			type: Boolean,
			default: false
		},
		text: {
			type: String,
			default: ""
		},
		timeout: {
			type: Number,
			default: 0
		},
		bottom: {
			type: Boolean,
			default: false
		},
		persistent: {
			type: Boolean,
			default: false
		}
	},
	data: () => ({
		open: false,
		isMounted: false,
		childHeight: 0,
		inside: false,
		isVisible: false
	}),
	watch: {
		state(val) {
			this.open = val;
		},
		open(val) {
			const self = this;
			this.$emit(val ? "open" : "close");
			setTimeout(() => {
				self.isVisible = val;
			}, 200);
			// if (val && !this.persistent)
			// 	this.$nextTick(() => {
			// 		window.addEventListener("click", this.closeOnOutsideClick);
			// 	});
			// if (!val && !this.persistent)
			// 	this.$nextTick(() => {
			// 		window.removeEventListener(
			// 			"click",
			// 			this.closeOnOutsideClick
			// 		);
			// 	});
			if (this.timeout)
				setTimeout(() => {
					self.open = false;
				}, this.timeout);
		}
	},
	mounted() {
		this.childHeight = this.$refs.wrapper.getBoundingClientRect().height;
		this.isMounted = true;
		window.removeEventListener("click", this.closeOnOutsideClick);
		window.addEventListener("click", this.closeOnOutsideClick);
	},
	methods: {
		closeOnOutsideClick() {
			if (!this.inside && this.open && this.isVisible) this.close();
		},
		close() {
			this.open = false;
		},
		getWrapperStyle() {
			let style = "";
			style += !this.bottom
				? `top: ${this.open ? this.childHeight / 2 : 0}px;`
				: `bottom: ${this.open ? this.childHeight / 2 : 0}px;`;
			return style;
		},
		getContainerStyle() {
			return !this.bottom ? "top: -4px;" : "bottom: -4px;";
		},
		getOverlayStyle() {
			return !this.bottom ? "top: 0px;" : "bottom: 0px;";
		}
	}
};
</script>

<style scoped>
.alert-overlay {
	position: absolute;
	width: 0px;
	height: 0px;
	overflow: visible;
}

.alert-container {
	width: calc(100vw - 20px);
	position: absolute;
	display: flex;
	justify-content: center;
	left: 0px;
}

.alert-wrapper {
	width: fit-content;
	padding: 6px 10px;
	border-radius: 3px;
	position: absolute;
	height: fit-content;
	background-color: var(--tooltip-bg);
	color: var(--tooltip-color);
	box-shadow: 1px 2px 6px 0 rgba(0, 0, 0, 0.25);
	transition: opacity 200ms var(--quad) 20ms, top 200ms var(--quad) 20ms,
		bottom 200ms var(--quad) 20ms;
}

.alert-wrapper .open {
	opacity: 1;
}
.alert-wrapper:not(.open) {
	opacity: 0;
}

.alert-contents {
	display: flex;
	justify-content: space-between;
	flex-wrap: nowrap;
	align-items: center;
}

.dismiss-button {
	padding-left: 16px;
}
</style>

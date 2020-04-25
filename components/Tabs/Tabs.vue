<template>
	<div
		class="tabs-wrapper"
		:style="getWrapperStyle()"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
	>
		<div :class="['active-line']" :style="getActiveLineStyle()"></div>
		<div
			v-for="(tab, i) in tabs"
			:class="['tab-wrapper', tab.active ? 'active' : 'idle']"
			:ref="`tab-${i}`"
			:key="i"
			@click="activeIndex = i"
		>
			<div :class="['tab-label', tab.active ? 'tab-active' : 'tab-idle']">
				<span v-if="tab.label">{{ tab.label }}</span>
				<!-- <Icon v-else-if="tab.icon" size="20px" :name="tab.icon" /> -->
			</div>
			<div
				:ref="`tab-${i}-line`"
				:class="['tab-line', { invert }]"
				:style="[showSlider ? 'display: none;' : '']"
			></div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		routes: {
			type: Array,
			default: function() {
				return [{ label: "home", path: "/" }];
			}
		},
		invert: {
			type: Boolean,
			default: false
		},
		delay: {
			type: String,
			default: "20ms"
		},
		duration: {
			type: String,
			default: "200ms"
		},
		timing: {
			type: String,
			default: "var(--quad)"
		},
		breakpoint: {
			type: Number,
			default: 50
		}
	},
	mixins: [
		require("../mixinDebounce").default,
		require("../mixinFileIO").default
	],
	computed: {
		activeItem() {
			return this.tabs.length && this.isMounted
				? this.tabs.find(item => {
						return item.active;
				  })
				: null;
		},
		activeIndex: {
			get() {
				return (this.isMounted && this.activeItem.index) || 0;
			},
			set(val) {
				if (val || val == 0) this.makeActive(this.tabs[val]);
			}
		}
	},
	watch: {
		hover(val) {
			this.showSlider = val;
		},
		activeIndex(val) {
			if (!this.hover) this.swapSliders();
		},
		routes(val) {
			this.init();
		}
	},
	data() {
		return {
			isMounted: false,
			hover: false,
			showSlider: false,
			slideLeft: 0,
			slideTop: 0,
			slideWidth: 0,
			underBreakpoint: false,
			tabs: [],
			overrideParams: true,
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		buildTabs() {
			let tabs = [];
			this.routes.forEach((route, i) => {
				let template = {
					index: i,
					hover: false,
					active: false
				};
				let clone = {};
				let targs = Object.keys(route).filter(value => {
					return /name|path/.test(value);
				})[0];
				let targValue = {};
				targValue[targs] = route[targs];
				clone["target"] = targValue;
				clone["value"] = route.path || route.name;
				Object.assign(clone, template);
				Object.assign(clone, route);
				tabs.push(clone);
			});
			return tabs;
		},
		makeActive(item) {
			if (item.active) return null;
			this.clearActive();
			this.showSlider = true;
			item.active = true;
			this.getSliderPos();
			if (
				this.routes &&
				this.$router &&
				this.$route.name !== item.value &&
				this.$route.path !== item.value
			) {
				if (!this.$route.params || this.overrideParams) {
					this.$router.push(item.target);
				} else if (this.$route.name && this.$route.params) {
					this.$router.push({name: this.$route.name, params: this.$route.params})
					this.overrideParams = false;
				} else {
					this.$router.push(this.$route.path)
				}

			}
		},
		clearActive(active) {
			this.tabs.forEach(item => {
				item.active = active && item.value !== active.value;
			});
		},
		getWrapperStyle() {
			return `grid-template-columns: repeat(${this.tabs.length}, 1fr)`;
		},
		getActiveLineStyle() {
			let style = `width: ${this.slideWidth}px; left: ${
				this.slideLeft
			}px; ${this.invert ? "top" : "bottom"}: ${this.slideTop}px;`;
			style += !this.showSlider ? "display: none;" : "display: block;";
			style += this.delay ? `transition-delay: ${this.delay};` : "";
			style += this.duration
				? `transition-duration: ${this.duration};`
				: "";
			style += this.timing
				? `transition-timing-function: ${this.timing};`
				: "";
			style += this.transition ? `transition: ${this.transition};` : "";
			return style;
		},
		swapSliders() {
			setTimeout(() => {
				this.showSlider = false;
			}, 200);
		},
		getSliderPos() {
			if (!this.activeItem) return null;
			let elt = this.$refs[`tab-${this.activeIndex}`][0];
			let slider = this.$refs[`tab-${this.activeIndex}-line`][0];
			if (elt) {
				let eltpos = elt.getBoundingClientRect(),
					sliderpos = slider.getBoundingClientRect();
				this.underBreakpoint = this.breakpoint >= eltpos.width;
				this.slideTop = this.invert
					? `${eltpos.top - sliderpos.top}px;`
					: `${eltpos.bottom - sliderpos.bottom}px;`;
				this.slideLeft = `${eltpos.left}px;`;
				this.slideWidth = `${eltpos.width}px;`;
			}
		},
		init() {
			const self = this;
			this.tabs = this.buildTabs();
			setTimeout(() => {
				if (!this.$router) return null;
				let activePath = self.$route.path;
				let activeName = self.$route.name;
				let activeTab = self.tabs.filter(tab => {
					let found = false;
					if (tab.value == activePath) found = true;
					else if (tab.value == activeName) found = true;
					return found;
				})[0];
				self.makeActive(activeTab || this.tabs[0]);
				self.isMounted = true;
				self.getSliderPos();
				window.addEventListener(
					"resize",
					self.debounce(self.getSliderPos, 300)
				);
			}, 100);
		}
	}
};
</script>

<style scoped>
.tabs-wrapper {
	position: relative;
	display: grid;
	grid-gap: 0px;
	width: 100%;
	height: 30px;
	margin: 0px;
}

.tab-wrapper {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	cursor: pointer;
	user-select: none;
}
.tab-label {
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(100% - 2px);
	/* font-size: 10px; */
	text-transform: uppercase;
	transition: all 200ms var(--quad) 20ms;
}
.tab-active {
	color: var(--color-selection);
}

.tab-idle {
	color: var(--tabs-idle);
}

.tab-line {
	width: 100%;
	height: 2px;
	background: transparent;
	transition: all 200ms var(--quad) 20ms;
}

.tab-line.invert {
	order: -1;
}

.tab-wrapper.active > .tab-line {
	background: var(--color-selection);
}

.tab-wrapper.idle > .tab-line {
	background: transparent;
}

.tab-wrapper:hover {
	/* background: rgba(91, 155, 211, 0.0325); */
}
.tab-wrapper.idle:hover > .tab-line {
	background: var(--tabs-idle-hover);
}

.tab-wrapper:hover > .tab-idle {
	color: var(--tabs-idle-hover);
}

[class^="active-line"] {
	position: absolute;
	height: 2px;
	background: var(--color-selection);
}

.tab-svg {
	max-height: 22px;
	max-width: 100%;
	border: 1px solid red;
}

.tab-svg svg {
	width: 100%;
	height: 100%;
}
</style>
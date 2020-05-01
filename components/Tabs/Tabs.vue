<template>
	<div
		:class="[ 'tabs-wrapper', { disabled } ]"
		:style="getWrapperStyle()"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
	>
		<div :class="['active-line', { filled, isGradient }]" :style="getActiveLineStyle()"></div>
		<div
			v-for="(tab, i) in tabs"
			:class="['tab-wrapper', tab.active ? 'active' : 'idle', { filled, isGradient }]"
			:ref="`tab-${i}`"
			:key="i"
			@click="clickHandler(i)"
		>
			<div :class="['tab-label', tab.active ? 'tab-active' : 'tab-idle', { filled, isGradient }]">
				<span v-if="tab.label">{{ tab.label }}</span>
				<!-- <Icon v-else-if="tab.icon" size="20px" :name="tab.icon" /> -->
			</div>
			<div
				:ref="`tab-${i}-line`"
				:class="['tab-line', { invert, filled, disabled }]"
				:style="[showSlider ? 'display: none;' : '']"
			></div>
		</div>
	</div>
</template>

<script>
const spy = window.__adobe_cep__ ? require('cep-spy').default : { appName: 'ILST' }

export default {
	props: {
		routes: {
			type: Array,
			default: function() {
				return [{ label: "home", path: "/" }];
			}
		},
		offset: {
			type: Number,
			default: 0
		},
		filled: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		invert: {
			type: Boolean,
			default: false
		},
		emitToParent: {
			type: Boolean,
			default: false,
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
		dummy: {
			type: Boolean,
			default: false
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
		isGradient() {
			return /AEFT|PPRO|AUDT/.test(spy.appName)
		},
		activeIndex: {
			get() {
				return (this.isMounted && this.activeItem.index) || 0;
			},
			set(val) {
				if (val || val == 0) this.makeActive(this.tabs[val]);
			}
		},
		activeRoute() {
			return this.$route
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
		},
		activeRoute(val) {
			const self = this;
			if (!this.dummy && this.activeItem && !window.__adobe_cep__) {
				setTimeout(() => {
					self.doubleCheckRoute(val)
				}, 200);
			}
			if (this.emitToParent && window.parent) {
				let msg = {
					fullPath: val.fullPath,
					hash: val.hash,
					meta: val.meta,
					name: val.name,
					params: val.params,
					path: val.path,
					query: val.query
				}
				window.parent.postMessage(JSON.stringify(msg), "*")
				// const event = new CustomEvent('tabChange', { msg })
				// window.parent.document.dispatchEvent(event);
			}
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
		doubleCheckRoute(val) {
			// console.log('Double check route')
			// if (val.name !== this.activeItem.value || val.path !== this.activeItem.value) {
			// 	console.log('Inside', val)
			// 		let foundTab = this.tabs.find(item => {
			// 			let rx = new RegExp(item.value.replace('home', ''));
			// 			console.log(rx, this.$route.path)
			// 			return rx.test(this.$route.path);
			// 			// return rx.test
			// 		})
			// 		if (foundTab) {
			// 			console.log('Found tab:', foundTab, this.$route)
			// 			this.makeActive(foundTab)
			// 		} else {
			// 			console.log('No found tab...')
			// 			console.log(foundTab, this.$route)
			// 		}
			// 	}
		},
		clickHandler(i) {
			this.activeIndex = i;
			this.$emit('click');
		},
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
			this.$emit('update', item);
			if (this.dummy) return null;
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
			let style = '';
			if (this.disabled) style += 'display: none;'
			if (!this.filled && !this.disabled) {
				style = `width: ${this.slideWidth}px; left: ${
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
			} else {
				style += 'display: none;'
			}
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
			let parent = this.$el;
			if (elt) {
				let eltpos = elt.getBoundingClientRect(),
					sliderpos = slider.getBoundingClientRect(),
					parentpos = parent.getBoundingClientRect();
				this.underBreakpoint = this.breakpoint >= eltpos.width;
				this.slideTop = this.invert
					? `${eltpos.top - sliderpos.top}px;`
					: `${eltpos.bottom - sliderpos.bottom}px;`;
				this.slideLeft = `${eltpos.left - parentpos.left}px;`;
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
				self.$emit('mounted');
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

.tabs-wrapper.disabled {
	pointer-events: none;
	opacity: 1; 
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
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: .2ch;
	transition: all 200ms var(--quad) 20ms;
}

.tabs-wrapper.disabled .tab-active, .tabs-wrapper.disabled .tab-idle {
	color: var(--tabs-idle);
}

.tab-active:not(.filled) {
	color: var(--color-selection);
}

.tab-idle {
	color: var(--tabs-idle);
}

.tab-idle.filled:not(.isGradient) {
	background-color: var(--color-header);
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

.tab-line.disabled {
	opacity: 1;
}

.disabled > .tab-wrapper.active > .tab-line:not(.filled) {
	background: var(--tabs-idle);
}

.tab-wrapper.active > .tab-line:not(.filled) {
	background: var(--color-selection);
}
.tab-wrapper.active.isGradient > .tab-line {
	background: var(--color-default);
}


.tab-wrapper.idle > .tab-line {
	background: transparent;
}

.tab-wrapper.idle:hover > .tab-line:not(.filled) {
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
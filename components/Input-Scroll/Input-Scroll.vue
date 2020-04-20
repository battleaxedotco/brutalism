<template>
	<div
		:class="[{ disabled }, 'input-scroll-container']"
		:style="{ 'margin-top': marginTop, margin: margin, padding: padding }"
	>
		<div v-if="!thin" class="input-scroll-label">{{ label }}</div>
		<div
			class="input-scroll-wrapper"
			@mouseenter="hover = true"
			@mouseleave="hover = false"
			:style="[
				{
					'justify-content': alignPos
				}
			]"
		>
			<div class="input-scroll-field" v-pan.prevent.mouse="panHandle">
				<span v-if="prefix && prefix.length">{{ prefix }}</span>
				<div @mouseup.prevent="focus($event)">
					<input
						ref="input"
						type="number"
						:class="[
							{ flat, filled },
							'input-scroll-value',
							inputting ? 'active' : 'idle'
						]"
						title
						:style="[
							{
								color:
									hasFocus && !filled && !isPanning
										? 'var(--color-input-focus-text)'
										: isPanning && filled
										? 'var(--default-color) !important'
										: isPanning || (flat && hasFocus)
										? realColor
										: ''
							}
						]"
						:tabindex="disabled ? '-1' : ''"
						:min="min"
						:max="max"
						v-model="val"
						:step="realStep"
						@input="inputEvt"
						@blur="blur"
						@focus="focus"
					/>
				</div>
				<span v-if="suffix && suffix.length">{{ suffix }}</span>
			</div>

			<div
				v-if="!filled"
				:class="[
					hasFocus || hover ? 'active' : 'idle',
					'input-scroll-indicator'
				]"
				:style="[
					{
						background: hasFocus
							? realColor
							: 'var(--color-default)',
						height: underlineSize
					}
				]"
			></div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		label: {
			type: String,
			default: "Label"
		},
		min: {
			type: Number,
			default: null
		},
		max: {
			type: Number,
			default: null
		},
		modifier: {
			type: Number,
			default: 1
		},
		value: {
			type: Number,
			default: 0
		},
		prefix: {
			type: String,
			default: ""
		},
		suffix: {
			type: String,
			default: ""
		},
		toFixed: {
			type: Number,
			default: 0
		},
		color: {
			type: String,
			default: "var(--color-selection)"
		},
		debug: {
			type: Boolean,
			default: false
		},
		resetValue: {
			type: Number,
			default: 0
		},
		disabled: {
			type: Boolean,
			default: false
		},
		step: {
			type: Number,
			default: null
		},
		thin: {
			type: Boolean,
			default: false
		},
		steps: {
			type: Array,
			default: function() {
				return [0.1, 1, 10];
			}
		},
		flat: {
			type: Boolean,
			default: false
		},
		filled: {
			type: Boolean,
			default: false
		},
		underlineSize: {
			type: String,
			default: "1px"
		},
		left: {
			type: Boolean,
			default: false
		},
		right: {
			type: Boolean,
			default: false
		},
		lazy: {
			type: Boolean,
			default: false
		}
	},
	data: () => ({
		val: 0,
		lastDelta: 0,
		hasFocus: false,
		hasInputFocus: false,
		shift: false,
		alt: false,
		control: false,
		realStep: 1,
		lastVal: null,
		lastChange: null,
		hasReportedPan: false,
		isPanning: false,
		mouseDown: false,
		inputting: false,
		hover: false
	}),
	mixins: [require("../mixinStyleProps").default],
	directives: {
		"pan": require('vue-pan').default
	},
	watch: {
		value(val) {
			this.val = val;
		},
		val(value) {
			if (("" + value).length < 1) value = this.resetValue;
			if (this.inputting) return null;
			this.val = this.validate(value);
		},
		hasFocus(val) {
			if (!val) {
				this.reset();
				if (this.validate(this.val) !== this.lastVal) {
					this.$emit("update", this.validate(this.val));
					this.lastVal = this.validate(this.val);
				}
				window.removeEventListener("keydown", evt => {
					this.parseModifiers(evt, true, false);
				});
				window.removeEventListener("keyup", evt => {
					this.parseModifiers(evt, false, true);
				});
			} else {
				window.addEventListener("keydown", evt => {
					this.parseModifiers(evt, true, false);
				});
				window.addEventListener("keyup", evt => {
					this.parseModifiers(evt, false, true);
				});
			}
			this.val = this.validate(this.val);
			// if (!val && !this.isPanning) this.$emit(val ? "focus" : "blur");
			if (this.isPanning && !this.hasReportedPan) {
				this.hasReportedPan = true;
				this.$emit("focus");
			} else if (val && !this.isPanning) this.$emit("focus");
			else if (!val) this.$emit("blur");
		},
		modifierKeys(value) {
			if (!this.shift && !this.control && !this.alt)
				this.realStep = (this.step || this.steps[1]) * this.modifier;
			else if (this.shift) this.realStep = this.steps[2];
			else if (this.control) this.realStep = this.steps[0];
			if (this.debug) console.log(value);
		},
		realStep(value) {
			if (this.debug) console.log(`Current step: ${value}`);
		}
	},
	computed: {
		alignPos() {
			return this.left
				? "flex-start"
				: this.right
				? "flex-end"
				: "center";
		},
		displayVal() {
			return this.toFixed > 0 ? this.val.toFixed(this.toFixed) : this.val;
		},
		realColor() {
			if (!this.color.length) return `var(--color-selection);`;
			else {
				if (!/-/.test(this.color)) return this.color;
				return `var(--color-${this.color
					.replace(/var\(/, "")
					.replace(/(--color-|color-)/, "")
					.replace(/\)$/, "")})`;
			}
		},
		modifierKeys() {
			return `control: ${this.control}, shift: ${this.shift}, alt: ${this.alt}`;
		}
	},
	mounted() {
		this.realStep = (this.step || this.steps[1]) * this.modifier;
		this.val = this.value;
		this.$nextTick(() => {
			this.resize();
		});
		// this.$refs.input.addEventListener("mouseup", () => {
		// 	this.mouseDown = false;
		// 	this.focus();
		// });
		this.$refs.input.addEventListener("keydown", evt => {
			this.parseModifiers(evt, true, false);
			if (evt.key == "." || evt.code == "Period") {
				if (/\./.test(this.val) && !this.lazy) {
					evt.preventDefault();
					return null;
				}
				if (!this.lazy)
					this.toFixed > 0 ? this.resize(5) : evt.preventDefault();
			}
			if (evt.key == "Enter") {
				this.blur();
			}
		});
		this.$refs.input.addEventListener("keyup", evt => {
			this.parseModifiers(evt, false, true);
		});
	},
	methods: {
		ignoreClick(evt) {
			console.log("Click");
		},
		panHandle(evt) {
			if (evt.isFirst) this.hasReportedPan = false;
			this.hasFocus = this.isPanning = !evt.isFinal;
			this.inputting = false;
			this.$refs.input.blur();
			if (!this.hasFocus) {
				this.blur();
				this.lastDelta = evt.offset.x / 2;
				return null;
			}
			let offsetx = evt.offset.x / 2;
			if (this.lastDelta == offsetx) return null;

			let delta = offsetx > this.lastDelta ? 1 : -1;
			let direction = delta > 0 ? "right" : "left";
			if (this.debug)
				console.log(
					`amount: ${offsetx} !== ${this.lastDelta}`,
					`val: ${delta} ==> ${direction}`
				);
			this.increment(delta);
			this.lastDelta = offsetx;
		},
		increment(delta) {
			let amount = delta * this.realStep;
			let result;
			result = !this.lazy
				? +(+this.val + amount).toFixed(this.toFixed)
				: +this.val + amount;
			result = this.clamp(result);
			this.val = result;
		},
		addZeroes(num) {
			var value = Number(num);
			var res = ("" + num).split(".");
			value = value.toFixed(this.toFixed);
			return value;
		},
		validate(value) {
			if (
				("" + value).length < 1 &&
				(this.resetValue || this.resetValue == 0)
			)
				value = this.resetValue;
			if (this.min || this.max) value = this.clamp(+value);
			let result;

			if (this.toFixed > 0 && !this.lazy) {
				result = this.addZeroes(value);
			} else {
				result =
					this.min || this.max
						? this.clamp(!this.lazy ? Math.round(value) : value)
						: !this.lazy
						? Math.round(value)
						: value;
			}

			this.$nextTick(() => {
				this.resize();
			});
			if (result !== this.lastChange) this.$emit("change", result);
			this.lastChange = result;
			return result;
		},
		inputEvt(evt) {
			if (evt.inputType) this.inputting = true;
			this.resize(evt);
		},
		clamp(result) {
			result =
				(this.min || this.min == 0) && +result < this.min
					? this.min
					: result;
			result =
				(this.max || this.max == 0) && result > this.max
					? this.max
					: result;
			return result;
		},
		focus(evt = null) {
			this.hasFocus = this.hasInputFocus = this.inputting = true;
			if (this.mouseDown || this.isPanning) return null;
			this.$nextTick(() => {
				this.$refs.input.focus();
				if (evt.target.select) evt.target.select();
			});
		},
		blur() {
			this.hasFocus = this.inputting = false;
			this.$nextTick(() => {
				this.$refs.input.blur();
			});
		},
		reset() {
			this.shift = this.control = this.alt = this.inputting = this.hasReportedPan = false;
			this.lastDelta = 0;
		},
		// record any modifier keys
		parseModifiers(evt, keydown = false, keyup = false) {
			if (!this.hasFocus) return null;
			let keys = [
				{
					targs: ["ctrl", "meta"],
					keynames: ["Control", "Meta"],
					value: "control"
				},
				{
					targs: ["shift"],
					keynames: ["Shift"],
					value: "shift"
				},
				{
					targs: ["alt"],
					keynames: ["Alt"],
					value: "alt"
				}
			];
			let modifierkey = keys.find(key => {
				let found = keydown
					? key.targs.filter(item => {
							return evt[`${item}Key`];
					  }).length > 0
					: key.keynames.filter(item => {
							return evt.key == item;
					  }).length > 0;
				return found;
			});
			if (keydown && modifierkey && !this[modifierkey.value])
				this[modifierkey.value] = true;
			else if (keyup && modifierkey && this[modifierkey.value])
				this[modifierkey.value] = false;
		},
		// Resize the input whenever digits expand
		resize(padding = 5) {
			if (
				padding.data &&
				(padding.data == "." || padding.key == "Period")
			)
				padding = 5;
			else if (padding.data) padding = 5;
			if (arguments.length < 1 || typeof padding !== "number")
				padding = 5;
			this.$nextTick(() => {
				const inputElement = this.$refs.input;
				const style = window.getComputedStyle(inputElement, null);
				const text = inputElement.value ? inputElement.value : "0";
				const width = measureTextWidth(text, style.font);
				inputElement.style.width = `${width + padding}px`;
			});
			function measureTextWidth(txt, font) {
				const element = document.createElement("canvas");
				const context = element.getContext("2d");
				context.font = font;
				// return context.measureText(txt).width;
				return context.measureText(txt.replace(/\d/g, "8")).width;
			}
		}
	}
};
</script>

<style>
:root {
	--animation-timing: 200ms var(--quad) 20ms;
}

.input-scroll-container {
	/* border: 2px solid red; */
	display: flex;
	flex-wrap: nowrap;
	justify-content: flex-start;
	position: relative;
	/* padding: 0px 4px; */
	margin: 2px 0px;
	width: fit-content;
	/* height: 25px; */
	align-items: baseline;
	font-size: 11px;
	font-family: "Open Sans", sans-serif;
	color: var(--color-icon);
}

.input-scroll-wrapper {
	cursor: ew-resize;
	width: 100%;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
}

.input-scroll-field {
	width: 100%;
	display: flex;
	flex-wrap: nowrap;
	align-items: baseline;
}

.input-scroll-label {
	display: flex;
	white-space: pre;
	width: fit-content;
	flex-wrap: nowrap;
	margin-right: 3px;
}

.input-scroll-indicator {
	background: var(--color-selection);
	transition: all var(--animation-timing);
}

.input-scroll-indicator.active {
	width: 100%;
}
.input-scroll-indicator.idle {
	width: 1%;
	opacity: 0;
}

.input-scroll-value::selection {
    background-color: var(--highlight-bg);
    color: var(--highlight-text);
}

.input-scroll-value {
	/* height: 16px; */
	pointer-events: none;
	margin: 0;
	padding: 2px 0 2px 3px;
	cursor: ew-resize;
	overflow: visible;
	background: transparent;
	outline: none;
	border: none !important;
	border-style: solid;
	min-width: 0px;
	max-width: 50px;
	color: var(--default-color);
	border-radius: 2px 2px 0px 0px;
	/* transition: color var(--animation-timing),
		background var(--animation-timing); */
}

.input-scroll-value.filled {
	border-radius: 3px;
	padding: 1px 0 3px 6px;
	margin: 1px 4px 0 -2px;
}

.input-scroll-field:hover > div > .filled {
	/* color: var(--default-color) !important; */
}

.input-scroll-value.filled.idle {
	background: var(--color-input);
	border: 1.5px solid var(--color-input-border) !important;
	color: var(--color-input-text) !important;
}

.input-scroll-value.filled.active {
	background: var(--color-input-focus);
	border: 1.5px solid var(--color-input-focus-border) !important;
	color: var(--color-input-focus-text);
}

.input-scroll-value.active:not(.flat):not(.filled) {
	background: var(--color-input-focus);
	color: var(--color-input);
}

.input-scroll-value.flat {
	border: none;
}

.input-scroll-value::-webkit-outer-spin-button,
.input-scroll-value::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.disabled {
	opacity: 0.4;
	pointer-events: none;
}
</style>

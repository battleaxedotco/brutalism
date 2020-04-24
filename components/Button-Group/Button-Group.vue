<template>
	<div class="button-group-container" :style="[{ 'margin': margin, 'width': width }]">
		<span class="button-group-label" :style="[{ 'margin': computedMargin, 'order': right ? 1 : 0 }]" v-if="label.length">{{label}}</span>
		<div :class="['button-group', direction, !grid ? right ? 'right' : center ? 'center' : 'left' : '']" :style="getStyle()">
			<slot />
		</div>
	</div>
</template>

<script>
import stylePropMixin from "../mixinStyleProps";

export default {
	props: {
		width: {
			type: String,
			default: '100%;'
		},
		margin: {
			type: String,
			default: '0px'
		},
		labelMargin: {
			type: String,
			default: '12px'
		},
		label: {
			type: String,
			default: ''
		},
		grid: {
			type: Boolean,
			default: false
		},
		gap: {
			type: String,
			default: "4px"
		},
		row: {
			type: Boolean,
			default: false
		},
		column: {
			type: Boolean,
			default: false
		},
		fillArea: {
			type: Boolean,
			default: true
		},
		template: {
			type: String,
			default: ""
		},
		exclusive: {
			type: Boolean,
			default: false
		},
		multiselect: {
			type: Boolean,
			default: false
		},
		left: {
			type: Boolean,
			default: false
		},
		right: {
			type: Boolean,
			default: false
		},
		center: {
			type: Boolean,
			default: false,
		},
		active: [Number, Array]
	},
	mixins: [stylePropMixin],
	data: function() {
		return {
			activeIndex: !this.multiSelect
				? this.active || 0
				: this.active.length
				? this.active
				: [0],
			flex: this.grid
		};
	},
	mounted() {
		// console.log(this);
		if (typeof this.active === "number" || this.active == 0)
			this.setActiveByIndex(this.active);
		else if (this.active)
			this.active.forEach(index => {
				this.setActiveByIndex(index);
			});
	},
	computed: {
		direction() {
			return this.row ? "row" : this.column ? "column" : "row";
		},
		templateString() {
			if (this.template.length) return this.template;
			return this.fillArea
				? `repeat(${this.$slots.default.length}, 1fr);`
				: "1fr;";
		},
		styleType() {
			return this.grid ? "grid" : "flex";
		},
		computedMargin() {
			return this.right ? `0px 0px 0px ${this.labelMargin}` : `0px ${this.labelMargin} 0px 0px`
		}
	},
	methods: {
		setActiveByUID(uid) {
			if (this.exclusive) this.resetChildren(uid);
			else if (this.multiselect) {
				let index = 0;
				this.$children.forEach((child, i) => {
					if (child.uuid == uid) index = i;
				});
				this.setActiveByIndex(index);
			}
		},
		getStyle() {
			let style = `display: ${this.styleType};`;
			style += this.grid ? this.getGridStyle() : this.getFlexStyle();
			return style;
		},
		getFlexStyle() {},
		getGridStyle() {
			let style = `grid-gap: ${this.gap};`;
			style += `${
				this.direction == "row"
					? "grid-template-columns"
					: "grid-template-rows"
			}: ${this.templateString}`;
			return style;
		},
		resetChildren(uid) {
			this.$children.forEach((child, index) => {
				if (child.to.length) {
					// Ignore router buttons
				} else if (child.uuid !== uid && !this.multiSelect)
					child.$el.classList.remove("active");
				else if (child.uuid !== uid && this.multiSelect)
					child.$el.classList.toggle("active");
				else {
					this.activeIndex = index;
					child.$el.classList.add("active");
				}
			});
			this.update();
		},
		setActiveByIndex(index) {
			let child = this.$children[index];
			if (child.to.length) {
				// Ignore router buttons
			} else if (!this.multiselect) {
				this.activeIndex = index;
				child.$el.classList.add("active");
			} else {
				let isActive = !/active/.test(child.$el.classList.value);
				this.activeIndex = this.activeIndex.filter(ind => {
					return ind !== index;
				});
				if (isActive) {
					this.activeIndex.push(index);
					child.$el.classList.toggle("active");
				} else child.$el.classList.remove("active");
			}
			this.update();
		},
		update() {
			this.$emit("update", this.activeIndex);
		}
	}
};
</script>

<style scoped>
.button-group {
	width: 100%;
	margin-right: 0px;
}

.button-group-container {
	display: flex;
	width: 100%;
}

.button-group-label {
	display: flex;
	flex-direction: column;
	justify-content: center;
	word-wrap: none;
	white-space: nowrap;
}

.column {
	grid-template-columns: 1fr;
	flex-direction: column;
}

.row {
	grid-template-rows: 1fr;
	flex-direction: row;
	margin-bottom: 0px !important;
}

.right {
	justify-content: flex-end !important;
}
.left {
	justify-content: flex-start !important;
}
.center {
	justify-content: center !important;
}
</style>

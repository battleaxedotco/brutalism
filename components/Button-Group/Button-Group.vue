<template>
	<div :class="['button-group', direction, flex ? left || right : 'left']" :style="getStyle()">
		<span class="button-group-label" :style="[{ 'margin': labelMargin }]" v-if="label.length">{{label}}</span>
		<slot />
	</div>
</template>

<script>
import stylePropMixin from "../mixinStyleProps";

export default {
	props: {
		labelMargin: {
			type: String,
			default: '0px 12px 0px 0px'
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

.button-group-label {
	display: flex;
	flex-direction: column;
	justify-content: center;
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
</style>

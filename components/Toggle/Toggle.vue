<template>
	<div
		@click="updateState"
		@mouseenter="$emit('mouseenter')"
		@mouseleave="$emit('mouseleave')"
		:class="['toggle-item', { disabled, centered }]"
		:style="{ color: color }"
	>
		<slot v-if="hasSlotContent" />
		<Icon v-if="!hasSlotContent" :name="activeIcon" :size="size" />
		<span v-if="!hasSlotContent && label.length" class="label">{{ label }}</span>
	</div>
</template>

<script>
export default {
	props: [ 'value', 
		{
			state: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				default: ""
			},
			disabled: {
				type: Boolean,
				default: false
			},
			onIcon: {
				type: String,
				default: "checkbox-intermediate"
			},
			offIcon: {
				type: String,
				default: "checkbox-blank-outline"
			},
			size: {
				type: String,
				default: "18px"
			},
			color: {
				type: String,
				default: ""
			},
			centered: {
				type: Boolean,
				default: false
			},
			checkbox: {
				type: Boolean,
				default: false
			},
			radio: {
				type: Boolean,
				default: false
			},
			switch: {
				type: Boolean,
				default: false
			}
		]
	},
	data: function() {
		return {
			realState: this.state,
			sets: [
				{
					name: "radio",
					onIcon: "radiobox-marked",
					offIcon: "radiobox-blank"
				},
				{
					name: "checkbox",
					onIcon: "checkbox-intermediate",
					offIcon: "checkbox-blank-outline"
				},
				{
					name: "switch",
					onIcon: "toggle-switch",
					offIcon: "toggle-switch-off"
				}
			]
		};
	},
	computed: {
		hasSlotContent() {
			return this.$slots.default;
		},
		activeIcon() {
			let activeSet = this.sets.find(item => {
				return this[item.name];
			});
			return !activeSet
				? this.realState
					? this.onIcon
					: this.offIcon
				: this.realState
				? activeSet.onIcon
				: activeSet.offIcon;
		}
	},
	watch: {
		state(val) {
			this.realState = val
		}
	},
	methods: {
		updateState() {
			if (this.disabled) return null;
			this.$emit('click');
			this.realState = !this.realState;
			this.$emit("update", this.realState);
			this.$emit('input', this.realState);
		}
	},
	watch: {
		state(val) {
			this.realState = val;
		}
	}
};
</script>

<style scoped>
.toggle-item {
	box-sizing: border-box;
	width: fit-content;
	display: flex;
	justify-content: flex-start;
	flex-direction: row;
	align-items: center;
	overflow: hidden;
	color: var(--color-icon);
	margin-top: -2px;
	margin-bottom: -2px;
}

.disabled {
	opacity: 0.4;
	pointer-events: none;
}

.label {
	padding-left: 6px;
}
</style>

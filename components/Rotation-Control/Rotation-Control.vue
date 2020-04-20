<template>
	<div class="rotation-control-wrapper">
		<Input-Scroll thin :value="rotations" margin="0px" padding="0px" />
		<span style="color: var(--color-default);">x</span>
		<Input-Scroll
			thin
			:value="radians"
			:min="-360"
			:max="360"
			abs
			margin="0px"
			padding="0px"
			@change="updateRadians"
		/>
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: Number,
			default: 0
		}
	},
	data: () => ({
		radians: 0,
		rotations: 0,
		realRadians: 0,
		realRotations: 0,
		lastRadians: 0,
		lastRotations: 0
	}),
	methods: {
		updateRadians(value) {
			if (this.lastRadians < 0 && value >= 0 && this.rotations !== 0)
				this.rotations = this.rotations + 1;
			else if (this.lastRadians >= 0 && value < 0 && this.rotations !== 0)
				this.rotations = this.rotations - 1;

			if (this.rotations > 0 && value < 0) value = value * -1;
			else if (this.rotations < 0 && value >= 0) value = value * -1;

			if (value == -360) {
				value = 0;
				this.rotations == this.rotations - 1;
			} else if (value == 360) {
				this.rotations = this.rotations + 1;
				value = 0;
			} else {
				console.log(`Value is ${value}`);
			}

			// this.radians = value % 360;
			this.radians = value;
			this.lastRadians = value;

			// if (value >= 360) this.rotations = this.rotations + 1;
			// else if (value == 0 && this.lastRadians < value) {
			// 	this.rotations = this.rotations + 1;
			// } else if (value <= -360) {
			// 	value = 0;
			// 	this.rotations = this.rotations - 1;
			// } else if (value == -1 && this.lastRadians > value) {
			// 	this.rotations = this.rotations - 1;
			// }

			// // else if (value < 0) this.rotations = this.rotations - 1;

			// this.radians = value % 360;
			// this.lastRadians = value;
		}
	}
};
</script>

<style>
.rotation-control-wrapper {
	display: flex;
	justify-content: flex-start;
	align-items: baseline;
	font-size: 12px;
}
</style>

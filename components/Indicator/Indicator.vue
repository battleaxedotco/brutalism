<template>
	<div class="indicator-wrapper">
		<div
			v-for="(item, i) in instances"
			class="indicator-highlight"
			:key="i"
			id="indicator"
			:style="[
				{
					top: `${item.top}px`,
					left: `${item.left}px`,
					width: `${item.width}px`,
					height: `${item.height}px`
				}
			]"
		></div>
	</div>
</template>

<script>
export default {
	props: {
		target: {
			type: String,
			default: ""
		}
	},
	data: () => ({
		instances: [],
		isMounted: false
	}),
	mounted() {
		if (this.target.length) {
			this.mapTarget();
			this.cloneTarget();
		}
	},
	methods: {
		mapTarget() {
			let temp = [].slice.call(document.querySelectorAll(this.target));

			temp = temp.map((item, i) => {
				return {
					index: i,
					height: item.offsetHeight,
					width: item.offsetWidth,
					top: item.offsetTop,
					left: item.offsetLeft
				};
			});
			console.log(temp[0]);
			// this.instances = temp;
		},
		cloneTarget() {
			let temp = document.querySelector(this.target);
			if (!temp) return null;
			temp = temp.getBoundingClientRect();
			this.instances = [];
			this.instances.push({
				index: 0,
				height: temp.height + 4,
				width: temp.width + 4,
				left: temp.left - 2,
				top: temp.top - 2
			});
			console.log(this.instances[0]);
		}
	}
};
</script>

<style>
.indicator-wrapper {
	pointer-events: none;
}

.indicator-highlight {
	position: absolute;
	border: 2px solid var(--color-selection);
	box-sizing: border-box;
}
</style>

<template>
	<div 
		:class="['divider-line', {
			vertical,
			alt
		}]" 
		:style="getStyle()" 
	/>
</template>

<script>
export default {
	props: {
		vertical: {
			type: Boolean,
			default: false
		},
		debug: {
			type: Boolean,
			default: false
		},
		alt: {
			type: Boolean,
			default: false
		},
		color: {
			type: String,
			default: ''
		},
		thickness: {
			type: String,
			default: '2px'
		},
		margin: {
			type: String,
			default: ''
		},
		padding: {
			type: String,
			default: '0px 3px'
		}
	},
	methods: {
		getStyle() {
			let style = '';

			if (this.vertical) {
				style = `
					width: ${this.thickness};
					height: auto;
				`
				if (this.margin.length) style += `margin: ${margin};`
			} else {
				style = `
					width: ${this.vertical ? this.thickness : '100%'};
					height: ${this.vertical ? '100%' : this.thickness};
					padding: ${this.padding};
				`
				if (this.margin.length) style += `margin: ${margin};`
			}
			if (this.color.length) style += `background-color: ${this.color};`
			
			return style
		}
	},
	mounted() {
		if (this.debug)
			console.log('Hello')
	}
};
</script>

<style>

.divider-line {
	box-sizing: border-box;
	max-width: 100%;
}

.divider-line:not(.vertical) {
	margin: 6px 0px;
}

.divider-line.vertical {
	box-sizing: border-box;
	height: 100%;
	margin-left: 2px;
	margin-right: 6px;
}

.wrapper > .divider-line {
	margin-bottom: 14px;
}

.divider-line:not(.alt) {
	background-color: var(--divider-light);
}
.divider-line.alt {
	background-color: var(--divider-dark);
}
</style>

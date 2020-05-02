<template>
	<div 
		class="row" 
		:style="{ 
			margin: margin, 
			padding: padding,
			justifyContent: justify,
			alignItems: align
		}"
	>
		<slot />
	</div>
</template>

<script>
export default {
	mixins: [require("../mixinStyleProps").default],
	props: {
		justify: {
			type: String,
			default: 'flex-start',
		},
		align: {
			type: String,
			default: 'space-around'
		},
		wrap: {
			type: String,
			default: 'wrap'
		}
	}
};
</script>

<style>
.row {
	display: flex;
	flex-direction: row;
	justify-content: start;
	flex-wrap: wrap;
	margin-bottom: 4px;
}
.row > * {
	margin-right: 4px;
	margin-bottom: 4px;
	align-content: space-around;
}
.row > :last-child {
	margin-right: 0;
}
</style>

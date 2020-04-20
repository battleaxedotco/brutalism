<template>
	<div
		class="wrapper"
		:style="{
			width: width,
			height: height,
			margin: margin,
			padding: padding
		}"
	>
		<slot></slot>
	</div>
</template>

<script>
export default {
	mixins: [require("../mixinStyleProps").default]
};
</script>

<style>
.wrapper {
	/* background: rgba(230, 157, 90, 0.3); */
	display: flex;
	box-sizing: border-box;
	flex-direction: column;
	justify-content: center;
	/* padding: 4px; */
	width: -webkit-fill-available;
}
.wrapper > * {
	margin-bottom: 8px;
}
.wrapper > :last-child {
	margin-bottom: 0;
}
</style>

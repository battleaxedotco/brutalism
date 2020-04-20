<template>
	<div class="row" :style="{ margin: margin, padding: padding }">
		<slot></slot>
	</div>
</template>

<script>
export default {
	mixins: [require("../mixinStyleProps").default]
};
</script>

<style>
.row {
	/* background: rgba(90, 186, 230, 0.3); */
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

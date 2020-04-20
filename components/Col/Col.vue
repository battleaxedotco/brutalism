<template>
	<div class="col">
		<slot class="item" />
	</div>
</template>

<script>
export default {};
</script>

<style scoped>
.col {
	/* background: rgba(230, 90, 183, 0.3); */
	display: flex;
	flex-direction: column;
	justify-content: start;
	flex-wrap: wrap;
	margin-bottom: 4px;
}
.col > * {
	/* margin-right: 4px; */
	margin-bottom: 4px;
	align-content: space-around;
}
.col > :last-child {
	margin-bottom: 0;
}
</style>

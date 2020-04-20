<template>
	<Wrapper>
		<Button-Group :active="0" exclusive @update="val => (isNewComp = !val)">
			<Button prefix-icon="plus" label="New Comp" tall margin="0px" />
			<Button
				prefix-icon="arrow-down"
				label="Current"
				tall
				margin="0px"
			/>
		</Button-Group>
		<Dropdown
			v-if="isNewComp"
			:items="['1x', '2x', '3x']"
			active="3x"
			label="Comp size multiplier"
			label-to-right
			@update="val => (compSizeMultiplier = val)"
		/>
		<Fold
			label="Options"
			:open="true"
			:margin-top="!isNewComp ? '6px' : ''"
		>
			<Toggle
				label="Detect parametric shapes"
				:state="true"
				@update="val => (detectParametricShapes = val)"
			/>
			<Toggle
				label="Precomp groups"
				:state="false"
				@update="val => (precompGroups = val)"
			/>
		</Fold>
		<Fold label="Groups" :open="true">
			<Button-Group grid column>
				<Button
					left
					tall
					icon-size="20px"
					prefix-icon="image-filter-center-focus-weak"
					label="Precomp"
				/>
				<Button
					left
					tall
					icon-size="20px"
					prefix-icon="arrow-expand-all"
					label="Un-Precomp"
				/>
				<Button
					left
					tall
					icon-size="20px"
					prefix-icon="eye-off"
					label="Toggle guide layer visibility"
				/>
				<Button
					left
					tall
					icon-size="20px"
					prefix-icon="delete"
					label="Delete group layers"
				/>
			</Button-Group>
		</Fold>
		<Fold label="System" :open="true">
			<Button block goto="https://www.battleaxe.co/">Learn stuff</Button>
			<Panel-Info route uppercase version>
				<i>Brought to you by your friends at Google motion design</i>
			</Panel-Info>
		</Fold>
	</Wrapper>
</template>

<script>
export default {
	data: () => ({
		// Since 0 and 1 are truthy values, using !0 becomes true and !1 becomes false
		isNewComp: true,
		compSizeMultiplier: "3x",
		precompGroups: false,
		detectParametricShapes: false,
		homepage: "https://battleaxe.co",
		google: "https://google.com"
	}),
};
</script>

<style></style>

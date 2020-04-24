<template>
	<!-- This could be done much better, just a simple proof of concept for now -->
	<div
		class="dropdown-wrapper"
		:style="getWrapperStyle()"
		@click="open = !open"
		@mouseenter="inside = true"
		@mouseleave="inside = false"
	>
		<!-- Using a hidden input to capture user focus and block arrow keys from going to AE -->
		<input
			ref="input"
			type="text"
			style="position: absolute; opacity: 0; width: 1px; height: 1px; cursor: default"
		/>

		<div class="dropdown-label" :style="getLabelStyle()">{{ label }}</div>
		<div class="dropdown-container" :style="getContainerStyle()">
			<div class="dropdown-active">{{ activeLabel || activeValue }}</div>

			<svg width="18" height="18" viewBox="0 0 24 24">
				<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
			</svg>

			<ul v-if="open" class="dropdown-menu" :style="getMenuStyle()">
				<li
					v-for="(item, i) in menu"
					:key="i"
					:ref="i"
					@click="makeActive(item)"
					@mouseenter="mouseOver(item)"
					@mouseleave="item.hover = false"
					class="dropdown-menu-item"
					:style="getMenuItemStyle(item)"
				>
					<span class="dropdown-menu-item-label">{{
						item.label || item.value
					}}</span>
					<span
						class="dropdown-menu-item-indicator"
						v-show="item.active"
					/>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		// The text above the dropdown
		label: {
			type: String,
			default: "Label"
		},
		labelToLeft: {
			type: Boolean,
			default: false
		},
		labelToRight: {
			type: Boolean,
			default: false
		},
		// The item to set as active on mount
		active: [String, Number],
		// The Array of items (as strings) to appear in menu
		items: Array,
		// A total CSS width override for parent
		width: String,

		// Additional space in pixels to subtract from menu height,
		// preventing panel scrolling when menu open
		padding: {
			type: Number,
			default: 16
		}
	},
	components: {
		// Feel free to replace this with your own
		// icon: require("./Icon.vue").default
	},
	data: () => ({
		open: false, // whether the menu is displaying
		menu: [], // real data of menu, generated on mounted()
		inside: false, // used to determine if user clicked outside this element,
		//
		// These are related to a bug where the cursor can interrupt key navigation:
		debounce: 500, // time in ms to lock cursor after each relevant keypress
		cursorLocked: false, // determine if cursor can fire mouseovers and whether to reset debouncer
		debouncer: null // a local setTimeout() object to refresh after each relevant keypress
	}),
	watch: {
		// Always emit event to parent when selection is changed
		activeValue(val) {
			if (val) this.$emit("update", val);
		},
		// Regenerate menu if items are changed
		items(val) {
			if (val && val.length) this.generateMenu();
		},
		// Send user focus to input to allow key navigation through dropdown
		open(val) {
			// If menu is open, force user focus into hidden input to capture keys
			if (val) {
				this.focus();
				// We should also pass focus/blur events to parent, in case any dev would need them
				this.$emit("focus");
			} else {
				// Otherwise remove document focus from hidden input element and allow keys to pass normally
				this.blur();
				this.$emit("blur");
			}
		}
	},
	mounted() {
		// Generate array at launch
		this.generateMenu();

		// If an active prop String is passed from parent,
		// assign it just after mounting and menu generation
		if (isNaN(this.active)) {
			let found = this.menu.find(item => {
				return (
					item.value == this.active + "" ||
					item.label == this.active + ""
				);
			});
			if (found) found.active = true;
			else
				console.error(
					`${this.active} does not exist in items!`,
					this.items
				);
		} else if (!isNaN(this.active)) {
			let found = this.menu[this.active];
			if (found) found.active = true;
			else
				console.error(
					`${this.active} does not exist in items!`,
					this.items
				);
		}
		// Otherwise if no prop was passed, first entry is active
		else this.menu[0].active = true;

		// Start listening for key presses at launch, but only act on them if menu is currently open
		window.addEventListener("keyup", this.handleKeyNav);
		// Listen for any clicks which aren't in this element and close the menu
		window.addEventListener("click", this.handleOutsideClick);

		// Force the component to repaint itself if user resizes panel with dropdown menu open
		window.addEventListener("resize", () => {
			if (this.open) this.$forceUpdate();
		});
	},
	computed: {
		// Since only one object is active at any given time,
		// keep track of the object via ES6 Array.find()
		activeItem() {
			return this.menu.length
				? this.menu.find(item => {
						return item.active;
				  })
				: null;
		},
		activeValue() {
			return this.activeItem ? this.activeItem.value : null;
		},
		// If this.items contains objects of { key/label: String, value: String }
		// then display the key/label for the item instead of the value
		activeLabel() {
			return this.activeItem
				? this.activeItem.label
					? this.activeItem.label
					: null
				: null;
		},
		// Computed getter/setter can directly control the menu for key navigation:
		activeIndex: {
			// This is the value returned by 'this.activeIndex'
			get() {
				return this.activeItem.index || 0;
			},
			// But we can also directly assign 'this.activeIndex = 2'
			set(val) {
				if (val || val == 0) this.makeActive(this.menu[val]);
			}
		},
		hoverItem() {
			if (!this.menu.length) return null;
			let hovered = this.menu.find(item => {
				return item.hover;
			});
			if (hovered) return hovered;
			else
				return {
					index: -1
				};
		},
		hoverIndex: {
			get() {
				return this.hoverItem.index;
			},
			set(val) {
				this.makeHover(this.menu[val]);
			}
		}
	},
	methods: {
		getWrapperStyle() {
			let style = `${
				this.labelToLeft || this.labelToRight
					? "width: fit-content; margin: 6px 0px; flex-wrap: nowrap; align-items: center;"
					: `width: ${this.width || '100%'}; margin: 6px auto; flex-wrap: wrap;`
			}`;
			return style;
		},
		getLabelStyle() {
			let style = `${
				this.labelToLeft || this.labelToRight
					? `width: fit-content; margin-bottom: 0px; margin-top: 0px; order: ${
							this.labelToLeft ? "0" : "1"
					  }; padding-${!this.labelToLeft ? "left" : "right"}: 6px;`
					: `width: ${this.width || '100%'}`
			}`;
			return style;
		},
		getContainerStyle() {
			let style = this.width
				? `width: ${
						this.labelToLeft || this.labelToRight
							? "fit-content;"
							: this.width
				  }`
				: `width: ${
						this.labelToLeft || this.labelToRight
							? "fit-content;"
							: "100%;"
				  }`;
			return style;
		},
		// Build menu whenever item prop is changed or on mounted()
		generateMenu() {
			this.menu = [];
			let isString = typeof this.items[0] === "string";
			this.items.forEach((item, i) => {
				let newItem = {
					value: isString ? item : item.value,
					index: i,
					hover: false,
					active: false
				};
				if (!isString) newItem["label"] = item.key || item.label;
				this.menu.push(newItem);
			});
		},
		// Pass a dynamic string as inline style to the menu,
		// determining whether to appear above or below dropdown
		getMenuStyle() {
			let style = `
        max-height: ${this.determineMaxHeight()}px;
      `;
			// 16px is an offset from the center of the dropdown, since
			// parent has position: relative, but menu still obeys flexbox's align-items: center
			if (this.determineIfUpOrDown()) style += "top: 16px;";
			else style += "bottom: 16px;";
			return style;
		},
		getMenuItemStyle(item) {
			return `background-color: ${item.hover ? "#ccc" : "transparent"}`;
		},
		// Returns true if dropdown has more than 100 pixels between it's own and panel's bottom edge
		determineIfUpOrDown() {
			return (
				window.innerHeight - this.$el.getBoundingClientRect().bottom >
				100
			);
		},
		// Returns size in pixel offset from dropdown's current position and window height, with extra padding
		determineMaxHeight() {
			return this.determineIfUpOrDown()
				? window.innerHeight -
						this.$el.getBoundingClientRect().bottom -
						this.padding
				: this.$el.getBoundingClientRect().top -
						window.innerHeight +
						window.innerHeight;
		},
		// Clear all active menu items and set current to active
		makeActive(item) {
			this.clearActive();
			item.active = true;
		},
		// Clear all active menu items
		clearActive(active) {
			this.menu.forEach(item => {
				item.active = active && item.value !== active.value;
			});
		},
		// Clear all hovered menu items and set current to hovered
		makeHover(item) {
			this.clearHover();
			item.hover = true;
		},
		// Activate hover on mouseover only if debouncing period from last keystroke has ended or isn't in effect
		mouseOver(item) {
			if (this.cursorLocked) return null;
			this.makeHover(item);
		},
		// Clear all hovered menu items
		clearHover() {
			this.menu.forEach(item => {
				item.hover = false;
			});
		},
		// Captures Up/Down arrow keys and Enter whenever menu is open
		// Locks the cursor from firing hover events if applicable key is pressed
		handleKeyNav(evt) {
			if (this.open && /Arrow(Down|Up)/.test(evt.key)) {
				this.lockCursor();
				this.navigateMenu(/up/i.test(evt.key) ? -1 : 1, "hover");
			} else if (this.open && /enter/i.test(evt.key) && this.hoverItem) {
				this.activeIndex = this.hoverIndex;
				this.open = false;
			}
		},
		navigateMenu(num, str) {
			if (num > 0 && num + this[`${str}Index`] > this.menu.length - 1)
				this[`${str}Index`] = 0;
			else if (num < 0 && num + this[`${str}Index`] < 0)
				this[`${str}Index`] = this.menu.length - 1;
			else this[`${str}Index`] = num + this[`${str}Index`];
			let ref = this.$refs[this[`${str}Index`]][0];
			// This should organically scroll to top or bottom, but using scrollIntoView
			// causes strange whitespace at bottom of panel and seems to bubble up in doc
			// ref.scrollIntoView(num > 0)
			ref.scrollIntoView(false);
		},
		// Dismiss the menu if user has clicked outside the element
		handleOutsideClick() {
			if (!this.inside) this.open = false;
		},
		// Custom debounce function, which locks the cursor from producing hover triggers if user is navigating via key
		//
		// This solves an issue where the user may be navigating through the menu with cursor over an inactive item, and
		// the scrollIntoView() of the newest element causes the @mouseenter on unrelated item to fire
		lockCursor() {
			const self = this;
			// If this already had a timeout, clear it otherwise it won't stack
			if (self.cursorLocked) clearTimeout(self.debouncer);
			// Then lock the cursor and create a fresh timeout of the given debounce period
			self.cursorLocked = true;
			self.debouncer = setTimeout(() => {
				self.cursorLocked = false;
			}, self.debounce);
		},
		// Exposing means to open/close menu
		focus() {
			if (!this.open) this.open = true;
			this.$refs.input.focus();
		},
		blur() {
			if (this.open) this.open = false;
			this.$refs.input.blur();
		}
	}
};
</script>

<style scoped>
/* 
  The style doesn't need to be scoped!
  It makes it harder for a dev to manually change the style or classes,
  but does ensure that there aren't classname conflicts with their own HTML/CSS.
 */

.dropdown-wrapper {
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	flex-wrap: wrap;
	margin: 6px auto;
}
svg {
	fill: var(--color-icon);
}

.dropdown-label {
	/* width: 100%; */
	margin-bottom: 4px;
	cursor: default;
	user-select: none;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	/* font-size: 9px; */
	color: var(--color-icon);
}

.dropdown-active {
	user-select: none;
	cursor: default;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.dropdown-container {
	box-sizing: border-box;
	position: relative;
	/* width: 100%; */
	height: 24px;
	padding: 0px 2px 0 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: var(--dropdown-color);
	border: 1px solid var(--dropdown-border);
	background-color: var(--dropdown-bg);
}

.dropdown-menu {
	box-sizing: border-box;
	position: absolute;
	left: -1px;
	z-index: 1;
	width: calc(100% + 2px);
	user-select: none;
	overflow-y: auto;
	overflow-x: hidden;
	background-color: var(--dropdown-menu-bg);
	color: var(--dropdown-menu-color);
	font-weight: 550;
	margin: 6px auto;
	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
		0 4px 8px rgba(0, 0, 0, 0.12);
}

.dropdown-menu-item {
	padding: 2px 10px;
	cursor: default;
	list-style-type: none;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dropdown-menu-item:not(:last-child) {
	border-bottom: 1px solid var(--dropdown-menu-border);
}

.dropdown-menu-item-label {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.dropdown-active {
	padding: 0px 3px;
}

.dropdown-menu-item-indicator {
	float: right;
	padding: 4px;
	border-radius: 4px;
	margin-top: 3px;
	background-color: var(--color-selection);
}

ul {
	padding-left: 0px;
}

/*
  Scrollbar style
*/
.dropdown-menu::-webkit-scrollbar {
	background-color: var(--dropdown-scrollbar-bg);
	width: var(--width-scrollbar-track);
}
.dropdown-menu::-webkit-scrollbar-thumb {
	width: var(--width-scrollbar-track);
	background: var(--dropdown-scrollbar-thumb);
	border-radius: 0px;
}
.dropdown-menu::-webkit-scrollbar-thumb:hover {
	background: var(--dropdown-scrollbar-thumb-hover);
}
.dropdown-menu::-webkit-scrollbar-resizer {
	display: none;
	width: 0px;
	background-color: transparent;
}
.dropdown-menu::-webkit-scrollbar-button {
	height: 0px;
}
.dropdown-menu::-webkit-scrollbar-corner {
	display: none;
}
</style>

/**
 * Global mixin for Button Groups
 *
 * By adding
 *      mixins: [require('path-to-this-file')]
 * To any component, we can share/inherit any part of a Vue file
 *
 * This mixin creates global identifying numbers for each button
 * so that a Button Group can detect a unique ID number to trigger
 * exclusive/multiselect behavior and style
 *
 */

let uuid = 0;

export default {
	beforeCreate() {
		this.uuid = uuid.toString();
		uuid += 1;
	}
};

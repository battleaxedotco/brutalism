export default {
	inserted: function(el) {
		// must use settimeout for contenteditable elements to fire on nextTick
		setTimeout(() => {
			el.focus();
		}, 0);
	}
};

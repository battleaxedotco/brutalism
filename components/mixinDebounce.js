export default {
	methods: {
		debounce(func, delay) {
			let inDebounce;
			return function() {
				const context = this;
				const args = arguments;
				clearTimeout(inDebounce);
				inDebounce = setTimeout(() => func.apply(context, args), delay);
			};
		}
	}
};

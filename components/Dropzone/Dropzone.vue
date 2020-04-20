<template>
	<div id="dropzone">
		<input
			ref="input"
			style="position: absolute; opacity: 0; width: 1px; height: 1px; cursor: default"
			v-model="inputText"
		/>
		<slot v-if="isDragging && !overlay && $slots.default" />
		<div v-if="isDragging && overlay" class="overlay-test">
			<slot v-if="$slots.default" />
			<div v-else class="overlay-card">{{ anno }}</div>
		</div>
	</div>
</template>

<script>
const fs = require("fs");
const path = require("path");
const spy = window.__adobe_cep__
	? require("cep-spy").default
	: require("../../utils/fakeSpy").default;
const evalScript = window.__adobe_cep__
	? require("cluecumber").evalScript
	: null;

export default {
	props: {
		// Only accept a single file, if multiple are dropped only accept one
		single: {
			type: Boolean,
			default: false
		},
		// Return the value of a file instead of the path
		autoRead: {
			type: Boolean,
			default: false
		},
		// If true display a sample overlay while dragging
		overlay: {
			type: Boolean,
			default: false
		},
		// The default text appearing in the overlay
		anno: {
			type: String,
			default: "Drop files here"
		},
		// A regex string (e.g. "jpg|png") or Array like ['jpg', 'png']
		// Only files passing this validation will be sent by @drop/@read
		accepts: {
			type: [String, Array],
			default: ".*"
		},
		// Autoparse JSON files during @read
		autoParse: {
			type: Boolean,
			default: true
		},
		// If the user drops a folder, return it's children's paths instead of it's own path
		readFolders: {
			type: Boolean,
			default: false
		},
		// Return single-depth Array instead of Arrays within Arrays if dropping folders
		flatten: {
			type: Boolean,
			default: true
		},
		// If Illustrator and drag/dropping activeDoc selection
		pureSvg: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			msg: this.anno,
			leaveCount: 0,
			isDragging: false,
			csInterface: null,
			inputText: null
		};
	},
	computed: {
		acceptRX() {
			if (typeof this.accepts === "object")
				return new RegExp(`(${this.accepts.join("|")})$`);
			else return new RegExp(`${this.accepts.replace(/\$$/, "")}$`);
		}
	},
	mounted() {
		window.addEventListener("dragenter", () => {
			this.leaveCount = 0;
			if (!this.isDragging) this.enter();
		});
		window.addEventListener("dragleave", () => {
			// console.log("Leave");
			// This produced a loop of leave/enter events on Windows for me, where moving the cursor while dragging
			// over elements like buttons would cause the events to refire and the Dropzone to flash
			//
			this.leaveCount++;
			// But for some reason, dragexit doesn't work on window or this element.
			// dragleave is fired twice only when exiting the window on for me, we might be able to use that as a condition
			//
			// Otherwise this might be fired when hovering any element, similar to mouseover
			if (this.leaveCount == 2) this.exit();
		});
		if (spy.appName == "ILST")
			window.addEventListener("dragexit", () => {
				this.exit();
			});

		// Would be awesome to add Illustrator support for this, bypassing file input for activeLayer.selection
		window.addEventListener("drop", e => {
			e.preventDefault();
			this.drop(e);
		});
	},
	methods: {
		enter() {
			this.isDragging = true;
			document.querySelector("#dropzone").style.borderColor =
				"var(--dropzone-active)";
		},
		exit() {
			this.reset();
			document.querySelector("#dropzone").style.borderColor =
				"transparent";
		},
		drop(e) {
			this.reset();
			if (this.pureSvg) return this.handleILSTDrop(e);
			if (this.autoRead)
				this.single
					? this.getAsText(
							this.acceptRX.test(e.dataTransfer.files[0].name)
								? e.dataTransfer.files[0]
								: null
					  )
					: e.dataTransfer.files.forEach(file => {
							if (this.acceptRX.test(file.name))
								this.getAsText(file);
					  });
			this.confirmDrop(e.dataTransfer.files);
			document.querySelector("#dropzone").style.borderColor =
				"transparent";
		},
		async handleILSTDrop(e) {
			if (!window.__adobe_cep__) return null;
			e = e.dataTransfer.items[0];

			// Determine that a drag/drop was from an Adobe program
			if (
				e &&
				e.kind == "string" &&
				e.type == "com.adobe.cep.dnd.pasteboardtype"
			) {
				// Use internal scripting command to copy selection to clipboard;
				await evalScript(
					`if (app.selection.length) app.executeMenuCommand("copy")`
				);
				// focus a hidden input
				this.$refs.input.focus();
				// paste the contents (as pure SVG code)
				document.execCommand("paste");
				this.$refs.input.blur();
				// emit the result back up to parent
				this.$emit("read", this.inputText);
				this.inputText = "";
			}
			this.exit();
		},
		getAsText(readFile) {
			if (!readFile)
				return this.createError("Unsupported file type for Read event");
			var reader = new FileReader();
			reader.readAsText(readFile, "UTF-8");
			reader.onload = this.loaded;
			reader.onerror = this.errorHandler;
		},
		loaded(evt) {
			let result = evt.target.result;
			result = this.isJSON(result)
				? this.autoParse
					? JSON.parse(result)
					: result
				: result;
			this.$emit("read", result);
		},
		isJSON(data) {
			try {
				JSON.parse(data);
				return true;
			} catch (e) {
				return false;
			}
		},
		createError(message) {
			this.errorHandler({
				target: { error: message }
			});
		},
		errorHandler(evt) {
			this.reset();
			if (evt.target.error.name == "NotReadableError") console.error(evt);
			else console.error(evt.target.error);
		},
		async confirmDrop(data) {
			// If not enumerable, wrap in Array so below filter will work
			data = this.single ? [data[0]] : data;
			// Remove any File whose name doesn't pass the accept regex from FileList
			data = [...data].filter(item => {
				return this.acceptRX.test(item.name);
			});
			if (this.readFolders) data = await this.expandFolderData(data);
			data.length
				? this.$emit("drop", data)
				: this.createError("Unsupported file type for Drop event");
		},
		reset() {
			this.isDragging = false;
			this.msg = this.anno;
		},
		async expandFolderData(data) {
			let origin = data;
			for (let i = 0; i < data.length; i++) {
				let originalpath = data[i].path;
				data[i] = !/(\\|\/)\w*\.\w*/.test(data[i].path)
					? await this.readDir(data[i].path)
					: data[i];
				data[i] = data[i].length
					? data[i].map(file => {
							// File.path is read only. Best to create a fake File containing all the same key/values
							let child = new File([""], `${file}`, {});
							let clone = {};
							let keys = [
								"name",
								"lastModified",
								"lastModifiedDate",
								"path",
								"size",
								"type",
								"webkitRelativePath"
							];
							keys.forEach(key => {
								clone[key] = child[key];
							});
							clone.path = `${originalpath.replace(
								/(\\|\/)$/,
								""
							)}/${file}`.replace(/\\/gm, "/");
							return clone;
					  })
					: data[i];
			}
			return this.flatten ? data.flat() : data;
		},
		async readDir(thispath) {
			return new Promise((resolve, reject) => {
				fs.readdir(
					path.resolve(thispath),
					{ encoding: "utf-8" },
					(err, files) => {
						if (err) reject(err);
						resolve(files);
					}
				);
			});
		}
	}
};
</script>

<style>
#dropzone {
	/* background: rgba(255, 0, 0, 0.5); */
	border: 2px solid transparent;
	width: calc(100% - 4px);
	height: calc(100% - 5px);
	position: fixed;
	display: grid;
	top: 0;
	left: 0;
	z-index: 100;
	pointer-events: none;
}

.overlay-test {
	background: rgba(72, 133, 198, 0.2);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 30px;
}
.overlay-card {
	border-radius: 4px 4px 0px 0px;
	color: white;
	background: rgba(0, 0, 0, 0.3125);
	text-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
		0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
		0 16px 16px rgba(0, 0, 0, 0.12);
	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
		0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
		0 16px 16px rgba(0, 0, 0, 0.12);
	padding: 10px 20px;
}
</style>

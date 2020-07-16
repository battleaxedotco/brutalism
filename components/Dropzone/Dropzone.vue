<template>
  <div
    :class="[
      'dropzone',
      !isDraggingInWindow ? 'no-pointer-events' : '',
      { fullscreen },
    ]"
    :style="getDropzoneStyle()"
    @dragover="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="dropHandlerCEP"
  >
    <input
      ref="input"
      style="
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        cursor: default;
      "
      v-model="inputText"
    />
    <slot
      name="overlay"
      v-if="isDragging && !overlay && $slots.overlay && $slots.overlay.length"
    />
    <slot
      name="prompt"
      v-else-if="
        !isDragging && !overlay && $slots.prompt && $slots.prompt.length
      "
    ></slot>
    <slot name="overlay" v-else-if="isDragging && !overlay && $slots.default" />
  </div>
</template>

<script>
const isBrowser = window.__adobe_cep__;

const fs = window.__adobe_cep__ ? require("fs") : null;
const path = window.__adobe_cep__ ? require("path") : null;
import { evalScript } from "cluecumber";

export default {
  props: {
    // Whether dropzone is fullscreen or fills the relative size of container
    fullscreen: {
      type: Boolean,
      default: true,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    borderWidth: {
      type: String,
      default: "2px",
    },
    // Only accept a single file, if multiple are dropped only accept one
    single: {
      type: Boolean,
      default: false,
    },
    // Return the value of a file instead of the path
    autoRead: {
      type: Boolean,
      default: false,
    },
    // If true display a sample overlay while dragging
    overlay: {
      type: Boolean,
      default: false,
    },
    // The default text appearing in the overlay
    anno: {
      type: String,
      default: "Drop files here",
    },
    encoding: {
      type: String,
      default: "UTF-8",
    },
    // A regex string (e.g. "jpg|png") or Array like ['jpg', 'png']
    // Only files passing this validation will be sent by @drop/@read
    accepts: {
      type: [String, Array],
      default: ".*",
    },
    // Autoparse JSON files during @read
    autoParse: {
      type: Boolean,
      default: true,
    },
    // If the user drops a folder, return it's children's paths instead of it's own path
    readFolders: {
      type: Boolean,
      default: false,
    },
    // Return single-depth Array instead of Arrays within Arrays if dropping folders
    flatten: {
      type: Boolean,
      default: true,
    },
    // If Illustrator and drag/dropping activeDoc selection
    pureSvg: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "var(--dropzone-active)",
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      msg: this.anno,
      leaveCount: 0,
      isDragging: false,
      csInterface: null,
      inputText: null,
      border: "transparent",
      isDraggingInWindow: false,
      hover: false,
      isDirty: false,
      enterCount: 0,
    };
  },
  computed: {
    acceptRX() {
      if (typeof this.accepts === "object")
        return new RegExp(`(${this.accepts.join("|")})$`);
      else return new RegExp(`${this.accepts.replace(/\$$/, "")}$`);
    },
  },
  mounted() {
    // dont redirect if file dropped
    window.addEventListener(
      "dragover",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );
    window.addEventListener(
      "drop",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false
    );

    window.addEventListener("dragenter", () => {
      if (this.fullscreen) {
        if (this.debug) console.log("dragover");
        this.leaveCount = 0;
        if (!this.isDragging) this.enter();
      } else {
        if (!this.isDraggingInWindow) this.isDraggingInWindow = true;
      }
    });
    window.addEventListener("dragleave", () => {
      if (this.fullscreen) {
        this.leaveCount++;
        if (this.leaveCount >= 2) this.exit();
      }
    });
    if (this.fullscreen) {
      window.addEventListener("drop", (e) => {
        e.preventDefault();
        this.drop(e);
      });
    }
  },
  watch: {
    leaveCount(val) {
      // if (this.debug)
      // 	console.log('leaveCount:', val);
    },
    enterCount(val) {
      if (this.debug) console.log("enterCount:", val);
    },
    isDraggingInWindow(val) {
      if (!this.fullscreen) {
        // if (!val) this.isDragging = false;
      }
    },
    isDragging(val) {
      if (this.debug) console.log("isDragging:", val);
      this.$emit(val ? "dragover" : "dragleave");
    },
  },
  methods: {
    handleDragEnter() {
      if (!this.isDragging) {
        this.isDragging = true;
        this.border = this.color;
      }
    },
    handleDragLeave() {
      if (this.isDragging) {
        this.isDragging = false;
        this.border = "transparent";
      }
    },
    enter() {
      if (this.fullscreen) {
        if (this.debug) console.log("Hard enter");
        this.isDragging = true;
        this.border = this.color;
        this.isDraggingInWindow = true;
      } else {
        this.isDraggingInWindow = true;
      }
    },
    exit() {
      if (this.debug) console.log("Hard reset");
      //   if (this.fullscreen) {
      //     this.reset();
      //   } else {
      if (this.isDirty) {
        //
      } else {
        this.reset();
      }
      // 	// Should be all if not using overlay
      // 	this.reset();
      //   }
    },
    dropHandlerCEP(e) {
      //   if (this.fullscreen) return null;
      this.drop(e);
    },
    makeIterable(list) {
      let result = [];
      for (let i = 0; i < list.length; i++) result.push(list[i]);
      return result;
    },
    parseFileListByValidRX(fileList) {
      let list = [];
      for (var i = 0; i < fileList.length; i++)
        if (this.acceptRX.test(fileList[i].name)) list.push(fileList[i]);
      return list;
    },
    isFolder(file) {
      let result;
      if (window.__adobe_cep__ && fs)
        result = fs.lstatSync(file.path).isDirectory();
      else result = /(\\|\/)[^\\\/]{1,}\.\w{1,}/.test(file.path);
      return result;
    },
    async getFolderContents(folder) {
      let contents = await this.readDir(folder.path);
      let result = [];
      contents.forEach((file) => {
        result.push(fs.readFileSync(`${folder.path}/${file}`, "utf-8"));
      });
      return result;
    },
    async drop(e) {
      if (this.debug) console.log("Drop reset");
      // Clear previous
      this.reset();
      // Create unique variables per event type
      let temp = [],
        paths = [],
        valids = [];
      // Make fileList to iterable Array for es6 methods
      valids = this.makeIterable(e.dataTransfer.files).filter((file) => {
        return this.acceptRX.test(file.name);
      });
      // Sanitize array with a filter
      let validReadable = this.parseFileListByValidRX(e.dataTransfer.files);
      // Handle SVG pure drops from Illustrator
      if (this.pureSvg) return this.handleILSTDrop(e);

      if (this.single) {
        if (this.autoRead && (await !this.isFolder(validReadable[0]))) {
          this.$emit("read", await this.getAsText(validReadable[0]));
        }
      } else {
        if (this.autoRead) {
          for (let file of validReadable)
            if (!this.isFolder(file)) temp.push(await this.getAsText(file));
            else temp.push(await this.getFolderContents(file));
          if (this.flatten) temp = temp.flat();

          if (temp.length) this.$emit("read", temp);
        }
        paths = valids.map((item) => {
          return item.path;
        });
        this.$emit("input", paths);
      }
      let dropData = validReadable;
      if (this.readFolders) {
        if (this.debug) console.log("READ FOLDERS:");
        dropData = window.__adobe_cep__
          ? await this.expandFolderData(dropData)
          : this.createError(`Cannot read folders in browser!`);
        if (this.debug) console.log(dropData);
      }
      this.$emit("drop", dropData);
      // this.confirmDrop(e.dataTransfer.files);
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
      return new Promise((resolve, reject) => {
        if (!readFile)
          reject(
            this.createError("Unsupported file type for Read event", readFile)
          );
        var reader = new FileReader();
        reader.readAsText(readFile, this.encoding);
        reader.onload = () => {
          let result = reader.result;
          result = this.isJSON(result)
            ? this.autoParse
              ? JSON.parse(result)
              : result
            : result;
          resolve(result);
        };
        reader.onerror = this.errorHandler;
      });
    },
    // loaded(evt) {
    //   let result = evt.target.result;
    //   result = this.isJSON(result)
    //     ? this.autoParse
    //       ? JSON.parse(result)
    //       : result
    //     : result;
    //   this.$emit("read", result);
    // },
    isJSON(data) {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
    },
    createError(message, evt) {
      this.errorHandler({
        target: { error: message },
      });
      // console.log("HTML not yet supported! Files only.");
    },
    errorHandler(evt) {
      this.reset();
      if (evt.target.error.name == "NotReadableError") console.error(evt);
      // else console.error(evt.target.error);
    },
    getDropzoneStyle() {
      let style;
      style = `
				border-color: ${this.border};
				box-sizing: border-box;
				border-width: ${this.noBorder ? "0px" : this.borderWidth};
				border-style: solid;
				display: grid;
				z-index: 100;
			`;
      if (this.fullscreen) {
        style += `
					width: calc(100vw - 1px);
					height: calc(100vh - 2px);
					position: fixed;
					top: 0;
					left: 0;
				`;
      } else {
        `
					width: 100%;
					height: 100%;
					position: relative;
					top: 0;
					left: 0;
				`;
      }
      return style;
    },
    async confirmDrop(data) {
      console.log("Confirm data:");
      // If not enumerable, wrap in Array so below filter will work
      data = this.single ? [data[0]] : data;
      // Remove any File whose name doesn't pass the accept regex from FileList
      data = [...data].filter((item) => {
        return this.acceptRX.test(item.name);
      });
      console.log(data);
      if (this.readFolders) {
        data = !isBrowser
          ? await this.expandFolderData(data)
          : this.createError(`Cannot read folders in browser!`);
      }
      if (data.length) this.$emit("drop", data);
    },
    reset() {
      this.isDragging = false;
      this.isDraggingInWindow = false;
      this.border = "transparent";
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
          ? data[i].map((file) => {
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
                "webkitRelativePath",
              ];
              keys.forEach((key) => {
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
      console.log("TRY TO AS DIR:");
      console.log(thispath);
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
    },
  },
};
</script>

<style>
.dropzone {
  /* background: rgba(255, 0, 0, 0.5); */
}

.fullscreen {
  pointer-events: none;
}

.no-pointer-events {
  pointer-events: none;
}

.overlay-test {
  pointer-events: all;
  background: rgba(72, 133, 198, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}
.overlay-card {
  pointer-events: all;
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

<template>
  <div class="file-picker-wrapper">
    <input
      style="display: none;"
      ref="filepicker"
      type="file"
      name="testing 1 2 3"
      @change="fileHandler"
      :multiple="multiple"
      :accept="realAccepts"
    />
    <div @click="clickOnSlot" v-if="$slots.default">
      <slot />
    </div>
    <div v-else>
      <div v-if="!multiple && clearable" class="file-picker-contents input">
        <Input
          @focus="clickOnSlot"
          :pseudo="true"
          :label="realLabel"
          ref="pseudoinput"
          :flat="flat"
          :filled="filled"
          v-model="realContents"
          :append-outer-icon="realIcon"
          :style="`width: ${
            this.contents.length ? 'calc(100% - 48px)' : '100%'
          };`"
          truncate
        />
        <div class="file-picker-clear-icon input" v-show="this.contents.length">
          <Button :icon="clearIcon" flat @click="clear" />
        </div>
      </div>
      <Input
        @focus="clickOnSlot"
        v-if="!multiple && !clearable"
        :pseudo="true"
        :label="realLabel"
        ref="pseudoinput"
        :flat="flat"
        :filled="filled"
        v-model="realContents"
        :append-outer-icon="realIcon"
        truncate
      />
      <div v-if="multiple && clearable" class="file-picker-contents textarea">
        <TextArea
          @focus="clickOnSlot"
          ref="pseudotextarea"
          :pseudo="true"
          :label="realLabel"
          :flat="flat"
          :filled="filled"
          v-model="realContents"
          :append-outer-icon="realIcon"
          :style="`width: ${
            this.contents.length ? 'calc(100% - 48px)' : '100%'
          };`"
          truncate
        />
        <div
          class="file-picker-clear-icon textarea"
          v-show="this.contents.length"
        >
          <Button :icon="clearIcon" flat @click="clear" />
        </div>
      </div>
      <TextArea
        v-else-if="multiple && !clearable"
        @focus="clickOnSlot"
        ref="pseudotextarea"
        :pseudo="true"
        :label="realLabel"
        :flat="flat"
        :filled="filled"
        v-model="realContents"
        :append-outer-icon="realIcon"
        truncate
      />
    </div>
  </div>
</template>

<script>
import { openDialog, evalScript } from "cluecumber";
const fspath = window.__adobe_cep__ ? require("path") : null;
const fs = window.__adobe_cep__ ? require("fs") : null;

export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    folder: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    accepts: {
      type: [String, Array],
      default: () => {
        return ["*"];
      },
    },
    autoParse: {
      type: Boolean,
      default: true,
    },
    flatten: {
      type: Boolean,
      default: true,
    },
    readFolders: {
      type: Boolean,
      default: false,
    },
    encoding: {
      type: String,
      default: "UTF-8",
    },
    autoRead: {
      type: Boolean,
      default: false,
    },
    debug: {
      type: Boolean,
      default: false,
    },
    depth: {
      type: Number,
      default: 0,
    },
    prefix: {
      type: String,
      default: "./",
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    clearIcon: {
      type: String,
      default: "close",
    },
    prefsId: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    contents: [],
    readContents: [],
    text: "No file selected",
    type: "filepicker",
  }),
  mixins: [require("../mixinPrefs").default],
  mounted() {
    if (this.prefsId.length) {
      this.checkLocalPrefs();
      let lastState = this.checkPrefsFor(this.prefsId);

      if (lastState === null) {
        // Do nothing...
      } else {
        let content = lastState.value.split(";");
        this.contents = content;

        if (this.folder) {
          this.folderHandler(content);
        } else {
          this.fileHandler({
            target: {
              files: content,
            },
          });
        }
        this.$emit("prefs", content);
      }
    }
  },
  computed: {
    realAccepts() {
      return !/string/.test(typeof this.accepts)
        ? this.accepts.join(", ")
        : this.accepts;
    },
    realIcon() {
      if (this.icon.length) return this.icon;
      else return this.folder ? "folder-outline" : "file-outline";
    },
    realLabel() {
      if (this.label.length) return this.label;
      else
        return `Choose ${this.folder ? "Folder" : "File"}${
          this.multiple ? "s" : ""
        }`;
    },
    realTitle() {
      if (this.title.length) return this.title;
      else
        return `Choose ${this.folder ? "Folder" : "File"}${
          this.multiple ? "s" : ""
        }`;
    },
    realContents() {
      return this.contents.length
        ? this.sanitizeContentsByDepth()
        : `No ${this.folder ? "Folder" : "File"}${
            this.multiple ? "s" : ""
          } selected`;
    },
    realDepth() {
      return this.folder
        ? this.readFolders
          ? this.depth + 2
          : this.depth + 1
        : this.depth + 1;
    },
  },
  methods: {
    get() {
      return {
        read: this.readContents,
        contents: this.contents,
        display: this.realContents,
      };
    },
    set(array) {
      if (this.multiple) this.contents = array;
      else this.contents = [array[0]];
    },
    clear() {
      this.$refs.filepicker.type = "text";
      this.$refs.filepicker.type = "file";
      this.$refs.filepicker.value = "";
      this.$emit("clear");
      this.reset();
    },
    sanitizeContentsByDepth() {
      let result = [];
      this.contents.forEach((path) => {
        result.push(
          `${this.prefix}${path
            .split(/\/{1,}|\/{1,}/)
            .reverse()
            .slice(0, this.realDepth)
            .reverse()
            .join("/")}`
        );
      });
      return result.length > 1 ? result.join(", ") : result[0];
    },
    // Opens a native open dialog and returns the target folder/file path as obj.path
    openDialog(title, isFolder = false) {
      if (!window.__adobe_cep__) return null;
      let menu = cep.fs.showOpenDialogEx(true, isFolder, title);
      let result;
      if (menu.err) result = { error: menu.err };
      else if (!menu.data.length) result = { error: "Canceled" };
      else result = menu.data;
      return result;
    },
    async clickOnSlot() {
      const self = this;
      try {
        if (!this.multiple && this.$refs.pseudoinput)
          this.$refs.pseudoinput.blur();
        else if (this.multiple && this.$refs.pseudotextarea)
          this.$refs.pseudotextarea.blur();
      } catch (err) {
        //
      }
      if (!this.folder) await this.openFilePicker();
      else await this.openFolderPicker();
    },
    async openFilePicker() {
      if (this.debug) console.log("accept:", `"${this.realAccepts}"`);
      this.$refs.filepicker.click();
    },
    async openFolderPicker() {
      let result = await this.openDialog(this.realTitle, true);
      if (this.debug) {
        console.log("Folder picked:");
        console.log(result);
      }
      await this.folderHandler(result);
    },
    async folderHandler(array) {
      if (!array.length) return null;
      this.reset();
      this.contents = [];
      this.readContents = [];
      let temp = [];
      if (this.readFolders) {
        for (let filepath of array) {
          let target = [];
          if (this.debug) console.log("Reading children of:", filepath);
          let parent = await this.readDir(filepath);
          for (let file of parent) {
            this.contents.push(`${filepath}/${file}`);
            if (this.debug) console.log(`${filepath}/${file}`);
            let item = fs.readFileSync(`${filepath}/${file}`, "utf-8");
            this.readContents.push(item);
            if (this.autoRead) target.push(item);
            else target.push(`${filepath}/${file}`);
          }
          temp.push(target);
        }
      } else {
        this.contents = array;
      }
      if (this.flatten) temp = temp.flat();
      if (this.autoRead) {
        this.$emit("read", temp);
      }
      this.$emit("input", array);
      this.$emit("drop", await this.generateDropFolderData());
      if (this.debug) {
        console.log(this.contents);
        console.log(this.readContents);
        console.log(temp);
      }
      this.setPrefsById(this.prefsId, this.contents.join(";"));
    },
    async generateDropFolderData() {
      let temp = [];
      for (let file of this.contents) {
        const stats = fs.statSync(file);
        let clone = {
          lastModified: stats.mtimeMs,
          lastModifiedDate: stats.mtime,
          size: stats.size,
          name: file.match(/[^\/|\\]{1,}$/)[0],
          path: file,
          webkitRelativePath: "",
          type: "",
        };
        temp.push(clone);
      }
      return temp;
    },
    async fileHandler(e) {
      // Stop this function if the user has pressed cancel
      if (!e.target.files.length) {
        this.$emit("cancel");
        return null;
      }
      // Otherwise reset previous values
      this.reset();
      let fileList = e.target.files;
      let temp = [];
      if (this.autoRead) {
        for (let file of fileList)
          this.readContents.push(await this.getAsText(file));
      }
      this.contents = this.makeIterable(fileList).map((item) => {
        return /object/i.test(typeof item)
          ? item.path.replace(/\\/gm, "/")
          : item.replace(/\\/gm, "/");
      });
      if (this.debug) {
        if (this.autoRead) console.log(this.readContents);
        else console.log(this.contents);
      }
      if (this.autoRead)
        this.$emit(
          "read",
          this.multiple ? this.readContents : this.readContents[0]
        );
      this.$emit("input", this.multiple ? this.contents : this.contents[0]);
      this.$emit("drop", this.makeIterable(e.target.files));
      this.setPrefsById(this.prefsId, this.contents.join(";"));
    },
    makeIterable(list) {
      let result = [];
      for (var i = 0; i < list.length; i++) result.push(list[i]);
      return result;
    },
    getAsText(readFile) {
      return new Promise((resolve, reject) => {
        if (!readFile)
          reject(
            this.createError("Unsupported file type for Read event", readFile)
          );
        if (/object/i.test(typeof readFile)) {
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
        } else if (/string/i.test(typeof readFile) && fs) {
          resolve(fs.readFileSync(readFile, "utf-8"));
        } else {
          reject("prefs-id file reading cannot be done in Browser.");
        }
      });
    },
    async loaded(evt) {
      let result = evt.target.result;
      result = this.isJSON(result)
        ? this.autoParse
          ? JSON.parse(result)
          : result
        : result;
      return result;
    },
    isJSON(data) {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
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
      return new Promise((resolve, reject) => {
        fs.readdir(
          fspath.resolve(thispath),
          { encoding: "utf-8" },
          (err, files) => {
            if (err) reject(err);
            resolve(files);
          }
        );
      });
    },
    createError(message, evt) {
      this.errorHandler({
        target: { error: message },
      });
      console.log("HTML not yet supported! Files only.");
    },
    errorHandler(evt) {
      this.reset();
      if (evt.target.error.name == "NotReadableError") console.error(evt);
      else console.error(evt.target.error);
    },
    reset() {
      this.contents = [];
      this.readContents = [];
      this.text = "No file selected";
    },
    //
    async confirmHandler(data) {
      if (this.readFolders)
        data = window.__adobe_cep__
          ? await this.expandFolderData(data)
          : this.createError(`Cannot read folders in browser!`);
      data.length
        ? this.$emit("input", data)
        : this.createError("Unsupported file type for Drop event");
    },
    //
  },
};
</script>

<style>
.brutalism-filepicker {
}
.file-picker-contents {
  display: flex;
  flex-wrap: wrap;
}

.file-picker-clear-icon {
  padding: 0px 5px;
  height: 100%;
}

.file-picker-contents.input {
  align-items: flex-end;
}
.file-picker-clear-icon.input {
  margin: 0px 0px 6px 0px;
}

.file-picker-contents.textarea {
  align-items: flex-start;
}
.file-picker-clear-icon.textarea {
  margin: 23px 0px 0px 0px;
}
</style>

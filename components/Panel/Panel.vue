<template>
  <div
    class="panel"
    :style="checkPanelHeight()"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <slot style="overflow: hidden" />
  </div>
</template>

<script>
// Dynamic identification object that reports all panel and host information:
// https://github.com/Inventsable/CEP-Spy
const spy = window.__adobe_cep__ ? require("cep-spy").default : null;
const fs = require("fs");
const path = require("path");
import starlette from "starlette";
import { evalScript } from "cluecumber";
import gehenna from "gehenna";

export default {
  props: {
    utils: {
      type: [String, Array],
      default: "./src/host/universal/",
    },
    scriptPath: {
      type: [String, Array],
      default: "./src/host/[appName]",
    },
    exclude: {
      type: [String, Array],
      default: "",
    },
    noUtils: {
      type: Boolean,
      default: false,
    },
    debug: {
      type: Boolean,
      default: false,
    },
    app: {
      type: String,
      default: "AEFT",
    },
    theme: {
      type: String,
      default: "gradient",
    },
    gradient: {
      type: String,
      default: "",
    },
    keepConsole: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    validFile: /\.js(x(bin)?|(fl))?$/,
    themeForcer: null,
    csInterface: null,
  }),
  computed: {
    realUtils() {
      return typeof this.utils === "string"
        ? this.sanitizeString(this.utils)
        : this.utils.map((util) => {
            return this.sanitizeString(util);
          });
    },
    realScriptPath() {
      return typeof this.scriptPath === "string"
        ? this.sanitizeString(this.scriptPath)
        : this.scriptPath.map((script) => {
            return this.sanitizeString(script);
          });
    },
    noExclusion() {
      return !this.exclude.length;
    },
    realExcludes() {
      if (this.noExclusion) return null;
      return typeof this.exclude === "string"
        ? new RegExp(this.exclude)
        : new RegExp(
            `${this.exclude
              .map((item) => {
                return escape(item);
              })
              .join("|")}`
          );
    },
  },
  created() {
    window.localStorage.setItem("starletteActive", false);
    if (spy) starlette.init();
  },
  async mounted() {
    if (spy) {
      if (!this.debug && !this.keepConsole) console.clear();
      console.log(
        `${spy.extName} ${spy.extVersion} : ${spy.isDev ? "DEV" : "BUILD"}`
      );
    }
    if (window.__adobe_cep__) {
      this.csInterface = new CSInterface();
      this.csInterface.addEventListener("console", (msg) => {
        if (msg.data && msg.data !== "undefined") console.log(msg.data);
      });
      this.csInterface.addEventListener("console_error", (msg) => {
        if (msg.data && msg.data !== "undefined") console.error(msg.data);
      });
      this.csInterface.addEventListener("console_debug", (msg) => {
        if (msg.data && msg.data !== "undefined") console.debug(msg.data);
      });
      this.csInterface.addEventListener("console_clear", () => {
        console.clear();
      });
    }

    if (window.__adobe_cep__) {
      await this.loadUtils();
      await this.loadScriptPath();
    } else if (this.app && this.theme) {
      this.parseWebTheme();
    }
    document.body.style.overflow = "auto";
    this.checkSize();
    window.addEventListener("resize", () => {
      this.checkSize();
      this.$emit("resize", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  },
  methods: {
    checkSize() {
      if (window.orientation !== undefined) {
        if (window.innerWidth > window.innerHeight) {
          this.setCSS("font-size", "10px");
        } else {
          this.setCSS("font-size", "12px");
        }
      } else {
        this.setCSS("font-size", "10px");
      }
    },
    errorMessage() {
      console.error(
        `Brutalism requires CSInterface to function. Make sure to add a version of CSInterface to your panel's base index.html!\r\nSee an example index.html setup here: https://github.com/Inventsable/forte/blob/master/public/index.html#L8-L11`
      );
    },
    checkPanelHeight() {
      return `height: ${
        document.querySelector(".tabs-wrapper")
          ? `calc(100vh - 32px);`
          : `100vh;`
      }`;
    },
    parseWebTheme() {
      let app =
        this.app ||
        (this.$route && this.$route.params && this.$route.params.app)
          ? this.app || this.$route.params.app
          : "ILST";
      let theme =
        this.theme || (this.$route.params && this.$route.params.theme)
          ? this.theme || this.$route.params.theme
          : "darkest";
      let gradient = this.gradient || "";
      if (/\d/.test(theme) && !gradient.length) {
        gradient = +theme >= 100 ? 100 : +theme <= 0 ? 0 : +theme;
        theme = "gradient";
      }
      try {
        starlette.initAs(app, theme, gradient);
      } catch (err) {
        //
      }
    },
    removeRelativePrefix(thispath) {
      return /^\.\//.test(thispath) && spy
        ? `${spy.path.root}/${thispath.replace(/^\.\//, "")}`
        : thispath;
    },
    async readDirs(these) {
      let mapped = [];
      for (const item in these) mapped.push(await this.readDir(item));
      return mapped;
    },
    async readDir(thispath) {
      thispath = this.removeRelativePrefix(thispath);
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
    exists(thispath) {
      return fs.existsSync(thispath);
    },
    isFolder(thispath) {
      return fs.lstatSync(thispath).isDirectory();
    },
    async readFiles(these) {
      let mapped = [];
      for (const item in these) mapped.push(await this.readFile(item));
      return mapped;
    },
    async readFile(thispath) {
      thispath = this.removeRelativePrefix(thispath);
      return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(thispath), "utf-8", (err, files) => {
          if (err) reject(err);
          resolve(files);
        });
      });
    },
    async loadScript(loadPath) {
      if (!this.noExclusion && this.realExcludes.test(loadPath))
        return console.log(`Excluding ${loadPath}`);
      if (!this.debug) console.log(`Loading ${loadPath}`);
      try {
        // Correctly loads a script regardless of whether Animate or regular CEP app
        if (spy && !/FLPR/.test(spy.appName) && window.__adobe_cep__) {
          let result = await evalScript(
            `$.evalFile('${loadPath.replace(/\\/gm, "/")}')`
          );
          if (this.debug)
            console.log(`Loading...`, loadPath.replace(/\\/gm, "/"), result);
        } else if (window.__adobe_cep__) {
          /**
           * REF: Timelord Windows users reporting "Alert: Javascript Argument 1 is invalid" error
           * This was caused by faulty Windows filepath URI
           */
          let ensuredPath = loadPath;
          if (!navigator.platform.indexOf("Mac") > -1) {
            ensuredPath = loadPath
              .replace(/C:(\\|\/){1,}/, "C:\\\\")
              .replace(/\//gm, "\\")
              .replace(/\\/gm, "/");
          }
          // The above ensures that it works for Windows 10, but may be better left resolved through path.resolve() and decodeURI()
          if (this.debug) console.log(`Loading...`, ensuredPath);
          let result = await evalScript(
            `fl.runScript(FLfile.platformPathToURI("${ensuredPath}"))`
          );
        }
      } catch (err) {
        this.errorMessage(err);
      }
    },
    sanitizeString(str) {
      return this.replaceSpyVariables(
        str.replace(/^\.\//, `${spy.path.root}/`).replace(/\/$/, "")
      );
    },
    async loadUtils() {
      if (this.noUtils) return null;
      await gehenna();
      return this.noUtils
        ? null
        : typeof this.realUtils === "string"
        ? await this.handlePath(this.realUtils)
        : this.realUtils.forEach((util) => {
            this.handlePath(util);
          });
    },
    async loadScriptPath() {
      if (this.debug) console.log("Loading paths:", this.realScriptPath);
      if (typeof this.realScriptPath === "string") {
        let isFolder = await this.isFolder(this.realScriptPath);
        if (!isFolder) return await this.handlePath(this.realScriptPath);
        else if (this.exists(`${this.realScriptPath}/host.jsx`))
          return await this.handlePath(`${this.realScriptPath}/host.jsx`);
        else throw new Error(`${this.realScriptPath} is a folder, not a file`);
      } else {
        for (const scriptPath of this.realScriptPath) {
          let isFolder = await this.isFolder(scriptPath);
          if (!isFolder) await this.handlePath(scriptPath);
          else if (this.exists(`${scriptPath}/host.jsx`))
            await this.handlePath(`${scriptPath}/host.jsx`);
          else throw new Error(`${scriptPath} is a folder, not a file`);
        }
      }
    },
    async handlePath(thispath) {
      if (this.debug) console.log(`Handling path:`, thispath);
      return await this.investigatePath(thispath);
    },
    async investigatePath(thispath) {
      if (/\/src\/host\/universal$/.test(thispath)) return null;
      let exists = await this.exists(thispath);
      if (!exists) {
        if (this.debug) console.log(`DOES NOT EXIST:`, thispath);
        return this.noUtils ? null : new Error(`${thispath} does not exist`);
      }
      let isFolder = await this.isFolder(thispath);
      let result = isFolder
        ? await this.loadFolder(thispath)
        : await this.handleFile(thispath);
      if (this.debug) {
        console.log("Investigating:", thispath);
        console.log("Is folder?", isFolder);
        console.log(result);
      }
    },
    async handleFile(thispath) {
      if (this.validFile.test(thispath)) return await this.loadScript(thispath);
      else throw new Error(`${thispath} is not a valid scripting file`);
    },
    async loadFolder(thispath) {
      let contents = await this.readDir(thispath);
      let valids = contents.filter((file) => {
        return (
          this.validFile.test(file) &&
          !/json2|ES6_Array_Methods|Console/i.test(file)
        );
      });
      for (let index in valids)
        await this.loadScript(`${thispath}/${valids[index]}`);
    },
    replaceSpyVariables(str) {
      Object.keys(spy).forEach((key) => {
        let rx = new RegExp(`\\[${key}\\]`);
        if (rx.test(str)) str = str.replace(rx, spy[key]);
      });
      return str;
    },
    consoler(msg) {
      // Catches all console.log() usage in .jsx files via CSEvent
      console.log(`${spy.appName}: ${msg.data}`);
    },
    setCSS(prop, data) {
      // Sets value of CSS variable
      // prop == typeof String as name of variable, with or without leading dashes:
      // this.setCSS('color-bg', 'rgba(25,25,25,1)') || this.setCSS('--scrollbar-width', '20px')
      document.documentElement.style.setProperty(
        `${/^\-\-/.test(prop) ? prop : "--" + prop}`,
        data
      );
    },
  },
};
</script>

<style>
/* Various helper styles to match host application's theme */
/* @import url("https://fonts.googleapis.com/css?family=Open+Sans&display=swap"); */
:root {
  --quad: cubic-bezier(0.48, 0.04, 0.52, 0.96);
  --quart: cubic-bezier(0.76, 0, 0.24, 1);
  --quint: cubic-bezier(0.84, 0, 0.16, 1);
  --font-size: 10px;
  --highlight-bg: #b4d7fd;
  --highlight-text: #161616;
  background-color: var(--color-bg);
  color: var(--default-color);
  font-family: "Open Sans", sans-serif;
}
body {
  margin: 0px;
  overflow: hidden;
}

input,
textarea,
select,
button {
  font-family: "Open Sans", monospace;
  font-size: 12px;
}

.panel {
  position: relative;
  box-sizing: border-box;
  padding: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  cursor: default;
  font-size: var(--font-size);
}
.fold:first-of-type {
  border-top: solid 1px transparent !important;
}
#app::-webkit-scrollbar {
  display: block;
}
::-webkit-scrollbar {
  background-color: var(--color-scrollbar);
  width: 15px;
}
::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 15px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-hover);
}
</style>

<template>
  <div class="file-input-wrapper">
    <div class="top-label">{{ label }}</div>
    <div class="input-wrapper" @click="getFolder">
      <div class="input-field">
        <slot v-if="$slots.default" />
        <span v-else>{{ shortLength }}</span>
      </div>
      <div class="btn-wrapper">
        <button>
          <svg fill="none" viewBox="0 0 24 24">
            <path d="M7.5 10H21l-3.5 9H4l3.5-9z" />
            <path
              fill-rule="evenodd"
              d="M8.545 5H4v11.133L6.853 9H18V7h-8L8.545 5z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { openDialog, evalScript } from "cluecumber";

export default {
  props: {
    label: {
      type: String,
      default: "File input",
    },
    value: {
      type: String,
      default: "./",
    },
    picker: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "Get Folder",
    },
    isFolder: {
      type: Boolean,
      default: false,
    },
    filter: {
      type: String,
      default: "",
    },
    prefsId: {
      type: String,
      default: "",
    },
  },
  mixins: [require("../mixinPrefs").default],
  data: () => ({
    path: "",
    type: "fileInput",
  }),
  mounted() {
    this.checkValue();
  },
  watch: {
    value(val) {
      this.updateValue(val);
    },
  },
  computed: {
    shortLength() {
      let targ =
        typeof this.path === "object"
          ? this.path.path
          : this.path.length
          ? this.path
          : this.value;
      // return this.path;
      // let targ = this.path || this.value;
      if (targ) {
        if (/\/|\\/.test(targ) && targ !== "./") {
          return `../${targ.replace(/.*(\/|\\)/, "")}`;
        } else {
          return targ;
        }
      } else {
        return "";
      }
      return targ;
    },
  },
  methods: {
    checkValue() {
      // console.log("UPDATE?");
      if (this.prefsId.length) {
        this.checkLocalPrefs();
        let lastState = this.checkPrefsFor(this.prefsId);
        // console.log(lastState);
        if (lastState === null) {
          this.path = this.value;
        } else {
          this.path = lastState.value;
          this.$emit("update", lastState.value);
        }
      } else {
        this.path = this.value;
      }
    },
    updateValue(result) {
      // console.log("RESULT:");
      // console.log(result);
      this.path = result;
      this.$emit("update", result);
      if (this.prefsId.length) {
        this.setPrefsById(this.prefsId, result);
      }
    },
    async getFolder() {
      let result;
      if (this.$props.picker) {
        result = await openDialog(this.title, this.isFolder);
        this.$emit("update", result);
      } else {
        result = await evalScript(`
						function openDialog(title, filter, multiselect) {
							if (arguments.length < 2) {
								multiselect = true;
								fitler = undefined;
							}
							var data = File.openDialog('${this.title}', '${this.filter}', '${this.multiselect}')
							return data;
						}	
					`);
        this.$emit("update", result);
      }
      if (this.prefsId.length) {
        // console.log("SET TO:");
        // console.log(result.path);
        this.setPrefsById(this.prefsId, result);
      }
      this.path = result.path;
    },
  },
};
</script>

<style scoped>
.file-input-wrapper {
  margin: 6px 0px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
}

.top-label {
  cursor: default;
  user-select: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  font-size: 9px;
  color: var(--color-icon);
}

.input-wrapper {
  width: 100%;
  margin: 2px 0;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  border: 1px solid rgba(0, 0, 0, 0);
  border-radius: 2px;
  align-items: flex-start;
}

.input-wrapper:hover {
  border: 1px solid var(--color-btn-pill-active);
}

.input-field {
  border: 1px solid var(--color-input-border);
  background-color: var(--color-input);
  padding: 6px 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: calc(100% - 40px);
  height: 15px;
}

.btn-wrapper {
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn-wrapper > button:focus {
  outline: 0;
}
button {
  padding: 3px 0 0 0;
  min-width: 30px;
  background-color: rgba(0, 0, 0, 0) !important;
  border: none;
}
button svg {
  width: 22px;
  height: 20px;
  fill: var(--color-icon);
}
</style>

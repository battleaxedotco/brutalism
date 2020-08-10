<template>
  <div style="width: 0px; height: 0px; margin: 0px; padding: 0px; display: none;" />
</template>

<script>
import { evalScript } from "brutalism";
export default {
  props: {
    interval: {
      type: Number,
      default: 1000,
    },
    code: {
      type: String,
      default: "",
    },
    property: {
      type: String,
      default: "",
    },
    value: {
      type: null,
      default: null,
    },
  },
  data: () => ({
    clock: null,
    result: null,
  }),
  beforeDestroy() {
    this.clearInterval();
  },
  created() {
    this.reset();
  },
  watch: {
    result(val) {
      this.$emit("input", val);
      this.$emit("update", val);
    },
  },
  mounted() {
    this.$emit("mounted");
  },
  computed: {
    hasPropertyOrCode() {
      return this.property.length || this.code.length;
    },
  },
  methods: {
    createInterval() {
      this.clock = setInterval(this.checkValue, this.interval);
      this.$emit("timer-created");
    },
    async checkValue() {
      let result;
      if (!this.hasPropertyOrCode) return null;
      if (this.property.length)
        result = await evalScript(`(function(){ return ${this.property} }())`);
      else if (this.code.length)
        result = await evalScript(`(function(){ ${this.code} }())`);
      this.result = result !== this.result ? result : this.result;
    },
    clearInterval() {
      clearInterval(this.clock);
      this.clock = null;
      this.$emit("destroyed");
    },
    reset() {
      if (this.clock) this.clearInterval();
      this.createInterval();
    },
  },
};
</script>

<style>
</style>
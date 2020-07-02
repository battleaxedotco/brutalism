<template>
  <div class="option-wrapper">
    <runtime-template-compiler v-if="model.length" :template="model" />
    <wrap-node v-else-if="node" tag="div" :value="node" />
  </div>
</template>

<script>
import { RuntimeTemplateCompiler } from "vue-runtime-template-compiler";
export default {
  components: {
    RuntimeTemplateCompiler,
    "wrap-node": require("../wrapNode").default
  },
  props: {
    model: {
      type: String,
      default: ""
    },
    node: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  mounted() {
    // if (this.node) console.log(this.node);
    // else if (this.model.length) {
    // }
  }
};
</script>

<style>
.option-wrapper {
  padding-right: 3px;
}
</style>

<template>
  <span :class="[ 'anno-wrapper', { uppercase, italic, bold } ]" :style="{
    color: color,
    'font-size': size,
    'font-family': font,
    'letter-spacing': computedSpacing,
    margin: margin,
    'display': 'block',
    'font-weight': computedWeight,
    'word-spacing': wordSpacing,
    'word-break': wordBreak
  }">
    <span v-if="$slots.default" 
      :style="{
        'decoration': textDecoration
      }"
      :class="['anno-content', { strikethrough, overline, underline }]"
    >
      <slot />
    </span>
    <span v-else-if="text" :class="['anno-content', { strikethrough, overline, underline }]">{{text}}</span>
  </span>
</template>

<script>
export default {
  computed: {
    computedWeight() {
      return this.bold ? 'bold' : this.weight      
    },
    computedSpacing() {
      return this.uppercase && this.letterSpacing == 'normal' ? '.25ch' : this.letterSpacing 
    }
  },
  props: {
    text: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '14px'
    },
    font: {
      type: String,
      default: '"Open Sans", sans-serif'
    },
    color: {
      type: String,
      default: 'var(--default-color)'
    },
    uppercase: {
      type: Boolean,
      default: false
    },
    letterSpacing: {
      type: String,
      default: 'normal'
    },
    margin: {
      type: String,
      default: '0px 0px 1ch 0px'
    },
    italic: {
      type: Boolean,
      default: false
    },
    bold: {
      type: Boolean,
      default: false
    },
    weight: {
      type: String,
      default: '500'
    },
    wordSpacing: {
      type: String,
      default: 'normal'
    },
    wordBreak: {
      type: String,
      default: 'normal'
    },
    underline: {
      type: Boolean,
      default: false
    },
    overline: {
      type: Boolean,
      default: false
    },
    textDecoration: {
      type: String,
      default: ''
    },
    strikethrough: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>
.uppercase {
  text-transform: uppercase;
}
.italic {
  font-style: italic;
}
.strikethrough {
  text-decoration: line-through;
}
</style>
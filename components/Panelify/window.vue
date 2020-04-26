<template>
  <div class="panel-wrapper">
    <div class="panel-header" :style="getWrapperStyle()">
      <div class="panel-title">
        <header-icon icon="arrows" style="margin-right: 4px;" />
        <header-icon icon="x" />
      </div>
    </div>
    <panelify
      :extName="name"
      :appName="app"
      :theme="theme"
      :src="src"
      :width="width"
      :height="height"
      :gradient="gradient" 
    />
    <div class="panel-footer" :style="getFooterStyle()"></div>
  </div>
</template>

<script>
import starlette from 'starlette'

export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    app: {
      type: String,
      default: 'ILST',
    },
    url: {
      type: String,
      default: 'https://zen-ramanujan-97e3d0.netlify.app/#'
    },
    route: {
      type: String,
      default: '/'
    },
    theme: {
      type: String,
      default: 'darkest'
    },
    gradient: {
      type: Number,
      default: 0,
    },
    height: {
      type: String,
      default: "300px"
    },
    width: {
      type: String,
      default: ""
    }
  },
  computed: {
    src() {
      return `${this.url}${this.route}`
    },
    realTheme() {
      return this.theme == 'gradient' ? this.gradient : this.theme;
    },
    isGradientApp() {
      return /ILST|IDSN|PHXS/.test(this.app)
    }
  },
  components: {
    panelify: require('./panelify').default,
    "header-icon": require('./svg.vue').default,
  },
  methods: {
    getFooterStyle() {
      return `
        background-color: ${starlette.getColorAs(
          "color-bg",
          this.app,
          this.theme,
          this.gradient || null
        )};
      `
    },
    getWrapperStyle() {
      return `
        background-color: ${starlette.getColorAs(
          this.isGradientApp ? "color-header" : "color-bg",
          this.app,
          this.theme,
          this.gradient || null
        )};
        color: ${starlette.getColorAs(
          "color-btn-pill-border",
          this.app,
          this.theme,
          this.gradient || null
        )};
      `;
    },
    mounted() {
      console.log(this.src)
    }
  }
}
</script>

<style>
.panel-wrapper {
  border-radius: 6px 6px 0px 0px;
  box-sizing: border-box;
  max-width: calc(100% - 20px);
  overflow: hidden;
  box-shadow: 0 1px 1px rgba(0,0,0,0.11), 
              0 2px 2px rgba(0,0,0,0.11), 
              0 4px 4px rgba(0,0,0,0.11);
  }

.panel-header {
  background: var(--color-header-dark);
  height: 12px;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  flex-wrap: nowrap;
  align-items: center;
  border-style: solid;
  border-color: black;
  border-width: 0px 0px 1.5px 0px;
}
.panel-dots {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: center;
}
.panel-footer {
  width: 100%;
  height: 8px;
}

.panel-title {
  margin-right: 4px;
  /* color: #232323; */
}
.panel-dot {
  width: 14px;
  height: 14px;
  border-radius: 20px;
  margin: 0px 5px;
}

@media (orientation: landscape) {
  :root, body, html, #app {
    overflow: auto;
    height: auto;
  }
}

@media (orientation: portrait) {
  .panel-wrapper {
    height: 100%;
  }
}
</style>
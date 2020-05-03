<template>
  <div class="panelify-wrapper">
    <div class="block-panel-wrapper" :style="getWrapperStyle()">
      <div class="block-panel-header" :style="getHeaderStyle()">
        <div class="block-panel-tab" :style="getTabStyle()">
          <div class="block-panel-title">{{extName}}</div>
          <div v-if="isBlock" class="block-panel-menu">
            <hamburger :color="getMenuColor()" />
          </div>
        </div>
        <div v-if="!isBlock" style="padding-right: 12px; padding-bottom: 4px;" class="block-panel-menu">
          <hamburger :color="getMenuColor()" />
        </div>
      </div>
      <div class="block-panel-content">
        <iframe ref="panel" :src="this.src" frameborder="0" style="width: 100%; height: 100%;"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import starlette from 'starlette'
export default {
  props: {
    extName: String,
    appName: String,
    theme: String,
    width: {
      type: String,
      default: '100%'
    },
    height: String,
    gradient: Number,
    src: String
  },
  computed: {
    isBlock() {
      return /aeft|ppro|audt/i.test(this.appName);
    },
    themeBlocks() {
      return this.isBlock ? this.AEFTcontrollers : this.ILSTcontrollers;
    },
  },
  data: () => ({
    newTheme: null,
    newGradient: null,
    AEFTcontrollers: [
      {
        active: false,
        value: 0,
        panelBG: [35, 35, 35]
      },
      {
        active: false,
        value: 50,
        panelBG: [59, 59, 59]
      },
      {
        active: false,
        value: 100,
        panelBG: [83, 83, 83]
      }
    ],
    ILSTcontrollers: [
      {
        active: false,
        value: "darkest",
        panelBG: [50, 50, 50]
      },
      {
        active: false,
        value: "dark",
        panelBG: [83, 83, 83]
      },
      {
        active: false,
        value: "light",
        panelBG: [184, 184, 184]
      },
      {
        active: false,
        value: "lightest",
        panelBG: [240, 240, 240]
      }
    ]
  }),
  components: {
    hamburger: require('./hamburger').default
  },
  mounted() {
    let themeController;
    themeController = this.isBlock
      ? this.AEFTcontrollers.find(item => {
          return item.value == this.gradient;
        })
      : this.ILSTcontrollers.find(item => {
          return item.value == this.theme;
        });
    themeController.active = true;
    const self = this;
    if (this.src) this.$refs.panel.onload = () => {
        // self.updatePanelifyTheme();
      };
  },
  methods: {
    // updatePanelifyTheme() {
    //   let msg = this.isBlock
    //     ? `${this.appName};${this.activeController.value}`
    //     : `${this.appName}${this.activeController.value}`;
    //   if (this.src) this.$refs.panel.contentWindow.postMessage(msg, "*");
    // },
    clearActives() {
      if (this.isBlock) {
        this.AEFTcontrollers.forEach(controller => {
          controller.active = false;
        });
      } else {
        this.ILSTcontrollers.forEach(controller => {
          controller.active = false;
        });
      }
    },
    changeActiveBlock(item) {
      this.clearActives();
      item.active = true;
      if (this.isBlock) {
        this.newGradient = item.value;
      } else {
        this.newTheme = item.value;
      }
    },
    getWrapperStyle() {
      return `
        box-sizing: border-box;
        width: ${this.width};
        height: ${this.height};
        border-style: solid;
        border-color: ${starlette.getColorAs(
        "color-header-border",
        this.appName,
        this.newTheme || this.theme,
        this.newGradient || this.newGradient == 0
          ? this.newGradient
          : this.gradient || null
        )};
        border: ${this.isBlock ? "0px 4px 4px 4px" : "0px 2px 2px 2px"};
        border-top-width: 0px !important;
        background-color: ${starlette.getColorAs(
          "color-bg",
          this.appName,
          this.newTheme || this.theme,
          this.newGradient || this.newGradient == 0
            ? this.newGradient
            : this.gradient || null
        )};
        color: ${starlette.getColorAs(
          "color-btn-pill-border",
          this.appName,
          this.newTheme || this.theme,
          this.newGradient || this.newGradient == 0
            ? this.newGradient
            : this.gradient || null
        )};
      `;
    },
    getHeaderStyle() {
      return `
        width: 100%;
        border-color: ${!this.isBlock ?starlette.getColorAs(
          "color-scrollbar-thumb",
          this.appName,
          this.newTheme || this.theme,
          this.newGradient || this.newGradient == 0
            ? this.newGradient
            : this.gradient || null
        ) : 'transparent'};
        border-width: ${this.isBlock ? "0px 0px 1px 0px" : "0px"};
        background-color: ${
          !this.isBlock
            ? starlette.getColorAs(
                "color-header",
                this.appName,
                this.newTheme || this.theme
              )
            : "transparent"
        };
      `;
    },
    getTabStyle() {
      return `
        border-width: ${this.isBlock ? "0px" : "0px"};
        border-color: ${starlette.getColorAs(
          "color-btn-pill-border",
          this.appName,
          this.newTheme || this.theme,
          this.newGradient || this.newGradient == 0
            ? this.newGradient
            : this.gradient || null
        )};
        background-color: ${
          !this.isBlock
            ? starlette.getColorAs(
                "color-bg",
                this.appName,
                this.newTheme || this.theme
              )
            : "transparent"
        };
        padding: ${this.isBlock ? "0px" : "0px 10px"};
        margin-left: ${this.isBlock ? "10px" : "0px"};
      `;
    },
    getControllerButtonStyle(index, color) {
      let theme, gradient;
      if (!this.isBlock) {
        theme = color.value;
      } else {
        theme = "gradient";
        gradient = index * 50;
        // console.log(`Value of ${index} is ${gradient}`);
      }
      return `
        background-color: ${starlette.getColorAs(
          "color-bg",
          this.appName,
          theme,
          gradient || null
        )};
        border-color: ${
          color.active
            ? starlette.getColorAs(
                "color-selection",
                this.appName,
                theme,
                gradient || null
              )
            : starlette.getColorAs(
                "color-header-border",
                this.appName,
                theme,
                gradient || null
              )
        };
      `;
    },
    getMenuColor() {
      return `${starlette.getColorAs(
        "color-btn-pill-border",
        this.appName,
        this.newTheme || this.theme,
        this.newGradient || this.newGradient == 0
          ? this.newGradient
          : this.gradient || null
      )}`;
    }
  }
}
</script>

<style>
@import url(//fonts.googleapis.com/css?family=Open+Sans);
.panelify-wrapper {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: calc(100% - 21.5px);
}
.panelify-controller-button {
  width: 20px;
  height: 20px;
  border-width: 2px;
  border-style: solid;
  cursor: pointer;
}
.block-panel-bg {
  background-color: #fff;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.block-panel-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.block-panel-title {
  font-family: "Open Sans";
  font-size: 12px;
  user-select: none;
  cursor: default;
}
.block-panel-tab {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-style: solid;
  height: 100%;
}
.block-panel-menu {
  padding-left: 8px;
  padding-top: 6px;
  width: 14px;
}
.block-panel-header {
  align-items: center;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  box-sizing: border-box;
  height: 30px;
  border-style: solid;
}
.block-panel-content {
  box-sizing: border-box;
  height: calc(100% - 30px);
  width: 100%;
}
</style>
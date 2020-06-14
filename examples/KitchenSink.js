import Vue from "vue";
import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;
Vue.config.devtools = false;

import {
  Alert,
  Anno,
  ButtonGroup,
  Button,
  Col,
  ColorPicker,
  Divider,
  Dropdown,
  Dropzone,
  FileInput,
  FilePicker,
  Fold,
  Footer,
  Grid,
  Icon,
  InputScroll,
  Input,
  Link,
  Menus,
  PanelInfo,
  Panel,
  Panelify,
  Row,
  Tabs,
  TextArea,
  Toggle,
  Wrapper,
} from "brutalism";

Vue.component("Alert", Alert);
Vue.component("Anno", Anno);
Vue.component("Button-Group", ButtonGroup);
Vue.component("Button", Button);
Vue.component("Col", Col);
Vue.component("Divider", Divider);
Vue.component("Dropdown", Dropdown);
Vue.component("Dropzone", Dropzone);
Vue.component("File-Input", FileInput);
Vue.component("File-Picker", FilePicker);
Vue.component("Color-Picker", ColorPicker);
Vue.component("Fold", Fold);
Vue.component("Footer", Footer);
Vue.component("Grid", Grid);
Vue.component("Icon", Icon);
Vue.component("Input-Scroll", InputScroll);
Vue.component("Input", Input);
Vue.component("Link", Link);
Vue.component("Menus", Menus);
Vue.component("Panelify", Panel);
Vue.component("Panel-Info", PanelInfo);
Vue.component("Panel", Panel);
Vue.component("Row", Row);
Vue.component("Tabs", Tabs);
Vue.component("TextArea", TextArea);
Vue.component("Toggle", Toggle);
Vue.component("Wrapper", Wrapper);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

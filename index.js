const openExplorer = require("open-file-explorer");

const Alert = require("./components/Alert").default;
const Anno = require("./components/Anno").default;
const ButtonGroup = require("./components/Button-Group").default;
const Button = require("./components/Button").default;
const Col = require("./components/Col").default;
const ColorPicker = require("./components/Color-Picker").default;
const Divider = require("./components/Divider").default;
const Dropdown = require("./components/Dropdown").default;
const Dropzone = require("./components/Dropzone").default;
const FileInput = require("./components/File-Input").default;
const FilePicker = require("./components/File-Picker").default;
const Fold = require("./components/Fold").default;
const Footer = require("./components/Footer").default;
const Icon = require("./components/Icon").default;
const InputScroll = require("./components/Input-Scroll").default;
const Input = require("./components/Input").default;
const Grid = require("./components/Grid").default;
const Link = require("./components/Link").default;
const Menus = require("./components/Menus").default;
const Panelify = require("./components/Panelify").default;
const PanelInfo = require("./components/Panel-Info").default;
const Panel = require("./components/Panel").default;
const ProgressBar = require("./components/Progress-Bar").default;
const Row = require("./components/Row").default;
const Select = require("./components/Select").default;
const Tabs = require("./components/Tabs").default;
const TextArea = require("./components/TextArea").default;
const Toggle = require("./components/Toggle").default;
const Wrapper = require("./components/Wrapper").default;
const Watcher = require("./components/Watcher").default;
const Autofocus = require("./components/directiveAutofocus.js").default;
const FakeSpy = require("./utils/fakeSpy").default;
const WrapNode = require("./components/wrapNode.js").default;
const RotationControl = require("./components/Rotation-Control").default;
const SliderControl = require("./components/Slider-Control").default;

require("./assets/material_icon_font/css/materialdesignicons.css");
require("./assets/fonts.css");

import {
  openURL,
  copy,
  evalScript,
  saveDialog,
  openDialog,
  loadScript,
  rgbToHex,
  readDir,
  writeFile,
} from "cluecumber";
let Pan = require("vue-pan").default;
// import { spy } from 'cep-spy'
// import { starlette } from 'starlette'

// async function openPath(path) {
//   return new Promise((resolve, reject) => {
//     openExplorer(path, (err) => {
//       return err ? reject(err) : resolve(true);
//     });
//   });
// }

async function openPath(path) {
  return new Promise((resolve, reject) => {
    try {
      const attempt = require("child_process").exec(
        `start "" "${path.replace(/\\/gm, "/")}"`
      );
      resolve(true);
    } catch (err) {
      reject(false);
    }
  });
}

export {
  Alert,
  Anno,
  ButtonGroup,
  Button,
  Col,
  ColorPicker,
  FilePicker,
  copy,
  Divider,
  Dropdown,
  Dropzone,
  openURL,
  saveDialog,
  openDialog,
  openPath,
  loadScript,
  rgbToHex,
  readDir,
  writeFile,
  evalScript,
  FileInput,
  Fold,
  Footer,
  Icon,
  InputScroll,
  Input,
  Link,
  Grid,
  Menus,
  Panelify,
  PanelInfo,
  Panel,
  ProgressBar,
  RotationControl,
  Row,
  Select,
  SliderControl,
  Tabs,
  TextArea,
  Toggle,
  Wrapper,
  WrapNode,
  Autofocus,
  FakeSpy,
  Watcher,
  Pan,
};
// spy,
// starlette

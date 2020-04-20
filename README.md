# <a href="https://www.battleaxe.co/"><img src="https://avatars2.githubusercontent.com/u/60149336?s=200&v=4" width="40" height="40"/></a> brutalism

## [Battleaxe](https://www.battleaxe.co/)'s component library for Adobe CEP panels

---

-   [Demos](#demos)
-   [Installation](#installation)
-   [Getting Started](#getting-started)
-   [Components](#components)

---

## For every app, every theme, and every one

![](./assets/ILSTsample.png)
![](./assets/FLPRsample.png)
![](./assets/AEFTsample.png)

Make panels for After Effects, Illustrator, Photoshop, InDesign, Premiere Pro, Audition, Animate, InCopy, Prelude, Dreamweaver, Muse, Bridge and Rush like a pro even if you can't code like one.

Developing a panel for Adobe should be more about what your tool does, not just what your tool looks like. Brutalism is so quick you can make a panel in a few hours instead of a few months, and so flexible you can rely entirely on what it offers or take only the parts you need:

-   Blazing fast developer workflow lets you go from creating a panel to signing it as a ZXP in less than a minute.
-   Components are designed to simplify your project and keep your logic clean, allowing you to create entire panels in a single page with less than 30 lines of HTML and hardly any JS.
-   Host app themes, scrollbars, UI changes, and colors take care of themselves. You have access to over 40 colors specific to the current host and theme and you're free to let your own components and HTML blend in by using the corresponding CSS variables made available.
-   Script loading is dead simple and dynamic. You can easily use any number of scripts via the root `<Panel>` component's `script-path` and `utils` props, and you can keep them anywhere you want.
-   Context and flyout menus are handled via props in a `<Menus>` component; completely reactive, dynamic, and in standard JS -- not some ludicrous XML.
-   Typescript support for scripting is built in for supported apps, allowing you to see the application's DOM as you type code even if you have no idea how to use Typescript -- no need for dinosaur programs like ESTK or it's Object Model Viewer here.
-   Nearly all the hurdles and quirks of working with Adobe using with Vue, Webpack, and NodeJS taken care of for you and much more!

---

## Demos

-   [Browser compatible AEUX](https://hungry-goldstine-0c6a71.netlify.com/#/) - [Homepage](https://aeux.io)

---

## Installation

```bash
npm i brutalism
```

---

## Getting Started

### Within `./src/main.js` (to use anywhere in project with no need to import per component file):

```js
// Import the desired components
import { Panel, Menus } from "brutalism";

// Assign them as global components to the Vue instance
Vue.use("Panel", Panel);
Vue.use("Menus", Menus);

// Be sure to do so before instantiating Vue:
new Vue({
	router,
	render: h => h(App)
}).$mount("#app");
```

-   [Kitchen sink](./examples/KitchenSink.js) (all components and directives, no utility functions)
-   [Utilities only](./examples/Utilities.js)

### Within `App.vue` or a given .vue file:

```html
<script>
// Import as many or few components as you need
import { Panel, Menus } from 'brutalism';

export default {
  components: {
    Panel,
    Menus
  }
}
```

---

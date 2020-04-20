## Panel

Wrapper which handles dynamic script loading, host app UI theme and events, fitting content within, scrollbar styling, CSInterface and more. This component is best used as the direct child of `#app` or parent of a `<router-view>`. Includes [starlette](https://github.com/Inventsable/starlette), [CEP-Spy](https://github.com/Inventsable/cep-spy), and script running utilities.

> **NOTE:** This component requires having loaded CSInterface.js prior to mounting.

```html
<!-- In App.js or any router page -->
<div id="app">
  <Panel
    script-path="./host/[appName]/host.jsx"
    utils="./host/utils"
  >
    <!-- Content or router-view goes inside Panel as a slot -->
    <router-view />
  </Panel>
</div>
```

### Props

`script-path` STRING/ARRAY [optional] - _Path to script file(s) to load relative to extension root._
  - Defaults to bombino `./src/host/[appName]/host.jsx`.
  - Supports any `CEP-Spy` variable within square brackets. 
  - `script-path` will always be loaded after `utils` prop.

`utils` STRING/ARRAY [optional] - _Path to folder(s) to load relative to extension root before main script file._
  - Defaults to bombino `./src/host/universal`.
  - Evaluates all `.jsx`, `.js`, or `.flpr` files within unless the file matches contents of the `exclude` prop.

`exclude` STRING/ARRAY [optional] - _Any valid string or regex pattern to exclude from `script-path` or `utils` evaluation._

`no-utils` BOOLEAN [optional] - _Overrides `utils` evaluation_
 - Default `false`
 - Takes precedence over `utils` prop.

`app` STRING [optional] - _Manually initialize UI as a given app (ILST, AEFT, FLPR, etc). Only needed for Browser versions of panel._

`theme` STRING [optional] - _Manually initialize UI as a given theme and only needed for Browser versions of panel. Must be one of `light`, `lightest`, `dark`, or `darkest` for 4-tier themes, or `gradient` for AEFT and gradient apps._

`gradient` NUMBER [optional] - _Manually initialize UI as a given range within a gradient theme in Browser. Supports between 0 (darkest) and 100 (lightest) for any gradient theme app._

## Examples

No props works exactly as the Bombino setup does, but replaces all code inside App.js. Scripts are located in `./src/host/[appName]/host.jsx`, utilities are located in `./src/host/universal`, styles match host app:

```html
  <Panel>
    <router-view />
  </Panel>
```

Custom script paths can be easily given via the `script-path` prop to avoid placing production code inside the `./src/` directory or match personal preference:

```html
  <Panel script-path="./host/myScript.jsx">
    <router-view />
  </Panel>
```

script-path can be an Array, evaluating synchronously:

```html
  <Panel :script-path="[
        './host/myFirstScript.jsx', 
        './host/mySecondScript.jsx', 
        './host/myThirdScript.jsx'
      ]"
    >
    <router-view />
  </Panel>
```

Utilities can be a direct string or an Array of folder paths, in the event you need to evaluate multiple files before your panel's script is loaded:

```html
  <Panel :utils="[
        './shared/utils', 
        './shared/helpers', 
      ]"
    >
    <router-view />
  </Panel>
```
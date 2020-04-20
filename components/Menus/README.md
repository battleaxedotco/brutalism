## Menus

Invisible component which reactively handles context and flyout menus. Supports multiple instances and will rebuild as the most recently mounted instance (in the event you need different menus per router page or other use case). Any changes to the `:context` or `:flyout` Arrays will trigger a full rebuild of the menu in real-time.

```html
<!-- Anywhere inside your project -->
<Menus debug refresh
  :context="[
      {
        label: 'This is a disabled menu item',
        enabled: false
      },
      {
        label: 'Toggle value of this.data.something',
        checkable: true,
        checked: something,
        callback: (item, index, value) => (something = value)
      },
      {
        label: 'This activates a method within this file on clicking this item',
        enabled: true,
        callback: this.localMethod
      }
  ]"
/>
```

### Props

`refresh` BOOLEAN [optional] - _Adds a "Refresh Panel" option to both menus which triggers a `location.reload()` and complete refresh of extension._
  - Default `false`

`debug` BOOLEAN [optional] - _Adds a "Launch Localhost" option to both menus which launches the given app debug port._
  - Defaults to `false`.
  - Given the recent change with Chrome 80 not supporting external debugging, this may be better to copy to clipboard contents to paste into CEF client.

> NOTE: To include callbacks into `:context` or `:flyout` within the same file, you must use `this.callback` with `data: { return {} }` syntax, or `callback` with `data: () => ({})` syntax. Do not initialize functions ( e.g. use `this.callback` and not `this.callback()` ).

### Supported Menu params:

- `label` STRING (default `null`) - Text to appear on Menu item.
- `enabled` BOOLEAN (default `true`) - If `false`, Menu item is disabled.
- `checkable` BOOLEAN (default `false`) - If `false`, Menu item cannot be checked.
- `checked` BOOLEAN (default `false`) - If item is `checkable`, determines whether item is checked.
- `callback` FUNCTION (default `null`) - The method to call whenever this menu item is clicked, receiving `(item, index, value)` as arguments.
- `menu` ARRAY (default `null`) - Array containing menu to nest options within.
- `icon` STRING (default `null`) - _Context menu only_, the string relative to project root to the icon image. This overrides `checked` parameter, as the field must have either icon or check.

`context` ARRAY [optional] - _Contents of the context menu in JSON form._
  
  - Reactive, any changes will cause full rebuild of menu.
  - Supports infinite nesting of menus.

`flyout` ARRAY [optional] - _Contents of the flyout menu in JSON form._

  - Reactive, any changes will cause full rebuild of menu.
  - Supports infinite nesting of menus.


### Events

`@contextClick` - Triggered whenever any context menu item is clicked. Returns `(item, index, value)` to callback.

`@flyoutClick` - Triggered whenever any flyout menu item is clicked. Returns `(item, index, value)` to callback.

### Examples

Menus contain only `Launch Localhost` and `Reload Panel`:

```html
  <Menus refresh debug />
```

Menus contain reload and a custom context menu, passing an event to a local method each time the context menu is clicked. Note that `this.doSomething` is called for both menu items, though the last item will trigger `this.localMethod` after the `@contextClick` event.
```html
<Menus refresh
  @contextClick="this.doSomething"
  :context="[
      {
        label: 'This is a disabled menu item',
        enabled: false
      },
      {
        label: 'Toggle value of this.data.something',
        checkable: true,
        checked: something,
        callback: (item, index, value) => (something = value)
      },
      {
        label: 'This activates a method within this file on clicking this item',
        enabled: true,
        callback: this.localMethod
      }
  ]"
/>
```

Context menu contains a menu item with icon, then a divider, then a nested menu group:

```html
<Menus
  :context="[
    {
      label: 'Menu item has a custom icon',
      icon: './src/assets/MyMenuIcon.png'
    },
    { label: '---' },
    {
      label: 'Nested item',
      menu: [
        { label: 'Hello' },
        { label: 'Goodbye' }
      ]
    }
  ]"
/>
```

Redress flyout menu contents based on a property:

```html
<Menu 
  :flyout="showExtendedMenu ? extendedMenu : baseMenu"
/>
```

The above could be done much better with a computed property like so, which will automatically rebuild itself any time the property's value is changed:


```html
<Menu :flyout="flyoutMenu" />
```

```html
<script>
export default {
  data: () => ({
    showExtendedMenu: true,
    extendedMenu: [
      { label: 'Hello' },
      { label: 'World' }
    ],
    baseMenu: [
      { label: 'Hello World' }
    ]
  }),
  computed: {
    flyoutMenu() {
      return this.showExtendedMenu ? this.extendedMenu : this.baseMenu,
    },
  }
}
```
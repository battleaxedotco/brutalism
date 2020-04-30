<template>
	<div v-if="isBrowser" class="menu">
		<input tabindex="-1" v-model="localhost" class="menu-clipboard" ref="clipboard" type="text" >
	</div>
</template>

<script>
const spy = window.__adobe_cep__ ? require("cep-spy").default : { appName: 'ILST' };
import starlette from "starlette";

export default {
	name: "adobe-menus",
	props: {
		refresh: {
			// If true, append Refresh Panel option to flyout and context
			type: Boolean,
			default: false
		},
		debug: {
			// If true, append Launch Localhost option to flyout and context
			type: Boolean,
			default: false
		},
		gitUpdate: {
			// String in the form [profile]/[repo] for Github, as in "Inventsable/self-updater"
			type: String,
			default: ""
		},
		context: {
			type: Array,
			default: function() {
				return [];
			}
		},
		flyout: {
			type: Array,
			default: function() {
				return [];
			}
		}
	},
	data() {
		return {
			localhost: '',
			outdated: false,
			repo: null,
			webVersion: null,
			// this.app.menus.context
			realContext: {
				menu: []
			},
			// this.app.menus.flyout
			realFlyout: {
				menu: []
			},
			refreshItem: {
				id: "refresh",
				label: "Refresh panel",
				enabled: true,
				checkable: false,
				checked: false,
				callback: this.refreshPage
			},
			switchThemeItem: {
				id: "switchTheme",
				label: "Switch theme",
				enabled: true,
				checkable: false,
				checked: false,
				callback: this.switchTheme
			},
			debugItem: {
				id: "localhost",
				label: "Copy debug URL",
				enabled: true,
				checkable: false,
				checked: false,
				callback: this.launchDebug
			},
			updateItem: {
				id: "update",
				label: "Download newest version",
				enabled: true,
				checkable: false,
				checked: false,
				callback: this.downloadNewestZXP
			},
			noUpdateItem: {
				id: "noUpdate",
				label: "Panel is up to date",
				enabled: false,
				checkable: false,
				checked: false,
				callback: null
			}
		};
	},
	computed: {
		isBrowser() {
			return window.__adobe_cep__;
		},
		contextMenu() {
			return this.realContext.menu;
		},
		hasAutoParams() {
			return this.refresh || this.debug;
		},
		// Flyout menu converts to XML from reactive JSON in data() above
		flyoutMenu() {
			return this.buildFlyoutMenuInXML();
		}
	},
	watch: {
		// Any updates to menu will trigger CEP to reset it and callback events
		context(menu) {
			this.buildMenu("context");
		},
		flyout(menu) {
			this.buildMenu("flyout");
		}
	},
	async mounted() {
		if (window.__adobe_cep__) {
			if (this.gitUpdate) await this.checkGitForUpdate();
			await this.init();
		}
		this.localhost = spy.localhost;
	},
	methods: {
		buildMenu(type) {
			let menu = [];
			if (this[type.toLowerCase()].length) {
				this[type.toLowerCase()].forEach((item, i) => {
					let template = this.buildMenuItem(type, item, i, []);
					menu.push(template);
				});
			}
			if (this.hasAutoParams && this[type.toLowerCase()].length)
				menu.push({ label: "---" });
			if (this.refresh) menu.push(this.refreshItem);
			if (this.debug) menu.push(this.debugItem);
			if (this.gitUpdate.length)
				menu.push(this.outdated ? this.updateItem : this.noUpdateItem);
			if (spy.appName == "FLPR") {
				menu.push(this.switchThemeItem);
			}
			const capitalized = type.replace(/^\w/, c => c.toUpperCase());
			this[`real${capitalized}`].menu = menu;
			this[`set${capitalized}Menu`]();
		},
		buildMenuItem(type, item, i, chain) {
			let template;
			if (item.label !== "---") {
				template = {
					id: `${chain.length ? chain.join("-") + "-" : ""}${i}`,
					enabled: true,
					checkable: false,
					checked: false
				};
				Object.assign(template, item);
			} else template = item;
			if (item.menu && item.menu.length)
				item.menu.forEach((child, c) => {
					item.menu[c] = this.buildMenuItem(
						type,
						child,
						c,
						[].concat(chain, i)
					);
				});
			return template;
		},
		findMenuItem(type, id, list = []) {
			if (!list.length) list = this[`real${type}`].menu;
			let found = list.find(menuItem => {
				return menuItem.id == id;
			});
			if (!found) {
				list.forEach(item => {
					if (item.menu && item.menu.length)
						found = this.findMenuItem(type, id, item.menu);
				});
			}
			if (found) return found;
		},
		menuClicked() {
			let type = typeof arguments[0] === "string" ? "Context" : "Flyout";
			let id =
				type === "Context" ? arguments[0] : arguments[0].data.menuId;
			let target = this.findMenuItem(type, id);
			let realId = this.getRealId(id);

			if (target.checkable && target.enabled) {
				target.checked = !target.checked;
				if (/flyout/i.test(type)) this.buildMenu("flyout");
			}
			target.callback
				? target.callback(target, realId, target.checked)
				: this.$emit(
						`${type.toLowerCase()}Click`,
						target,
						realId,
						target.checked
				  );
		},
		getRealId(id) {
			return /-/.test(id)
				? id.split("-").map(item => {
						return Number(item);
				  })
				: !/\D/.test(id)
				? Number(id)
				: id;
		},
		buildFlyoutMenuItemInXML(item) {
			let str = ``;
			if (item.id) {
				str += `<MenuItem Id="${item.id}" Label="${
					item.label
				}" Enabled="${item.enabled ||
					"true"}" Checkable="${item.checkable ||
					"false"}" Checked="${item.checked || "false"}"`;
				if (item.menu && item.menu.length) {
					str += ">";
					item.menu.forEach(child => {
						str += this.buildFlyoutMenuItemInXML(child);
					});
					str += "</MenuItem>";
				} else str += "/>";
			} else str += `<MenuItem Label="---" />`;
			return str;
		},
		buildFlyoutMenuInXML() {
			let str = `<Menu>`;
			this.realFlyout.menu.forEach((item, i) => {
				str += this.buildFlyoutMenuItemInXML(item, i);
			});
			return (str += `</Menu>`);
		},
		setContextMenu() {
			if (window.__adobe_cep__)
				window.__adobe_cep__.invokeAsync(
					"setContextMenuByJSON",
					JSON.stringify(this.realContext),
					this.menuClicked
				);
		},
		setFlyoutMenu() {
			if (window.__adobe_cep__) {
				window.__adobe_cep__.invokeSync(
					"setPanelFlyoutMenu",
					this.flyoutMenu
				);
				window.__adobe_cep__.addEventListener(
					"com.adobe.csxs.events.flyoutMenuClicked",
					this.menuClicked
				);
			}
		},
		refreshPage() {
			location.reload();
		},
		launchDebug() {
			this.$refs.clipboard.select();
			document.execCommand("copy");
			this.$refs.clipboard.blur();
			console.log(`Copied to clipboard: ${this.localhost}`)
		},
		switchTheme() {
			starlette.switch();
		},
		async checkGitForUpdate() {
			if (this.gitUpdate.length) {
				this.outdated = this.compareVersions(
					JSON.parse(await this.grabRepoRaw(this.repo)).version
				);
				console.log(this.outdated);
			}
		},
		init() {
			if (window.__adobe_cep__) {
				this.buildMenu("context");
				this.buildMenu("flyout");
				window.__adobe_cep__.addEventListener(
					"com.adobe.csxs.events.flyoutMenuOpened",
					this.$emit("flyoutFocus")
				);
				window.__adobe_cep__.addEventListener(
					"com.adobe.csxs.events.flyoutMenuClosed",
					this.$emit("flyoutBlur")
				);
			}
		},
		// Fetch the raw text file from github (same as file accessed via Raw button)
		async grabRepoRaw() {
			let data = await fetch(
				`https://raw.githubusercontent.com/${this.gitUpdate}/master/package.json`
			).catch(err => {
				console.err(err);
			});
			return data.text();
		},
		// Take the x.x.x version of each, use split to turn them into arrays, and compare semantic sections
		compareVersions(newest) {
			this.webVersion = newest;
			let web = newest.split("."),
				offline = spy.extVersion.split("."),
				isOutdated = false;
			web.forEach((v, i) => {
				if (Number(web[i]) > Number(offline[i])) isOutdated = true;
			});
			return isOutdated;
		},
		// This currently opens the link in the default browser, then shuts off the tab once download is complete.
		// It would be much smoother to offer a direct download via link
		async downloadNewestZXP() {
			let target = `${spy.extName}_${this.webVersion}.zxp`;
			if (!window.__adobe_cep__) {
				spy.launchInNewTab(
					`https://github.com/${this.gitUpdate}/raw/master/archive/${target}`
				);
			} else {
				cep.util.openURLInDefaultBrowser(
					`https://github.com/${this.gitUpdate}/raw/master/archive/${target}`
				);
			}
		}
	}
};
</script>

<style scoped>
.menu {
	margin: 0;
}

.menu-clipboard {
	margin: 0;
	padding: 0;
	/* display: none; */
	position: absolute;
	top: -20px;
	width: 0px;
	height: 0px;
	
}
</style>

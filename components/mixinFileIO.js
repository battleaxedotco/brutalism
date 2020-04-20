const fs = require("fs");
const path = require("path");
const spy = window.__adobe_cep__
	? require("cep-spy").default
	: require("../utils/fakeSpy").default;

export default {
	methods: {
		removeRelativePrefix(thispath) {
			return /^\.\//.test(thispath)
				? `${spy.path.root}/${thispath.replace(/^\.\//, "")}`
				: thispath;
		},
		async readDirs(these) {
			let mapped = [];
			for (const item in these) mapped.push(await this.readDir(item));
			return mapped;
		},
		async readDir(thispath) {
			thispath = this.removeRelativePrefix(thispath);
			return new Promise((resolve, reject) => {
				fs.readdir(
					path.resolve(thispath),
					{ encoding: "utf-8" },
					(err, files) => {
						if (err) reject(err);
						resolve(files);
					}
				);
			});
		},
		exists(thispath) {
			return fs.existsSync(thispath);
		},
		isFolder(thispath) {
			return fs.lstatSync(thispath).isDirectory();
		},
		async readFiles(these) {
			let mapped = [];
			for (const item in these) mapped.push(await this.readFile(item));
			return mapped;
		},
		async readFile(thispath) {
			thispath = this.removeRelativePrefix(thispath);
			return new Promise((resolve, reject) => {
				fs.readFile(path.resolve(thispath), "utf-8", (err, files) => {
					if (err) reject(err);
					resolve(files);
				});
			});
		}
	}
};

#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

async function init() {
	const root = `${path.resolve("./")}/components/`;
	let components = await readDir(root);
	components = components.filter(entry => {
		return /\.vue$/.test(entry);
	});
	let directives = await readDir(root);
	directives = directives.filter(entry => {
		return /directive/.test(entry);
	});
	let indexStr = ``;
	let mainStr = `// Brutalism library support\r\nimport {`;
	components.forEach((component, i) => {
		let name = component.replace(/\.vue$/, "");
		indexStr += i > 0 ? `\r\n` : ``;
		indexStr += `const ${name.replace(
			/-/,
			""
		)} = require("./components/${name}.vue").default;`;
		mainStr += ` ${component.replace(/\.vue$/, "").replace(/-/, "")}${
			i < components.length - 1 || directives.length ? "," : ""
		}`;
	});
	directives.forEach((directive, i) => {
		let name = directive.replace(/\.js$/, "").replace("directive", "");
		indexStr += `\r\n`;
		indexStr += `const ${name.replace(
			/-/,
			""
		)} = require("./components/directive${name}.js").default;`;
		mainStr += ` ${directive
			.replace(/\.js$/, "")
			.replace(/-/, "")
			.replace("directive", "")}${i < directives.length - 1 ? "," : ""}`;
	});

	indexStr += `\r\n\r\nexport {`;
	mainStr += `} from '@/brutalism'\r\n// Once deployed the above will be imported from the npm package instead of a local file\r\n\r\n// Global component registration means that you'll never need to manually import or define a components:{} section within any component\r\n\r\n// Needed for mdi-icons\r\n\r\nrequire("./brutalism/node_modules/@mdi/font/css/materialdesignicons.css");\r\n\r\n`;
	components.forEach((component, i) => {
		let name = component.replace(/\.vue$/, "");
		indexStr += ` ${name.replace(/-/, "")}${
			i < components.length - 1 || directives.length ? "," : ""
		}`;
		mainStr += `\r\nVue.component("${name}", ${name.replace(/-/, "")});`;
	});
	directives.forEach((directive, i) => {
		let name = directive.replace(/\.js$/, "").replace("directive", "");
		indexStr += ` ${name.replace(/-/, "")}${
			i < directives.length - 1 ? "," : ""
		}`;
		mainStr += `\r\nVue.directive("${name
			.replace(/-/, "")
			.toLowerCase()}", ${name.replace(/-/, "")});`;
	});
	indexStr += ` }`;

	writeIndexString(indexStr);
	writeMainString(mainStr);
	console.log("\tUPDATED");
}
function writeIndexString(indexStr) {
	fs.writeFileSync(`${path.resolve("./")}/index.js`, indexStr);
}
function writeMainString(mainStr) {
	let data = fs.readFileSync(`${path.resolve("../")}/main.js`, "utf8");
	data = data.replace(
		/\/\/\sBrutalism\slibrary\ssupport(.|\s)*(?=new)/,
		mainStr + "\r\n\r\n"
	);
	fs.writeFileSync(`${path.resolve("../")}/main.js`, data);
}

async function readDir(thispath) {
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
}

init();

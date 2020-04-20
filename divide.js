#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

async function init() {
  const root = `${path.resolve("./")}/components/`;
  let components = await readDir(root);
  components = components.filter(entry => {
    return /\.vue$/.test(entry);
  });

  components.forEach(component => {
    let name = component.replace(/\.vue$/, '');
    let folderPath = `${root}/${name}`
    if (!exists(folderPath)) {
      fs.mkdirSync(folderPath);
      fs.renameSync(`${root}/${name}.vue`, `${root}/${name}/${name}.vue`)
      let indexText = `export default require('./${name}.vue').default`
      fs.writeFileSync(`${root}/${name}/index.js`, indexText);
      fs.writeFileSync(`${root}/${name}/README.md`, `# ${name}`);
    }

  })
  return false;
}

function exists(thispath) {
  return fs.existsSync(thispath);
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
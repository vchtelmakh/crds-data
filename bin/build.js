const rimraf = require('rimraf');
const glob = require('glob');
const mustache = require('mustache');
const fs = require('fs');

const dest = './dist';
const src = './src';

const customConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
this.config = Object.assign({ ...process.env }, customConfig);

rimraf.sync(dest);

glob(`${src}/**/*`, {}, (error, files) => {
  for (let file of files.filter(f => fs.lstatSync(f).isFile())) {
    const content = fs.readFileSync(file, 'utf8');
    const output = mustache.render(content, this.config);

    const ext = file.split('.').pop();
    if (ext.toLowerCase() === 'json') JSON.parse(output);

    const fileDest = file.replace(src, dest);
    fs.mkdirSync(fileDest.substr(0, fileDest.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(fileDest, output);
  }
});

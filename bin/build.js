const rimraf = require('rimraf');
const glob = require('glob');
const mustache = require('mustache');
const fs = require('fs');

const dest = './dist';
const src = './src';

/**
 * Merge config.json contents and current environment variables into one config
 * object.
 */
const customConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const config = Object.assign({ ...process.env }, customConfig);

/**
 * Clean destination directory.
 */
rimraf.sync(dest);

/**
 * Step through each of the source files, process, and build them.
 */
glob(`${src}/**/*`, {}, (error, files) => {
  for (let file of files.filter(f => fs.lstatSync(f).isFile())) {
    /**
     * Read the content and pass the config object through so those variables
     * can be translated.
     */
    const content = fs.readFileSync(file, 'utf8');
    const output = mustache.render(content, config);
    /**
     * If it's a JSON file, attempt to parse it, which will throw an error if
     * its invalid JSON.
     */
    const ext = file.split('.').pop();
    if (ext.toLowerCase() === 'json') JSON.parse(output);
    /**
     * Write the file to its destination, making sure the directory exists.
     */
    const fileDest = file.replace(src, dest);
    fs.mkdirSync(fileDest.substr(0, fileDest.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(fileDest, output);
  }
});

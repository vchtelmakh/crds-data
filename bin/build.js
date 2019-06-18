const contentful = require('contentful');
const escape = require('escape-html');
const fs = require('fs');
const glob = require('glob');
const mustache = require('mustache');
const rimraf = require('rimraf');

const cfAccessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const cfSpaceId = process.env.CONTENTFUL_SPACE_ID;
const dest = './dist';
const envMap = {
  int: 'int',
  demo: 'demo',
  prod: 'master'
};
const src = './src';

class BuildRunner {
  /**
   * Merge config.json contents and current environment variables into one config
   * object.
   */
  constructor() {
    this.config = Object.assign({ ...process.env }, { promos: {} });
  }

  /**
   * Retrieve content block from Contentful and inject into config object.
   */
  getContentBlocks() {
    /**
     * Loop through each environment in the envMap (top of file), and grab the
     * appropriate entry from Contentful. Then escape the content field and save
     * it to the promos config object.
     */
    const promises = Object.keys(envMap).map(env =>
      contentful
        .createClient({
          accessToken: cfAccessToken,
          environment: envMap[env],
          space: cfSpaceId
        })
        .getEntry(process.env[`PROMO_ID_${env.toUpperCase()}`])
        .then(entry => {
          const compressedContent = entry.fields.content.replace(/(\r\n|\n|\r)/gm, '');
          this.config.promos[env] = escape(compressedContent);
        })
        .catch(err => console.error(err))
    );
    /**
     * Returns a promise that waits for all the contentful promises to complete
     * prior to resolving.
     */
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => resolve())
        .catch(() => reject());
    });
  }

  /**
   * Clean destination directory.
   */
  clean() {
    rimraf.sync(dest);
  }

  /**
   * Step through each of the source files, process, and build them.
   */
  build() {
    const files = glob.sync(`${src}/**/*`).filter(f => fs.lstatSync(f).isFile());
    for (let file of files) {
      /**
       * Read the content and pass the config object through so those variables
       * can be translated.
       */
      const content = fs.readFileSync(file, 'utf8');
      const output = mustache.render(content, this.config);
      /**
       * If it's a JSON file, attempt to parse it, which will throw an error if
       * its invalid JSON.
       */
      const ext = file.split('.').pop();
      if (ext.toLowerCase() === 'json') {
        try {
          JSON.parse(output);
        } catch (error) {
          console.error(`Error in file: ${file}\n${error}`);
          process.exit(1);
        }
      }
      /**
       * Write the file to its destination, making sure the directory exists.
       */
      const fileDest = file.replace(src, dest);
      fs.mkdirSync(fileDest.substr(0, fileDest.lastIndexOf('/')), { recursive: true });
      fs.writeFileSync(fileDest, output);
    }
  }
}

const runner = new BuildRunner();

runner.getContentBlocks().then(() => {
  runner.clean();
  runner.build();
});

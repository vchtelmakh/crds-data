const { src, dest, task, watch } = require('gulp');

const plumber = require('gulp-plumber');

function copyJsonFiles(callback) {
  return src('src/**/*.json')
    .pipe(plumber())
    .pipe(dest('dist'))
}

function watchCopyJsonFiles(callback) {
  watch(['src/**/*.json'], copyJsonFiles);
}

task('watch', watchCopyJsonFiles)

exports.default = copyJsonFiles;

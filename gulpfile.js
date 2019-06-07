const { series, src, dest, task, watch } = require('gulp');

const clean = require('gulp-clean');
const plumber = require('gulp-plumber');

function cleanDist(callback) {
  return src('dist/*').pipe(clean());
}

function copyJsonFiles(callback) {
  return src('src/**/*.json')
    .pipe(plumber())
    .pipe(dest('dist'));
}

function watchCopyJsonFiles(callback) {
  watch(['src/**/*.json'], series(cleanDist, copyJsonFiles));
}

task('watch', watchCopyJsonFiles);
task('clean', cleanDist);

exports.default = series(cleanDist, copyJsonFiles);

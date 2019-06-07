const { series, src, dest, task, watch } = require('gulp');

const clean = require('gulp-clean');
const plumber = require('gulp-plumber');

function cleanDist(callback) {
  return src('dist/*').pipe(clean());
}

function copyFiles(callback) {
  return src('src/*')
    .pipe(plumber())
    .pipe(dest('dist'));
}

function watchCopyFiles(callback) {
  watch(['src/*'], series(cleanDist, copyFiles));
}

task('watch', watchCopyFiles);
task('clean', cleanDist);

exports.default = series(cleanDist, copyFiles);

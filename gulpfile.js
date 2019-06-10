const { series, src, dest, task, watch } = require('gulp');

const clean = require('gulp-clean');
const jsonlint = require('gulp-jsonlint');
const plumber = require('gulp-plumber');
const prettier = require('gulp-prettier');

function cleanDist(callback) {
  return src('dist/*').pipe(clean());
}

function copyFiles(callback) {
  return src('src/**/*.json')
    .pipe(prettier())
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError())
    .pipe(plumber())
    .pipe(dest('dist'));
}

function watchCopyFiles(callback) {
  watch(['src/**/*'], series(cleanDist, copyFiles));
}

task('default', series(cleanDist, copyFiles));
task('watch', watchCopyFiles);
task('clean', cleanDist);

exports.default = series(cleanDist, copyFiles);

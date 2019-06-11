const { series, src, dest, task, watch } = require('gulp');

const clean = require('gulp-clean');
const jsonlint = require('gulp-jsonlint');
const plumber = require('gulp-plumber');
const prettier = require('gulp-prettier');

function cleanDist(callback) {
  return src('dist/*').pipe(clean());
}

function lintFiles(callback) {
  return src('src/**/*.json')
    .pipe(prettier())
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError())
    .pipe(plumber())
}

function copyFiles(callback) {
  return src('src/**/*')
    .pipe(plumber())
    .pipe(dest('dist'));
}

function watchCopyFiles(callback) {
  watch(['src/**/*.json'], series(lintFiles));
  watch(['src/**/*'], series(cleanDist, copyFiles));
}

task('default', series(cleanDist, lintFiles, copyFiles));
task('watch', watchCopyFiles);
task('clean', cleanDist);

exports.default = series(cleanDist, lintFiles, copyFiles);

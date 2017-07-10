'use strict';

var gulp = require('gulp'),
    util = require('gulp-util'),
    browserify = require('gulp-browserify');

gulp.task('default', function() {
    return gulp.src('./src/index.js')
        .pipe(
            browserify({ debug: true })
                .on('error', util.log)
        )
        .pipe(gulp.dest('./build'));
});

gulp.task('sdd', function() {
    return gulp.src('./src/separate-drill-down.js')
        .pipe(
            browserify({ debug: true })
                .on('error', util.log)
        )
        .pipe(gulp.dest('./build'));
});

var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');
var path = require('path');

// client lib files
gulp.task('client-lib-files', function(cb) {
    gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
        .pipe(gulp.dest('client/lib/bootstrap/js'));
    gulp.src('node_modules/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('client/lib/bootstrap/fonts'));

    gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('client/lib/jquery'));


    cb(null);
});

// less css
var lessSrcFiles = ['client/style/*.less'];
gulp.task('less', function() {
    return gulp.src(lessSrcFiles)
        .pipe(plumber())
        .pipe(less({compress: true}))
        .pipe(autoprefixer('last 10 versions', 'ie 9'))
        .pipe(minifyCss())
        .pipe(gulp.dest('client/style'));
});

// Script files
var scriptSrcFiles = ['server/**/*.js'];
gulp.task('jshint', function() {
    return gulp.src(scriptSrcFiles)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Server
gulp.task('serve', ['client-lib-files'], function() {
    nodemon({
        script: 'server/app.js',
        ext: 'js',
        env: { 'NODE_ENV': 'development' },
        tasks: ['jshint', 'less']
    });
});

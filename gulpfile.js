var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');
var path = require('path');

// clean
gulp.task('clean', function(cb) {
    del.sync('dist/*');
    cb();
});

// client lib files
gulp.task('client-lib-files', function(cb) {
    gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
        .pipe(gulp.dest('dist/client/lib/bootstrap/js'));
    gulp.src('node_modules/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('dist/client/lib/bootstrap/fonts'));

    gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('dist/client/lib/jquery'));


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
        .pipe(gulp.dest('dist/client/style'))
        ;
});

// Script files
var scriptSrcFiles = ['server/**/*.js'];
gulp.task('server-scripts', function() {
    return gulp.src(scriptSrcFiles)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/server'));
});

var scriptTplFiles = ['server/views/**/*.jade'];
gulp.task('server-tpls', function() {
    return gulp.src(scriptTplFiles)
        .pipe(gulp.dest('dist/server/views'));
});

var scriptOtherFiles = ['server/**/*.json'];
gulp.task('server-other', function() {
    return gulp.src(scriptOtherFiles)
        .pipe(gulp.dest('dist/server'));
});

var migrationFiles = ['server/migrations/**/*.js'];
gulp.task('server-migrations', function() {
    return gulp.src(migrationFiles)
        .pipe(gulp.dest('dist/server/migrations'));
});


// Build
// build-clean used as dependency of 'serve' task
gulp.task('build-clean', ['clean'], function(cb) {
    cb(null);
});
gulp.task('build',
          [
              'client-lib-files',
              'less',
              'server-scripts',
              'server-tpls',
              'server-other',
              'server-migrations'
          ]
);

// Server
gulp.task('serve', ['build-clean', 'build'], function() {
    nodemon({
        script: 'dist/server/app.js',
        watch: 'dist'
    });

    gulp.watch(lessSrcFiles, ['less']);
    gulp.watch(scriptSrcFiles, ['server-scripts']);
    gulp.watch(scriptTplFiles, ['server-tpls']);
    gulp.watch(migrationFiles, ['server-migrations']);
});


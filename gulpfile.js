
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rigger = require('gulp-rigger'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    dev: {
        html: 'dev/**/*.html',
        js:{
            main: require('./dev/js/scripts.json'),
            libs: require('./dev/js/libs.json')
        },
        style: 'dev/styles/style.scss',
        img: 'dev/img/**/*.*',
        fonts: 'dev/fonts/**/*.*'
    },
    watch: {
        html: 'dev/**/*.html',
        js:{
            main: require('./dev/js/scripts.json'),
            libs: require('./dev/js/libs.json')
        },
        style: 'dev/styles/**/*.*',
        img: 'dev/img/**/*.*',
        fonts: 'dev/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "crash",
    notify: false,
    logSnippet: false,
    logConnections: false
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.dev.html) 
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js.main:build', function () {
    gulp.src(path.dev.js.main) 
        .pipe(sourcemaps.init()) 
        .pipe(concat('main.js'))
        .pipe(uglify().on('error', util.log))
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('js.libs:build', function () {
    gulp.src(path.dev.js.libs) 
        .pipe(sourcemaps.init()) 
        .pipe(concat('libs.js'))
        .pipe(uglify().on('error', util.log))
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.dev.style)
        .pipe(compass({
            sourcemap : true,
            sass: 'dev/styles',
            css: path.build.css,
            // style: 'compressed'
        }))
        .on('error', function(error) {
            this.emit('end');
        })
        .pipe(watch('build/css/**/*.css').on("change", reload));
});

gulp.task('image:build', function () {
    gulp.src(path.dev.img) 
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
});

gulp.task('fonts:build', function() {
    gulp.src(path.dev.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js.main:build',
    'js.libs:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch(path.watch.js.main, function(event, cb) {
        gulp.start('js.main:build');
    });
    watch(path.watch.js.libs, function(event, cb) {
        gulp.start('js.libs:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);
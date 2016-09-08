var gulp = require('gulp'),
    connect = require("gulp-connect"),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    rollup = require('gulp-rollup'),
    sass = require("gulp-sass"),
    runSequence = require('run-sequence'),
    pkg = require("./package.json"),
    rename = require('gulp-rename'),
    babel = require('rollup-plugin-babel');

gulp.task('rollup', function () {
    gulp.src('./src/app/main.js')
        .pipe(sourcemaps.init())
        .pipe(rollup({
            sourceMap: true,
            allowRealFiles: true,
            plugins: [babel({
                exclude: 'node_modules/**'
            })],
            format: 'umd',
            dest: './dist/gulp-pipeline.es6.js',
            entry: './src/app/main.js',
            moduleName: "Customizr"
        }))
        .pipe(sourcemaps.write())
        .pipe(rename(pkg.name + '.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task("clean", function () {
    return del(["./dist", "./demo"]);
});

gulp.task("sass", function () {
    return gulp.src("./src/scss/main.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(rename(pkg.name + '.css'))
        .pipe(gulp.dest("./dist"));
});

gulp.task("sass-demo", function () {
    return gulp.src("./src/scss/demo.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(rename(pkg.name + '-demo.css'))
        .pipe(gulp.dest("./demo"));
});

gulp.task("watch", function () {
  gulp.watch("./src/app/*.js", function () {
      runSequence("build", "copy-dist");
  });
  gulp.watch("./src/scss/*.scss", function () {
      runSequence(["sass", "sass-demo"], "copy-dist");
  });
  gulp.watch("./src/html/*.html", ["copy-html"]);
  gulp.watch("./src/images/*.*", ["copy-images"]);
});

gulp.task("connect", function () {
    connect.server({
        root: ["./demo"],
        port: 5152,
        livereload: true
    });
});

gulp.task("copy-html", function () {
    return gulp.src([
        "./src/html/**/*.html"
    ])
    .pipe(gulp.dest("./demo"));
});

gulp.task("copy-images", function () {
    return gulp.src([
        "./src/images/**/*.*"
    ])
    .pipe(gulp.dest("./demo/images"));
});

gulp.task("copy-dist", function () {
    gulp.src([
        "./dist/*.*"
    ]).pipe(gulp.dest("./demo"));
});

gulp.task("copy-vendor", function () {
    gulp.src([
        "./node_modules/jquery/dist/jquery.min.*"
    ])
    .pipe(gulp.dest("./demo/vendor"))
});

gulp.task("copy", [
    "copy-dist",
    "copy-html",
    "copy-images",
    "copy-vendor"
]);

gulp.task("demo", function (callback) {
    console.log("Running demo task!");
    runSequence("clean", "build", "copy", "sass-demo", ["watch", "connect"]);
});

gulp.task("build", ["rollup", "sass"]);

gulp.task("default", ["build"]);


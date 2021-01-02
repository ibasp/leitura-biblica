const autoprefixer = require("gulp-autoprefixer"),
    babel = require("gulp-babel"),
    browserSync = require("browser-sync").create(),
    concat = require("gulp-concat"),
    csso = require("gulp-csso"),
    del = require("del"),
    gulp = require("gulp"),
    htmlmin = require("gulp-htmlmin"),
    imagemin = require("gulp-imagemin"),
    jsonminify = require("gulp-jsonminify"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    workboxBuild = require("workbox-build");

function html() {
    return gulp
        .src(["./index.html"])
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                removeComments: true,
            })
        )
        .pipe(gulp.dest("./build"));
}

function css() {
    return gulp
        .src("./scss/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(concat("styles.css"))
        .pipe(csso())
        .pipe(gulp.dest("./build/css"))
        .pipe(browserSync.stream());
}

function js() {
    return gulp
        .src("./js/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat("main.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./build/js"));
}

function sw() {
    return workboxBuild.generateSW({
        globDirectory: "build",
        globPatterns: ["**/*.{html,css,js,png,jpg,json,otf,gif,map}"],
        swDest: "build/sw.js"
    });
}

function json() {
    return gulp
        .src([
            "./**/*.json",
            "!./package.json",
            "!./package-lock.json",
            "!./node_modules/**/*"
        ])
        .pipe(jsonminify())
        .pipe(gulp.dest("./build"));
}

function img() {
    return gulp
        .src("./img/*")
        .pipe(
            imagemin(
                [
                    imagemin.jpegtran({ progressive: true }),
                    imagemin.optipng({ optimizationLevel: 5 }),
                ],
                { verbose: true }
            )
        )
        .pipe(gulp.dest("./build/img"));
}

function move_imgs() {
    return gulp.src("./img/*").pipe(gulp.dest("./build/img"));
}

function fonts() {
    return gulp.src("./fonts/*").pipe(gulp.dest("./build/fonts"));
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build",
        },
    });

    gulp.watch("./index.html", html).on("change", browserSync.reload);
    gulp.watch("./scss/**/*.scss", css);
    gulp.watch("./js/**/*.js", js).on("change", browserSync.reload);
}

function clean() {
    return del(["build"]);
}

function axios() {
    return gulp
        .src([
            "./node_modules/axios/dist/axios.min.js",
            "./node_modules/axios/dist/axios.min.map",
        ])
        .pipe(gulp.dest("./build/js"));
}

exports.axios = axios;
exports.css = css;
exports.html = html;
exports.js = js;
exports.json = json;
exports.sw = sw;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;
exports.build = gulp.series(clean, html, css, axios, js, move_imgs, fonts, json, sw);
exports.default = gulp.series(clean, html, css, axios, js, move_imgs, fonts, json, sw, watch);
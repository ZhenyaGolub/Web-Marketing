const { src, dest, watch, parallel, series } = require('gulp');

const browserSync = require('browser-sync').create();

const gulpSass = require('gulp-sass');
const gulpConcat = require('gulp-concat');
const gulpUglify = require('gulp-uglify-es').default;
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpImagemin = require('gulp-imagemin');
const gulpHTMLMin = require('gulp-htmlmin');
const gulpPug = require('gulp-pug');
const del = require('del');
const data = require('./src/data.json');

const cleanDist = () => {
    return del('dist')
}

const browsersync = () => {
    browserSync.init({
        server: {
            baseDir: "src/"
        }
    });
}

const images = () => {
    return src(['./src/images/**/*'])
        .pipe(gulpImagemin([
            gulpImagemin.gifsicle({interlaced: true}),
            gulpImagemin.mozjpeg({quality: 75, progressive: true}),
            gulpImagemin.optipng({optimizationLevel: 5}),
            gulpImagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

const createJSFile = () => {
    return src(['./src/js/main.js'])
        .pipe(gulpConcat('main.min.js'))
        .pipe(gulpUglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream())
}

const createCssFile = () => {
    return src('./src/scss/main.scss')
        .pipe(gulpSass({outputStyle: 'compressed'}))
        .pipe(gulpConcat('style.min.css'))
        .pipe(gulpAutoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream())
}

const watching = () => {
    watch(['./src/scss/**/*.scss'], createCssFile);
    watch(['./src/js/main.js'], createJSFile);
    watch(['./src/*.html']).on('change', browserSync.reload);
    watch(['./src/pug/**/*.pug'], compilationPug);
}

const build = () => {
    return src([
        './src/css/style.min.css',
         './src/js/main.min.js',
          './src/fonts/**/*',
          './src/index.html'
        ], { base: 'src' })
        .pipe(dest('dist'))
}

const minifyHTML = () => {
    return src(['./dist/index.html'])
        .pipe(gulpHTMLMin({ collapseWhitespace: true }))
        .pipe(dest('dist'))
}

const compilationPug = () => {
    return src('./src/pug/**/*.pug')
            .pipe(gulpPug({
                pretty: true,
                locals: data
            }))
            .pipe(dest('src'))
}

exports.createCssFile = createCssFile;
exports.watching = watching;
exports.browsersync = browsersync;
exports.cleanDist = cleanDist;
exports.compilationPug = compilationPug;
exports.build = series(cleanDist, images, build, minifyHTML);
exports.images = images;
exports.start = parallel(createCssFile ,createJSFile, browsersync, watching);
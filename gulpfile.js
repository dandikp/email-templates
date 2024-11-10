const browserSync = require('browser-sync')
const { src, dest, watch, series, parallel } = require('gulp')
const fileInclude = require('gulp-file-include')
const newer = require('gulp-newer')
const del = require('del')

const paths = {
    src: './src/',
    dist: './dist/',
    srcAssets: './src/assets/',
    distAssets: './dist/assets/',
}

const clean = (callback) => {
    del([paths.dist], callback())
}

const html = () => {
    const srcPath = paths.src + '/'
    const output = paths.dist

    return src([srcPath + '*.html', srcPath + '*.png'])
        .pipe(
            fileInclude({
                prefix: '@@',
                basepath: '@file',
                indent: true,
            })
        )
        .pipe(dest(output))
}

const images = () => {
    const output = paths.distAssets + 'images'
    return src(paths.srcAssets + 'images/**/*')
        .pipe(newer(output))
        .pipe(dest(output))
}

const initBrowserSync = (callback) => {
    const startPath = '/index.html'

    browserSync.init({
        startPath,
        server: {
            baseDir: paths.dist,
            middleware: [
                function (req, res, next) {
                    req.method = 'GET'
                    next()
                },
            ],
        },
    })

    callback()
}

const reloadBrowserSync = (callback) => {
    browserSync.reload()
    callback()
}

const watchFiles = () => {
    watch(paths.src + '*.html', series([html], reloadBrowserSync))
    watch(paths.src + 'assets/images/**/*', series([images], reloadBrowserSync))
}

exports.default = series(html, images, parallel(watchFiles, initBrowserSync))
exports.clean = series(clean)
exports.build = series(clean, html, images)

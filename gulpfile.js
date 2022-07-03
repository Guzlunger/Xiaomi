const { src, dest, parallel, watch, series } = require('gulp')

const scss = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename')
const buildFolder = 'build'
const srcFolder = 'src'
const uglify = require('gulp-uglify-es').default
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const pugs = require('gulp-pug')



const styles = () => {
  return src(`${srcFolder}/scss/*.scss`)
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 8 version'],
      grid: true
    }))
    .pipe(dest(`${srcFolder}/css/`))
    .pipe(browserSync.stream());
}
const delBuild = () => {
  return del(`${buildFolder}`)
}

const build = () => {
  return src([
    `${srcFolder}/css/*.css`,
    `${srcFolder}/js/*.js`, 
    `${srcFolder}/**/*.html`,
    `${srcFolder}/img/*`  
  ], {base: `${srcFolder}`})
  .pipe(dest(`${buildFolder}`))
}

const images = () => {
  return src(`./${srcFolder}/img/**/*`)
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))
  .pipe(dest(`./${srcFolder}/img/`))
}

const watcher = () => {
  watch(`${srcFolder}/**/*.scss`, styles)
  watch(`./**/*.html`).on('change', browserSync.reload)
  watch(`${srcFolder}/**/*.pug`).on('change', pug, browserSync.reload)
}

const browserSyncJob= ()=> {
  browserSync.init({
    server: {
      baseDir: `./`
  }
  });
};

const pug = () => {
  return src(`./${srcFolder}/**/*.pug`)
  .pipe(pugs({
    pretty: true
  }))
  .pipe(dest(`./${srcFolder}`))
  .pipe(browserSync.stream())
}

exports.watcher = watcher
exports.images = images
exports.pug = pug
exports.build = series(delBuild, images, build)
exports.delBuild = delBuild
exports.server= browserSyncJob;
exports.default = parallel(styles, watcher, this.server)
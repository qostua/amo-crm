const SOURCE_PATH = './src';
const APP_PATH = './app';
const PROD_PATH = './prod';

const Paths = {
  Source: {
    HTML: SOURCE_PATH + '/index.html',
    SCSS: SOURCE_PATH + '/scss/main.scss',
    JS: SOURCE_PATH + '/js/main.js',
    IMG: SOURCE_PATH + '/**/*.{jpg,png}',
    SVG: SOURCE_PATH + '/img/*.svg',
    SPRITE: SOURCE_PATH + '/img/sprite/*.svg',
    ICONS: SOURCE_PATH + '/favicons/*.*',
  },
  App: {
    HTML: APP_PATH + '/',
    CSS: APP_PATH + '/css',
    JS: APP_PATH + '/js',
    IMG: APP_PATH + '/',
    SVG: APP_PATH + '/img',
    SPRITE: APP_PATH + '/img/sprite',
    ICONS: APP_PATH + '/favicons',
  },
  Prod: {
    HTML: PROD_PATH + '/',
    CSS: PROD_PATH + '/css',
    JS: PROD_PATH + '/js',
    IMG: PROD_PATH + '/',
    SVG: PROD_PATH + '/img',
    SPRITE: PROD_PATH + '/img/sprite',
    ICONS: PROD_PATH + '/favicons',
  }
}

import gulp from 'gulp';
import htmlMin from 'gulp-htmlmin';
import sync from 'browser-sync';
import { createProxyMiddleware }  from 'http-proxy-middleware';
import {deleteAsync} from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import cssRemoveComments from 'postcss-discard-comments';
import sourcemaps from 'gulp-sourcemaps';
import webpackStream from 'webpack-stream';
import replace from 'gulp-replace';
import rename from 'gulp-rename';
import webpackDevConfig from './webpack.development.config.js';
import webpackProdConfig from './webpack.production.config.js';

const sass = gulpSass(dartSass);

export const html = () => {
  return gulp.src(Paths.Source.HTML)
    .pipe(gulp.dest(Paths.App.HTML, {base: './src/'}));
};

export const css = () => {
  return gulp.src(Paths.Source.SCSS)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer,
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(Paths.App.CSS))
    .pipe(sync.stream());
};

export const js = () => {
  return gulp.src(Paths.Source.JS)
    .pipe(webpackStream(webpackDevConfig))
    .pipe(gulp.dest(Paths.App.JS));
};

export const clean = () => {
  return deleteAsync(APP_PATH);
};

export const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "app",
    },
    middleware: [
      createProxyMiddleware({
        pathFilter: '/api',
        target: 'https://qostua.amocrm.ru',
        changeOrigin: true,
      })
    ]
  });
};

export const watch = () => {
  gulp.watch('./src/index.html', html);
  gulp.watch('./src/scss/**/*.scss', css);
  gulp.watch('./src/js/**/*.js', js);

  gulp.watch('app/**/*', (cb) => {
    sync.reload();
    cb();
  });
};

export default gulp.series(
  clean,
  gulp.parallel(
    html,
    css,
    js
  ),
  gulp.parallel(
    watch,
    server,
  ),
);

export const htmlProd = () => {
  return gulp.src(Paths.Source.HTML)
    .pipe(replace(
      /(<link rel="stylesheet" href=".*?)(.css">)/g,
      '$1.min$2'
    ))
    .pipe(htmlMin({
      removeComments: true,
      collapseWhitespace: true,
    }))
    .pipe(gulp.dest(Paths.Prod.HTML, {base: './src/'}))
}

export const cssProd = () => {
  return gulp.src(Paths.Source.SCSS)
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([
      csso,
      autoprefixer,
      cssRemoveComments({removeAll: true})
    ]))
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest(Paths.Prod.CSS))
};

export const jsProd = () => {
  return gulp.src(Paths.Source.JS)
    .pipe(webpackStream(webpackProdConfig))
    .pipe(replace(
      'http://localhost:3000/api/v4',
      'https://amo-crm.free.beeceptor.com/api/v4'
    ))
    .pipe(gulp.dest(Paths.Prod.JS));
};

export const cleanProd = () => {
  return deleteAsync(PROD_PATH);
};

export const prod = gulp.series(
  cleanProd,
  gulp.parallel(
    htmlProd,
    cssProd,
    jsProd,
  )
);

export const serverProd = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: 'prod'
    }
  });
};

'use strict';
const path = require('path'),
	gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync').create(),
	wait = require('gulp-wait2'),
	prettify = require('gulp-prettify'),
	sourcemaps = require('gulp-sourcemaps'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	nunjucksRender = require('gulp-nunjucks-render'),
	gulpImports = require('gulp-imports'),
	minify = require('gulp-minify'),
	image = require('gulp-image');

const paths = {};
paths.jssrc = './src/js/';
paths.imgrc = './src/images/';
paths.fonticonSrc = './src/fonticon/';
paths.templates = './src/templates/';
paths.scssSrc = './src/scss/';
paths.svgFontSrc = './src/fonticon';
paths.build = './dist/';
paths.assets = `${paths.build}/assets`;

const tplHtmlPath = path.join(paths.templates, 'pages/*.html');

// Static server
gulp.task('server', () => {
	browserSync.init({
		server: {
			baseDir: path.join(__dirname, paths.build)
		}
	});
	gulp.watch(path.join(paths.scssSrc, '**/*.scss'), ['sass']);
	gulp.watch(path.join(paths.templates, '**/*.html'), ['renderHTML']).on('change', browserSync.reload);
	gulp.watch(path.join(paths.jssrc, '**/*.js'), ['importJs']).on('change', browserSync.reload);
	gulp.watch(path.join(paths.imgrc, '**/*'), ['image']).on('change', browserSync.reload);
});

gulp.task('renderHTML', () => {
	gulp.src(tplHtmlPath)
		.pipe(nunjucksRender({
			path: [path.join(paths.templates, 'templates')] // String or Array
		}))
		.pipe(prettify({
			indent_inner_html: true
		}))
		.pipe(gulp.dest(path.join(paths.build)));
})

//scss/sass
gulp.task('sass', () => {
	gulp
		.src(path.join(paths.scssSrc, '*.scss'))
		.pipe(wait(200))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest(path.join(paths.assets, 'css')))
		.pipe(browserSync.stream())
});


//svg to icon font
gulp.task('iconfont', () => {
	let runTimestamp = Math.round(Date.now() / 1000);

	gulp.src(path.join(paths.svgFontSrc, '*.svg'))
		.pipe(iconfontCss({
			fontName: 'fonticon',
			path: path.join(paths.fonticonSrc, '_icons.temp.scss'),
			targetPath: path.join(__dirname, '/src/scss/_icons.scss'),
			fontPath: '../fonts/'
		}))
		.pipe(iconfont({
			fontName: 'fonticon',
			normalize: true,
			fontHeight: 1001,
			prependUnicode: true, // recommended option
			formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
			timestamp: runTimestamp, // recommended to get consistent builds when watching files
		}))
		.on('glyphs', function (glyphs, options) {
			console.log(glyphs, options);
		})
		.pipe(gulp.dest(path.join(paths.assets, 'fonts')));
})


gulp.task('importJs', () => {
	gulp.src(path.join(paths.jssrc, 'app.js'))
		.pipe(sourcemaps.init())
		.pipe(gulpImports())
		.pipe(minify())
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest(path.join(paths.assets, 'js')));
});

gulp.task('image', function () {
	gulp.src(path.join(paths.imgrc, '*'))
		.pipe(image({
			pngquant: true,
			optipng: false,
			zopflipng: true,
			jpegRecompress: false,
			mozjpeg: true,
			guetzli: false,
			gifsicle: true,
			svgo: true,
			concurrent: 10,
			quiet: true // defaults to false
		}))
		.pipe(gulp.dest(path.join(paths.assets, 'images')));
});

gulp.task('default', ['renderHTML', 'sass', 'iconfont', 'importJs', 'image', 'server']);
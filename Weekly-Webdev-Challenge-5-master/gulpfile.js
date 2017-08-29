var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var syntaxScss = require('postcss-scss');
var postcssReporter = require('postcss-reporter');
var stylelint = require('stylelint');
var browserSync = require('browser-sync').create();
var util = require('gulp-util');

var sassOptions = {
	includePaths: [
		'assets/scss'
	],
	errLogToConsole: true,
	outputStyle: 'compressed',
	imagePath: 'assets/img',
	precision: 2
};

var dirEnv = util.env.production ? 'dist' : 'assets';

var stylelintProcessors = [
	// rules and options in .stylelintrc file ...
	// more info: http://stylelint.io/user-guide/rules/
	stylelint(),
	postcssReporter({
		clearMessages: true
	})
];
var processors = [
	autoprefixer({ browsers: ['last 3 versions', 'ie >= 10', 'and_chr >= 4.0'] })
];
gulp.task('sass',['buildSass']);

gulp.task('lintSass', function () {
	return gulp.src(['assets/scss/**/*.scss'])
	.pipe(plumber())
	.pipe(postcss(stylelintProcessors, { syntax: syntaxScss }))
});

gulp.task('buildSass', function() {
	return gulp.src('assets/scss/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(sourcemaps.write('./sourcemaps'))
		.pipe(gulp.dest(dirEnv + '/css'))
		.pipe(browserSync.stream());
});

// only for dev env
gulp.task('browser-sync', function() {
    browserSync.init({
        browser: 'chrome',
        // injectChanges: false,
		// files: [
		// 	'./**/*.html',
		// 	'./assets/css/main.css',
		// 	'./assets/css/**/*.map'
		// ],
		watchOptions: { ignored: ['node_modules'] },
		server: { baseDir: './' }
    });

	gulp.watch('./**/*.html').on('change', browserSync.reload);
});

gulp.task('copy', function () {
	return gulp.src('node_modules/jquery/dist/jquery.min.js')
		.pipe(gulp.dest('assets/js/lib/'));
});

// useful for build server
// we don't want watchers in that case
gulp.task('build', ['buildSass', 'copy']);

gulp.task('default', ['sass', 'browser-sync', 'copy'], function() {
	gulp.watch(['assets/scss/**/*.scss'], ['sass']);
});
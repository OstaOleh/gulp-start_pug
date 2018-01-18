var gulp = require('gulp'),
	gutil = require('gulp-util'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	fs = require('fs'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	bourbon = require('node-bourbon'),
	ftp = require('vinyl-ftp'),
	notify = require("gulp-notify");

// Scripts
gulp.task('scripts', function() {
	return gulp.src([
		// 'node_modules/jquery/dist/jquery.min.js',
		'app/main/js/common.js', // last line
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/main/js'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

gulp.task('pug', function() {
	return gulp.src('app/pug/pages/*.pug')
	.pipe(pug({
		locals : {
			nav: JSON.parse(fs.readFileSync('app/data/navigation.json', 'utf8')),
			content: JSON.parse(fs.readFileSync('app/data/content.json', 'utf8')),
		},
		pretty: true
	}))
	.pipe(gulp.dest('app'))
});



gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function() {
	return gulp.src([
		'app/main/sass/**/*.sass'
		])
	.pipe(sass({
		includePaths: [bourbon.includePaths,
			// ['node_modules/owl.carousel/dist/assets'],
		]
		}).on("error", notify.onError()))
	.pipe(rename({
		suffix: '.min',
		prefix: ''
	}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS())
	.pipe(gulp.dest('app/main/css'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

gulp.task('watch', ['pug','sass', 'scripts', 'browser-sync'], function() {
	gulp.watch('app/pug/**/*.pug', ['pug']);
	gulp.watch('app/main/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/main/js/common.js'], ['scripts']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/main/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/main/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'scripts'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/main/css/main.min.css',
		]).pipe(gulp.dest('dist/main/css'));

	var buildJs = gulp.src([
		'app/main/js/scripts.min.js',
		]).pipe(gulp.dest('dist/main/js'));

	var buildFonts = gulp.src([
		'app/main/fonts/**/*',
		]).pipe(gulp.dest('dist/main/fonts'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host: 'hostname.com',
		user: 'username',
		password: 'userpassword',
		parallel: 10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {
		buffer: false
	})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() {
	return del.sync('dist');
});
gulp.task('clearcache', function() {
	return cache.clearAll();
});

gulp.task('default', ['watch']);
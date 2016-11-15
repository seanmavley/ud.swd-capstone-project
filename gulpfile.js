var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del'); // rm -rf
var cleanCSS = require('gulp-clean-css');
var browser = require('browser-sync').create();
var historyApiFallback = require('connect-history-api-fallback');

var port = process.env.SERVER_PORT || 3000;

var jsFiles = [
  'app/app.js',
  'app/app.routing.js',
  'app/components/**/*.js',
  'app/services/**/*.js',
  'app/assets/scripts/**/*.js',
  '!app/assets/scripts/ga.js',
]

var cssFiles = [
  'app/assets/**/*.css'
]

gulp.task('clean', function() {
  return del(['app/build']);
});

// TODO:
// Concat and Uglify all codemirror js

gulp.task('scripts', ['clean'], function() {
  var stream = gulp.src(jsFiles)
    .pipe(concat('codeside.js'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('codeside.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/build'));
  return stream;
});

// Minify css to at least ie8 compatibility
gulp.task('stylesheets', function() {
  var stream = gulp.src(cssFiles)
    .pipe(concat('code.css'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('code.min.css'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('app/build'));
  return stream;
})

// templates and styles will be processed in parallel.
// clean will be guaranteed to complete before either start.
// clean will not be run twice, even though it is called as a dependency twice.

gulp.task('serve', ['scripts', 'stylesheets'], function() {
  browser.init({
    server: 'app/',
    port: port,
    middleware: [historyApiFallback()]
  });
  // watch and rebuild Scripts
  gulp.watch(jsFiles, ['scripts'])
    .on('change', browser.reload);

  // watch and rebuild Stylesheets
  gulp.watch(cssFiles, ['stylesheets'])
    .on('change', browser.reload);

  // Reload when html changes
  gulp.watch('app/**/*.html')
    .on('change', browser.reload);
});

gulp.task('default', ['serve']);

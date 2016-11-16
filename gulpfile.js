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

var codemirrorFiles = [
  'app/vendor/codemirror/mode/javascript/javascript.js',
  'app/vendor/codemirror/mode/python/python.js',
  'app/vendor/codemirror/mode/clike/clike.js',
  'app/vendor/codemirror/mode/php/php.js',
  'app/vendor/codemirror/mode/css/css.js',
  'app/vendor/codemirror/mode/xml/xml.js',
  'app/vendor/codemirror/mode/htmlmixed/htmlmixed.js',
  'app/vendor/codemirror/mode/htmlembedded/htmlembedded.js'
]

var vendorFiles = [
  'app/vendor/jquery/dist/jquery.min.js',
  'app/vendor/angular/angular.js',
  'app/vendor/firebase/firebase.js',
  'app/vendor/angular-ui-router/release/angular-ui-router.min.js',
  'app/vendor/angularfire/dist/angularfire.min.js',
  'app/vendor/codemirror/lib/codemirror.js',
  'app/vendor/angular-ui-codemirror/ui-codemirror.js',
  'app/vendor/angular-ui-router-title/angular-ui-router-title.js',
  'app/vendor/ngMeta/dist/ngMeta.min.js',
  'app/vendor/ngprogress/build/ngprogress.min.js',
  'app/vendor/toastr/toastr.min.js',
  'app/vendor/offline/offline.min.js',
  'app/vendor/bootstrap/dist/js/bootstrap.min.js'
]

var cssFiles = [
  'app/assets/**/*.css'
]

// refers to my build files to
// to delete
var toDelete = [
  'app/build/codeside.*',
]

// deletes all files beginning with codeside
gulp.task('clean', function() {
  return del(toDelete);
});

// concats and minifys all codemirror vendor files
gulp.task('codemirror', function() {
  var stream = gulp.src(codemirrorFiles)
    .pipe(concat('allcodemirror.js'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('allcodemirror.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/build'))
  return stream;
})

gulp.task('vendor', function() {
  var stream = gulp.src(vendorFiles)
    .pipe(concat('allvendor.js'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('allvendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/build'))
  return stream;
})

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
    .pipe(concat('codeside.css'))
    .pipe(gulp.dest('app/build'))
    .pipe(rename('codeside.min.css'))
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
  gulp.watch(jsFiles, ['scripts', 'stylesheets'])
    .on('change', browser.reload);

  // watch and rebuild Stylesheets
  gulp.watch(cssFiles, ['stylesheets'])
    .on('change', browser.reload);

  // Reload when html changes
  gulp.watch('app/**/*.html')
    .on('change', browser.reload);
});

gulp.task('default', ['serve']);

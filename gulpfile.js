var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static Server + watching scss/html files
gulp.task('serve', function() {

    browserSync.init({
        server: "app/",
    });

    // gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("*.*").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
// gulp.task('sass', function() {
//     return gulp.src("app/scss/*.scss")
//         .pipe(sass())
//         .pipe(gulp.dest("app/css"))
//         .pipe(browserSync.stream());
// });

gulp.task('default', ['serve']);
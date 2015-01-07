var gulp      = require('gulp');
var rename      = require('gulp-rename');
var webserver = require('gulp-webserver');
var sass      = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');


var server = {
  host: 'localhost',
  port: '8001'
}

gulp.task('sass', function () {
  gulp.src( 'css/*.scss' )
  .pipe(sass())
  .pipe(minifyCSS())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest( 'css' ));
});


gulp.task('webserver', function() {
  gulp.src( '.' )
  .pipe(webserver({
    host:             server.host,
    port:             server.port,
    livereload:       true,
    directoryListing: false
  }));
});

gulp.task('watch', function(){
  gulp.watch('css/*.scss', ['sass']);
});

gulp.task('default', ['sass','webserver','watch']);

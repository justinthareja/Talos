import gulp from 'gulp';
import babel from 'gulp-babel';
import watch from 'gulp-watch';
import plumber from 'gulp-plumber';
import gutil from 'gulp-util';

var paths = { 
  scripts: ['src/**/*.js','spec/**/*.js']
}

gulp.task('babel', () => {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(babel())
    .on('error', (err) => {
      gutil.log(gutil.colors.red('Error transpiling to ES5'), err.stack);
    })
    .pipe(gulp.dest(['dist', 'dist/spec']));
});

gulp.task('watch', () => {
  gulp.watch(paths.scripts, ['babel']);
})
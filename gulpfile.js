const gulp = require('gulp');
const sass = require('gulp-sass');
const uglifycss = require('gulp-uglifycss');

const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

let stylesPathSource = './sass/styles.scss';
let destPath = './dist/';
let styleWatch = './sass/**/*.scss';
let htmlToWatch = '**/*.html';

//SASS task to convert into css file...
gulp.task('styles',function(){
    return gulp.src(stylesPathSource)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .on('error', console.error.bind(console))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destPath));
});

//Define run task 
const run = gulp.parallel(['styles']);
run.description = 'Process styles';

//Define gulp task default as run
gulp.task('default', run);

// watch default
const watch = gulp.series('default', function(){ 
    gulp.watch(styleWatch, gulp.parallel('styles'));
});
watch.description = 'watch all changes in every files and folders';
gulp.task('watch', watch);
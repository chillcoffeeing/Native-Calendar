import gulp from "gulp";
import ts from "gulp-typescript";
import autoprefixer from "gulp-autoprefixer";
import postcss from "gulp-postcss";
import imagemin from "gulp-imagemin";

const project = ts.createProject("tsconfig.json");

gulp.task("compiler", () => {
  return project.src().pipe(project()).js.pipe(gulp.dest("dist"));
});

gulp.task("dts", () => {
  return project.src().pipe(project()).dts.pipe(gulp.dest("dist/@types"));
});

gulp.task("style", () => {
  return gulp
    .src("src/**/*.css")
    .pipe(postcss([autoprefixer]))
    .pipe(gulp.dest("dist"));
});

gulp.task("default", () => {
  gulp.watch("./src/**/*.ts", gulp.series("compiler", "dts"));
  gulp.watch("./src/**/*.css", gulp.series("style"));
  gulp.watch("./src/**/*.css", gulp.series("style"));

  return gulp
    .src("src/assets/images/*")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/assets/images"));
});

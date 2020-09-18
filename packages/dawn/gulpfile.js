const {series, parallel, watch, src, dest} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const fs = require('fs');

// postcss plugins
const easyimport = require('postcss-easy-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function serve(done) {
    livereload.listen();
    done();
}

function handleError(done) {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs', 'members/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        src('assets/css/screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src([
            'assets/js/lib/*.js',
            'assets/js/main.js'
        ], {sourcemaps: true}),
        concat('main.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function lint(done) {
    pump([
        src(['assets/css/**/*.css', '!assets/css/vendor/*']),
        gulpStylelint({
            fix: true,
            reporters: [
                {formatter: 'string', console: true}
            ]
        }),
        dest('assets/css/')
    ], handleError(done));
}

const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs', 'members/**/*.hbs'], hbs);
const cssWatcher = () => watch('assets/css/**/*.css', css);
const watcher = parallel(hbsWatcher, cssWatcher);
const build = series(css, js);

exports.build = build;
exports.lint = lint;
exports.default = series(build, serve, watcher);
import { spawn } from 'child_process'

import { task, src, dest, series, watch } from 'gulp'
import rimraf from 'rimraf'
import gulpEslint from 'gulp-eslint'
import gulpBabel from 'gulp-babel'
import { log, colors } from 'gulp-util'

const distDir = 'dist'
const appSources = [ `${__dirname}/src/**/*.js`, '!**/__tests__/**/*', __filename ]
const testSources = [ `${__dirname}/src/__tests__/**/*` ]

const makeLintTaskFn = (displayName, sources, eslintConfig, { failAfterError, ...options }) => {
  const lintTask = () => {
    const lintStream = src(
        sources
      ).pipe(
        gulpEslint(eslintConfig, options)
      )
      .pipe(gulpEslint.format())
    if (failAfterError) {
      return lintStream.pipe(gulpEslint.failAfterError())
    }
    return lintStream
  }
  lintTask.displayName = displayName
  return lintTask
}

function test(...mochaArgs) {
  return spawn('node_modules/.bin/mocha', [
    '--compilers',
    'js:babel-register',
    '--recursive',
    '--require',
    'src/__tests__/init.js',
    'src/**/*-test.js',
    ...mochaArgs,
  ], { stdio: 'inherit' })
}

const lintApp = options => makeLintTaskFn(
  'lint-sources', appSources, `${__dirname}/.eslintrc.yml`, options
)
const lintTests = options => makeLintTaskFn(
  'lint-tests', testSources, `${__dirname}/.eslintrc.test.yml`, options
)

task('build', series(
  function clean(done) {
    return rimraf(`${distDir}/**/*`, done)
  },
  lintApp({ failAfterError: true }),
  lintTests({ failAfterError: true }),
  function testWithExit(done) {
    test().on('close', exitCode => {
      if (exitCode) {
        log(colors.red('Tests failed.'))
        process.exit(1)
      }
    })
    done()
  },
  function compile() {
    return src(
      appSources.concat([ `!${__dirname}/gulpfile.babel.js`, '!__tests__' ])
    )
      .pipe(
        gulpBabel({
          presets: [ 'es2015', 'stage-0' ],
        })
      ).pipe(dest(distDir))
  },
))

// continuous tests and linting
// of source files; no compilation
task('dev', done => {
  const lintAppWatch = lintApp({ fix: true, failAfterError: false })
  const lintTestsWatch = lintTests({ fix: true, failAfterError: false })
  test('--watch')
  lintAppWatch()
  lintTestsWatch()
  watch(
    [ `${__dirname}/src/**/*.js`, `${__dirname}/gulpfile.babel.js` ],
    series(
      lintAppWatch,
      lintTestsWatch,
    )
  )
  log(colors.green('Watching for changes...'))
  done()
})

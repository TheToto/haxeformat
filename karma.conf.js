process.env.CHROME_BIN = require("puppeteer").executablePath();
process.env.FIREFOX_BIN = require("puppeteer-firefox").executablePath();

module.exports = function (config) {
	config.set({
		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Firefox', 'Chrome', 'Safari'],
		// browsers: ["ChromeHeadless"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,

		// mime: {
		//  	'text/x-typescript': ['ts', 'tsx']
		// },

		frameworks: ["jasmine", "karma-typescript"],

		files: [
			// "tests/browser/**/*.browser.test.ts",
			"tests/node/**/*.test.ts",
			'src/**/*.ts',
			"tests/packet/**/*.ts"
		],

		preprocessors: {
			"**/*.ts": ["karma-typescript"]
		},

		//reporters: ["dots", "karma-typescript"],
		reporters: ['progress', 'karma-typescript'],
		// reporters: ["spec", 'karma-typescript'],

		plugins: [
			// 'karma-jasmine-html-reporter',
			// 'karma-spec-reporter',
			'karma-chrome-launcher',
			'karma-jasmine',
			// 'karma-coverage',
			// 'karma-phantomjs-launcher',
			// 'karma-webpack',
			'karma-typescript'
		],

		// webpack: webpackConfig,

		// webpackMiddleware: {
		// 	noInfo: true
		// }
	});
};
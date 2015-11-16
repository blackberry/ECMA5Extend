/* Copyright 2013 BlackBerry Limited
 * @author: Isaac Gordezky
 * @author: Anzor Bashkhaz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */'use strict';

var seed = Math.round(Math.random() * 100) * 10;
var OPEN_PORT = 9043 + seed;
var LIVERELOAD_PORT = 35729 + seed;

var watchOptions = function(index) {
    return {
        livereload : {
            port : LIVERELOAD_PORT + (index || 0) * 1000
        }
    };
};

module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load only required grunt tasks as tasks are run
    require('jit-grunt')(grunt, {
        jscs : 'grunt-jscs-checker',
        mochacov : 'grunt-mocha-cov',
        mochaAppium : 'grunt-mocha-appium'
    });

    // configurable paths
    var configPaths = {
        docs : 'docs/output',
        tests : './'
    };

    // Project configuration.
    grunt.initConfig({

        // Before generating any new files, remove any previously-created files.
        clean : ['artifact/*', '!artifact/.gitignore', 'test/browserified_*.js', 'tmp/'],

        browserify : {
            tests : {
                files : {
                    'test/browserified_mocha_unit_tests.js' : 'test/spec/**.js',
                },
                options : {
                    alias : ['./src/ecma5-extend.js:ecma5-extend'],
                    browserifyOptions : {
                        debug : true // Embed source map for tests
                    },
                }
            }
        },
        jsdoc : {
            src : ['src/**/*.js', './README.md'],
            options : {
                destination : "docs",
                configure : "jsdoc.conf.json"
            }
        },
        jscs : {
            src : ['!Gruntfile.js', 'src/**/*.js', 'test/**/*.js', '!test/browserified_*.js'],
            options : {
                config : ".jscsrc",
                reporter : "jscs-reporter.js"
            }
        },

        jshint : {
            dev : {
                options : {
                    jshintrc : '.jshintrc',
                    reporter : require('jshint-stylish')
                },
                // There is only one * on the test/* folder because we don't want to
                // pick up the browserified test files, only the raw source ones.
                src : ['src/**/*.js', 'test/**/*.js', '!test/browserified_*.js']
            },
            ci : {
                options : {
                    jshintrc : '.jshintrc',
                    // reporter : require('jshint-jenkins-checkstyle-reporter'),
                    reporterOutput : 'artifact/report-jshint-checkstyle.xml'
                },
                src : ['src/**/*.js', 'test/*/**/*.js']
            }
        },

        nsp: {
            'package': grunt.file.readJSON('package.json')
        },

        open : {
            unit : {
                path : 'http://0.0.0.0:<%= connect.tdd.options.port %>/test/unit-tests.html'
            },
            jsdoc : {
                path : 'http://0.0.0.0:<%= connect.jsdoc.options.port %>/docs/index.html'
            }
        },

        connect : {
            options : {
                // change this to '0.0.0.0' to access the server from outside
                hostname : '0.0.0.0'
            },
            tdd : {
                options : {
                    livereload: LIVERELOAD_PORT + 1000
                }
            },
            jsdoc : {
                options : {
                    livereload: LIVERELOAD_PORT + 2000
                }
            }
        },

        watch : {
            tdd : {
                options : watchOptions(0),
                files : ['src/**/*.js', 'test/*/*.js'],
                tasks : ['complexity', 'browserify:tests']
            },
            jsdoc : {
                options : watchOptions(1),
                files : ['src/**/*.js', 'README.md'],
                tasks : ['jsdoc']
            }
        },

        complexity : {
            generic : {
                src : ['src/**/*.js'],
                options : {
                    breakOnErrors : false,
                    errorsOnly : false,
                    cyclomatic : [17, 20, 25], // or optionally a single value, like 3
                    halstead : [35, 40, 45], // or optionally a single value, like 8
                    maintainability : 100,
                    hideComplexFunctions : false,
                    checkstyleXML : 'artifact/report-complexity-checkstyle.xml',
                }
            }
        },

        karma : {
            options : {
                configFile : 'karma.conf.js',
                runnerPort : 9999,
            },
            desktop : {
                browsers : ['Chrome', 'Firefox'],
                logLevel : 'INFO',
                coverageReporter : {
                    type : 'html',
                    dir : 'artifact/'
                }
            },
            bb10 : {
                browsers : ['bb10'],
                logLevel : 'INFO',
                reporters : ['dots']
            },
            full : {
                browsers : ['Chrome', 'Firefox', 'bb10'],
                logLevel : 'INFO',
                coverageReporter : {
                    type : 'html',
                    dir : 'artifact/'
                }
            },
            custom : {
                browsers : [],
                logLevel : 'INFO',
                singleRun : false,
                coverageReporter : {
                    type : 'html',
                    dir : 'artifact/'
                }
            },
            sanity : {
                browsers : ['Chrome'],
                logLevel : 'WARN',
                reporters : ['dots']
                /*singleRun: false,*/
            }
        },
        mochaAppium : {
            options : {
                // Mocha options
                reporter : 'spec',
                timeout : 30e3,
                // Toggles wd's promises API, default:false
                usePromises : false,
                // Path to appium executable, default:'appium'
                appiumPath : 'appium'
            },
            android : {
                src : ['test/*.js'],
                options : {
                    // Appium Options
                    device : 'Android',
                    platform : 'Linux',
                    version : '4.2',
                    // A url of a zip file containg your .app package
                    // or
                    // A local absolute path to your simulator-compiled .app directory
                    // app : 'http://appium.s3.amazonaws.com/TestApp6.0.app.zip'
                }
            }
        },

        githooks : {
            all : {
                // Will run the jscs and jshint
                'pre-commit' : 'validate:ci browserify:tests karma:sanity',
            }
        }
    });

    grunt.registerTask('launchBrowser:bb10', 'Launches the BB10 browser', function() {
        var done = this.async();
        var deviceParams = {
            'launchApp' : '169.254.0.1',
            'package-name' : 'sys.browser',
            'package-id' : 'gYABgJYFHAzbeFMPCCpYWBtHAm0',
            'password' : process.env.BBPASSWORD || 'qwerty'
        };

        var cmd = '';
        for (var j in deviceParams) {
            cmd += ' -' + j + ' ' + deviceParams[j];
        }

        require('child_process').exec('blackberry-deploy ' + cmd, function(err) {
            setTimeout(function() {
                done();
            }, 2000);
            if (err) {
                if (!err.killed) {
                    grunt.fail.fatal(err.toString());
                } else {
                    grunt.fail.fatal("task was killed");
                }
            }
        });
    });

    grunt.registerTask('launchBrowser', ['launchBrowser:bb10']);

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('validate', ['jscs', 'jshint:dev', 'complexity', 'nsp']);
    grunt.registerTask('validate:ci', ['jscs', 'jshint:ci', 'complexity']);
    grunt.registerTask('docs', ['jsdoc']);
    grunt.registerTask('watch:docs', ['jsdoc', 'connect:jsdoc', 'open:jsdoc', 'watch:jsdoc'])

    grunt.registerTask('tdd', ['browserify:tests', 'connect:tdd', 'open:unit', 'watch:tdd']);
    grunt.registerTask('test', ['clean', 'browserify:tests', 'karma:desktop']);
    grunt.registerTask('test:bb10', ['clean', 'browserify:tests', 'launchBrowser:bb10', 'karma:bb10']);

    grunt.registerTask('ci', ['clean', 'validate:ci', 'browserify:tests', 'launchBrowser', 'karma:full']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['validate', 'test']);

};

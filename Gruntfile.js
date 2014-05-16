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

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
    port : LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load only required grunt tasks as tasks are run
    require('jit-grunt')(grunt, {
        jscs : 'grunt-jscs-checker',
        mochacov : 'grunt-mocha-cov'
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
            options : {
                alias : ['src/ecma5-extend.js:ecma5-extend'],
                debug : true
                /*watch : true,
                 keepAlive : true*/
            },
            dist : {
                files : {
                    "tmp/compiled.js" : ["test/browser.js"]
                }
            },
            tests : {
                files : {
                    'test/browserified_mocha_unit_tests.js' : 'test/spec/**.js',
                },
                options : {
                    external : ['src/lib/ecma5-extend:ecma5-extend'],
                    /*transform: ['node-underscorify'],*/
                    bundleOptions : {
                        debug : true // Embed source map for tests
                    },
                    /*postBundleCB: function(err, src, cb) {
                     var through = require('through');
                     var stream = through().pause().queue(src).end();
                     var buffer = '';
                     stream.pipe(require('mold-source-map').transformSourcesRelativeTo(__dirname)).pipe(through(function(chunk) {
                     buffer += chunk.toString();
                     }, function() {
                     cb(err, buffer);
                     }));
                     stream.resume();
                     }*/
                }
            }
        },

        jsdoc : {
            dist : {
                src : ["src/ecma5-extend.js"],
                options : {
                    destination : "docs",
                    private : false
                }
            }
        },

        jscs : {
            src : ['!Gruntfile.js', 'src/**/*.js', '!test/*/*.js', '!src/lib/ecma5-extend.js'],
            options : {
                config : ".jscsrc",
            }
        },

        jshint : {
            all : ["Gruntfile.js", "src/*.js"],
            options : {
                jshintrc : ".jshintrc",
            },
        },

        open : {
            unit : {
                path : 'http://localhost:<%= connect.options.port %>/test/unit-tests.html'
            }
        },

        connect : {
            options : {
                port : 9002,
                // change this to '0.0.0.0' to access the server from outside
                hostname : 'localhost'
            },
            tdd : {
                options : {
                    middleware : function(connect) {
                        return [lrSnippet, mountFolder(connect, configPaths.tests)];
                    }
                }
            }
        },

        watch : {
            tdd : {
                options : {
                    livereload : LIVERELOAD_PORT
                },
                files : ['src/**/*.js', '!src/style/*.js', 'src/**/*.html', 'src/**/*.less', 'test/*/*.js'],
                tasks : ['complexity', 'browserify:tests']
            }
        },

        complexity : {
            generic : {
                src : ['src/*.js'],
                options : {
                    breakOnErrors : false,
                    errorsOnly : false,
                    cyclomatic : [16, 20, 25], // or optionally a single value, like 3
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
            unit : {
                browsers : ['Chrome', 'Firefox'],
                logLevel : 'INFO',
                /*singleRun: false,*/
                coverageReporter : {
                    type : 'html',
                    dir : 'artifact/'
                }
            }
        }
    });

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('validate', ['jshint', 'jscs', 'complexity']);
    grunt.registerTask('browser-test', ['browserify:dist']);
    grunt.registerTask('docs', ['jsdoc']);

    grunt.registerTask('tdd', ['browserify:tests', 'connect:tdd', 'open:unit', 'watch:tdd']);
    grunt.registerTask('test', ['clean', 'browserify:tests', 'karma:unit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['validate', 'test']);

};

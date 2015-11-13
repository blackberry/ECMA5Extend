/* Copyright (C) 2014 BlackBerry Limited. Proprietary and confidential. */
module.exports = function(config) {

    // Returns the IP address of the host machine. This is required so the
    // remote devices can connect back to the server hosted on the host and
    // launch the tests.
    function getLocalIP() {
        if (process.env.HOST_IP) {
            return process.env.HOST_IP;
        }
        var interfaces = require('os').networkInterfaces();
        for (var i in interfaces) {
            var arr = interfaces[i];
            for (var j in arr) {
                var transport = arr[j];
                if (transport.family === 'IPv4' && transport.internal !== true) {
                    return transport.address;
                }
            }
        }
        throw new Error('Unable to find local IP address!');
    }

    // Connected device should be in development mode and have the
    // Selenium WebDriver enabled.
    var webdriverConfig = {
        hostname : '169.254.0.1',
        port : 1338,
        pathname : ''
    };

    config.set({
        basePath : '.',
        frameworks : ['mocha', 'chai', 'sinon', 'telemetry'],
        files : ['test/browserified_*.js'],
        exclude : [],
        plugins : ['karma-chrome-launcher', 'karma-firefox-launcher', 'karma-webdriver-launcher', 'karma-mocha', 'karma-chai', 'karma-sinon', 'karma-junit-reporter', 'karma-telemetry', 'karma-coverage'],
        customLaunchers : {
            bb10 : {
                config : webdriverConfig,
                base : 'WebDriver',
                browserName : 'BB10 Browser',
                platform : 'BB10',
                name : 'Karma'
            },
            ChromePerformance : {
                base : 'Chrome',
                flags : ['--disable-popup-blocking', '--enable-gpu-benchmarking', '--enable-threaded-compositing']
            },
        },
        reporters : ['dots', 'junit', 'coverage'],
        hostname : getLocalIP(),
        port : 9999,
        colors : true,
        logLevel : config.LOG_INFO,
        autoWatch : false,
        captureTimeout : 15000,
        singleRun : true,
        junitReporter : {
            outputDir: 'artifact',
            outputFile : 'report-junit.xml'
        },
        preprocessors : {
            // Generates code coverage for the browserified tests.
            // TODO: It'd be nice to run things on the un-browserified
            // versions of things as code-coverage would make more sense
            // without the bundled libraries, but we need a replacement for 'require'
            'test/browserified_mocha_*.js' : ['coverage']
        }
        // `coverageReporter` should be defined in the Gruntfile on a per-task basis.
        // `browsers` should be defined in the Gruntfile on a per-task basis.
    });
};

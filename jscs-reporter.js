/* Copyright (C) 2014 BlackBerry Limited. Proprietary and confidential. */
var util = require('util');
var colors = require('colors');
/**
 * @param {Errors[]} errorsCollection
 */
module.exports = function(errorsCollection) {

    var currentFile;
    var colorize = true;

    errorsCollection.forEach(function(errors) {
        if (errors.isEmpty())
            return;

        var file = errors.getFilename();
        if (file != currentFile) {
            console.log( colorize ? colors.bold(file) : file);
            //console.log(errors.explainError(error, true).split("\n"));
        }

        errors.getErrorList().forEach(function(error) {
            //var errorMsg = errors.explainError(error, true).split("\n");
            //console.log(errorMsg[0] + "\n" + errorMsg[3] + "\n" + errorMsg[4]);
            console.log(explainError(errors, error, colorize));
        });
        console.log();
    });
};

function explainError(errors, error, colorize) {
    var lineNumber = error.line - 1;
    var lines = errors._file.getLines();

    var msg = [];
    msg.push( '  ' + ( colorize ? colors.green(error.message) : error.message) + ":");
    msg.push(renderLine(lineNumber, lines[lineNumber], error.column, colorize));

    return msg.join("\n");
};

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderLine(n, line, column, colorize) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, '    ');
    if (column === line.length)
        column -= 1;
    line = line.substr(0, column) + colors.inverse(colors.grey(line.substr(column, 1))) + line.substr(column + 1);

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return '  ' + ( colorize ? colors.grey(lineNumber) : lineNumber) + line;
}

/**
 * Renders pointer:
 * ---------------^
 *
 * @param {Number} column
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderPointer(column, colorize) {
    var res = (new Array(column + 9)).join('-') + '^';
    return colorize ? colors.grey(res) : res;
}
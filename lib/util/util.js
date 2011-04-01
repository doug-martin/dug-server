var dojo = require("node-dojo");

/*taken from connect
 https://github.com/senchalabs/Connect
 (The MIT License)

 Copyright (c) 2010 Sencha Inc.

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 'Software'), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

exports.buildUrlRegexp = function(url) {
    var keys = [];
    url = url
            .concat('/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
        keys.push(key);
        slash = slash || '';
        return ''
                + (optional ? '' : slash)
                + '(?:'
                + (optional ? slash : '')
                + (format || '') + (capture || '([^/.]+)') + ')'
                + (optional || '');
    })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.+)');
    return {path : '^' + url + '$', keys : keys};
};

exports.isEmpty = function(object) {
    if (object) {
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                return false;
            }
        }
    }
    return true;
}

exports.createArrayFromString = function(testStr, delim) {
    if (testStr.indexOf(delim) > 0) return testStr.replace(/\s+/g, "").split(delim);
    else return [testStr];
}

exports.hitchArgs = function(scope, f, pre) {
    return function() {
        // arrayify arguments
        var args = dojo._toArray(arguments);
        // locate our method
        // invoke with collected args
        return f && f.apply(scope, pre.concat(args)); // mixed
    } // Function
};
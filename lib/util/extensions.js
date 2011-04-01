var dojo = require("node-dojo"),
        queryString = require('querystring'),
        http = require("http");


// ---------------------------------------
// Enhancing the HTTP Lib for cookies.
// ---------------------------------------

// summary:
// - Adds getCookie method to the httpRequest object.
// - Adds setCookie and clearCookie methods to the httpResponse object.
// acknowledgements:
// Code based on http://github.com/jed/cookie-node/blob/master/cookie-node.js

function pad(len, str, padder) {
    var padder = padder || "0";
    while (str.length < len) {
        str = padder + str;
    }
    return str;
}

dojo.extend(http.IncomingMessage, {

    _parseCookies : function() {
        var cookies = {};
        var hCookies = this.headers.cookie;
        if (hCookies) {
            hCookies.split(';').forEach(function(cookie) {
                var key = cookie.substring(0, cookie.indexOf("="));
                var val = queryString.unescape(cookie.substring(cookie.indexOf("=") + 1));
                key = key.replace(/^\s+/, '').replace(/\s+$/, '');
                val = val.replace(/^\s+/, '').replace(/\s+$/, '');
                var parts = val.split("&");
                var c = {};
                if (parts.length > 1) {
                    for (var i = 0; i < parts.length; i++) {
                        var KV = parts[i].split("=");
                        var k = KV[0].replace(/^\s\s\*/, '').replace(/\s\s*$/, '').replace('"', ''),
                                v = KV[1].replace(/^\s\s\*/, '').replace(/\s\s*$/, '').replace('"', '');
                        if (v) {
                            c[ k ] = v;
                        } else {
                            c = k;
                        }
                    }
                } else {
                    c = val;
                }
                cookies[key] = c;
            });
        }
        return (this.cookies = cookies);
    },

    getCookie : function(name) {
        if(!this.cookies)
        {
            this._parseCookies();
        }
        return name ? this.cookies[name] || null : this.cookies;
    }
});

var _writeHeader = http.ServerResponse.prototype.writeHead;
dojo.extend(http.ServerResponse, {
    // summary:
    // The getCookie method.
    setCookie : function(name, value, options) {
        var cookie = name + "=" + value + ";";

        this.cookies = this.cookies || [];

        options = options || {};

        if (options.expires) {
            var d = new Date(options.expires);
            var wdy = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
            var mon = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

            cookie += ('expires=' + wdy[d.getUTCDay()] + ', ' + pad(2, d.getUTCDate()) + '-' + mon[d.getUTCMonth()] + '-' + d.getUTCFullYear() + ' ' + pad(2, d.getUTCHours()) + ':'
                    + pad(2, d.getUTCMinutes()) + ':' + pad(2, d.getUTCSeconds()) + ' GMT;');
        }
        if (options.path) {
            cookie += " path=" + options.path + ";";
        }
        if (options.domain) {
            cookie += " domain=" + options.domain + ";";
        }
        if (options.secure) {
            cookie += "; secure";
        }
        if (options.httpOnly) {
            cookie += "; httpOnly";
        }
        this.cookies.push(cookie);
    },

    clearCookie : function(name) {
        this.setCookie(name, "", {expires : new Date(+new Date - 30 * 24 * 60 * 60 * 1000)});
    },

    simpleText : function(code, body) {
        var args = Array.prototype.slice.call(arguments, 0);
        if(args.length == 1){
            body = code;
            code = 200;
        }
        this.writeHead(code, {
            "Content-Type" : "text/plain",
            "Content-Length" : body.length
        });
        this.end(body);
    },

    simpleJSON : function(code, obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        if(args.length == 1){
            body = code;
            code = 200;
        }
        var body = JSON.stringify(obj);
        this.writeHead(code, {
            "Content-Type" : "text/json",
            "Content-Length" : body.length
        });
        this.end(body);
    },

    simpleHTML : function(code, body) {
        var args = Array.prototype.slice.call(arguments, 1);
        if(args.length == 1){
            body = code;
            code = 200;
        }
        this.writeHead(code, {
            "Content-Type" : "text/html",
            "Content-Length" : body.length
        });
        this.end(body);
    },

    image : function(code, body, mime){
        var args = Array.prototype.slice.call(arguments, 1);
        if(args.length == 2){
            body = code;
            code = 200;
        }
        this.writeHead(code, {
            'Content-Type': mime,
            'Content-Length': body.length
        });
        this.end(body);
    },

    redirect : function(location) {
        var body = "Redirecting to " + location;
        this.writeHead(302, {
            'Location' :  location,
            'Content-Type': 'text/plain',
            'Content-Length': body.length
        });
        this.end(body);
    },


    writeHead : function(statusCode, headers) {
        if (this.cookies) {
            headers["Set-Cookie"] = this.cookies.join(", ");
        }
        _writeHeader.call(this, statusCode, headers);
    }
});

var connect = require("connect");
var connectFilters = ["gzip-compress", "gzip-proc", "compiler", "errorHandler", "staticGzip", "cacheManifest", "conditionalGet", "cache"];
exports._Filter = require("./_Filter"),
        exports.SessionFilter = require("./SessionFilter"),
        exports.cookieDecoder = require("./CookieFilter");
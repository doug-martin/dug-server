var createServer = require("http").createServer,
        http = require("http"),
        readFile = require("fs").readFile,
        sys = require("sys"),
        url = require("url"),
        util = require("../util/util"),
        filters = require("../filters"),
        log4js = require("log4js")(),
        dojo = require("node-dojo");
require("../util/extensions");

var serverBase = exports;

exports = module.exports = dojo.declare(null, {

    LOG_LEVEL : "INFO",

    NOT_FOUND : "Not Found\n",

    NOT_IMPLMENTED : "{method} not implemented for {path}\n",

    https : false,

    server : null,

    started : false,

    logLocation : "log/dug-server.log",

    basePath : '/',

    supportedOps : null,

    constructor : function(params) {
        dojo.mixin(this, params);
        this.supportedOps = [];
        this.filters = {};
        log4js.addAppender(log4js.fileAppender(this.logLocation), 'dug-server');
        this.logger = log4js.getLogger('dug-server');
        this.logger.setLevel(this.LOG_LEVEL);
    },

    startup : function() {
        if (!this.started) {
            this.server = createServer(dojo.hitch(this, this._requestHandler));
            this.started = true;
        }
    },

    _requestHandler : function(req, res) {
        if (this.supportedOps.indexOf(req.method) >= 0) {
            try {
                var handler = this._handleRequest(req, res);
                if (handler) {
                    handler(req, res, this);
                } else {
                    this.notImplemented(req, res);
                }
            } catch(e) {
                this.logger.error(e);
            }
        } else {
            this.notImplemented(req, res);
        }
    },

    _findHandler : function(map, url) {
        var ret = null, handler;
        for (var i in map) {
            this.logger.debug("Testing " + i + " against" + url);
            var reg = new RegExp(i, "i");
            if (reg.test(url)) {
                ret = {};
                var handler = map[i],
                        handlerParams = handler.keys || [];
                var keys = ret.keys = {};
                ret.handler = handler;
                this.logger.debug(JSON.stringify(handler));
                if (handlerParams.length) {
                    var params = url.match(reg).slice(1);
                    this.logger.debug("URL Params = " + JSON.stringify(params))
                    for (var j in handlerParams) {
                        keys[handlerParams[j]] = params[j];
                        this.logger.debug("Added key : " + handlerParams[j] + " value : " + params[j]);
                    }
                    break;
                }
            }
        }
        this.logger.debug("FINAL RET = " + JSON.stringify(ret))
        return ret;
    },

    _matchParams : function(map, params) {
        this.logger.debug("IN MATCH PARAMS");
        this.logger.debug("PARMS = " + JSON.stringify(params))
        this.logger.debug("MAP = " + JSON.stringify(map))
        var ret = [];
        if (params && params.length > 0) {
            if (params == "*" || params == "all") {
                ret = [map];
            }
            else ret = params.map(function(name) {
                return map[name] || null
            });
        }
        return ret;
    },

    _normalizeParams : function(params) {
        var ret = params || [];
        if (typeof ret == "string") {
            if (ret != "*" && ret != "all") {
                ret = util.createArrayFromString(ret, ",");
            }
        }
        return ret;
    },

    // Stub for implementation.
    _handleRequest : function(req, res) {
    },

    notFound : function(req, res) {
        var file = this.getErrorFile(404);
        file(req, res);
    },

    notImplemented : function(req, res) {
        var file = this.getErrorFile(405);
        file(req, res);
    },

    notAuthorized : function(req, res) {
        var file = this.getErrorFile(401);
        file(req, res);
    },

    listen : function(port, host) {
        !this.started && this.startup();
        this.server.listen(port, host);
        //todo change to log4js
        this.logger.info("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
    },

    shutDown : function() {
        this.server.close();
    }
});


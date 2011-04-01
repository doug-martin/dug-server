var url = require("url"),
        dojo = require("node-dojo"),
        sys = require("sys"),
        util = require("../util/util");

exports = module.exports = dojo.declare(null, {

    constructor : function() {
        this.supportedOps.push("GET");
        this.getMap = {};
    },

    _handleRequest : function(req, res) {
        if (req.method === "GET") {
            var urlObj = url.parse(req.url, true);
            var handlerObj = this._findHandler(this.getMap, urlObj.pathname);
            if (handlerObj) {
                var handler = handlerObj.handler;
                this.logger.info("GET request " + urlObj.pathname)
                var session = req.session;
                if (!handler.session || session.attr(this.sessionKey)) {
                    this.logger.debug(JSON.stringify(handler))
                    var params = this._matchParams(dojo.mixin(handlerObj.keys || {}, urlObj.query || {}), handler.params);
                    this.logger.debug("GET PARAMS = " + JSON.stringify(params));
                    var _this = this;
                    var f = util.hitchArgs((handler.scope || _this), handler.handler, params);
                    return function() {
                        return f.apply((handler.scope || _this), arguments || []);
                    };
                } else {
                    res.redirect(this.basePath);
                }
            } else {
                this.inherited(arguments);
            }
        } else {
            this.inherited(arguments);
        }
    },

    getRequest : function (path, handler, session, params) {
        this.logger.debug("Adding GET handler with path " + path);
        var path = util.buildUrlRegexp(path), keys = path.keys || [];
        this.getMap[path.path] = {handler : handler, session : session, params : this._normalizeParams(params), keys : keys};
        this.logger.debug(JSON.stringify(this.getMap[path.path]));
    }
});
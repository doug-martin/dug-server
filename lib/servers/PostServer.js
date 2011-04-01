var url = require("url"),
        dojo = require("node-dojo"),
        queryString = require('querystring'),
        util = require("../util/util");

exports = module.exports = dojo.declare(null, {

    constructor : function() {
        this.supportedOps.push("POST");
        this.postMap = {};
    },

    _handleRequest : function(req, res) {
        if (req.method === "POST") {
            var urlObj = url.parse(req.url, true);
            var handlerObj = this._findHandler(this.postMap, urlObj.pathname);
            if (handlerObj) {
                var handler = handlerObj.handler;
                var session = req.session;
                if (!handler.session || session.attr(this.sessionKey)) {
                    return dojo.hitch(this, '_postRequestHandler', handler, handlerObj.keys);
                }else{
                    this.notAuthorized(req, res);
                }
            }
            //return handler.handler.apply(handler.scope || null, this._matchPostParams(req, handler.params));
        } else {
            return this.inherited(arguments);
        }
    },

    postRequest : function (path, handler, session) {
        this.logger.debug("Adding POST handler with path " + path);
        this.postMap[path] = {handler : handler, session : session};
    },

    _postRequestHandler : function(handler, params, req, res) {
        req.setEncoding('utf8');
        var postData = "";
        req.on('data', function(data) {            
            postData += queryString.unescape(data);
        });
        req.on('end', function() {
            var data = JSON.parse(postData);
            data = !util.isEmpty(handlerObj.keys) && !util.isEmpty(data) ? dojo.mixin(handlerObj.keys, datam) : null;
            var args = (data ? [data] : []);
            args.push(req, res);
            handler.handler.apply(handler.scope || null, args);
        });
    }
});
var url = require("url"),
        dojo = require("node-dojo"),
        sys = require("sys"),
        util = require("../util/util");

exports = module.exports = dojo.declare(null, {

    constructor : function() {
        this.filterMap = {};
    },

    _requestHandler : function(req, res) {
        var args = arguments;
        var urlObj = url.parse(req.url, true), path = urlObj.pathname, query = urlObj.query;
        var handlerObj = this._findFilters(path);
        if (handlerObj.length > 0) {
            var length = handlerObj.length;
            var reqNext = dojo.hitch(this, function(i) {
                this.logger.debug("(REQUESTNEXT) i = " + i + " length = " + length);
                var handlerO = i < length ? handlerObj[i++] : null;
                if (handlerO) {
                    var handler = handlerO.handler;
                    var params = this._matchParams(dojo.mixin(handlerO.keys, query), handler.params);
                    params.push(req, res, dojo.hitch(this, reqNext, i));
                    if(handler.filter.filter)
                    {
                        handler.filter.filter.apply(handler.filter, params)
                    }else{
                        handler.filter.apply(handler.filter, params)
                    }
                } else {
                    this.inherited(args, [req, res]);
                }
            });
            reqNext(0);
        } else {
            this.inherited(args);
        }
    },

    _findFilters : function(path) {
        var retArr = [], map = this.filterMap;
        var addHandler = dojo.hitch(this, function(handler) {
            this.logger.debug(JSON.stringify(handler))
            var ret = {};
            var handlerParams = handler.keys || [];
            var keys = ret.keys = {};
            ret.handler = handler;
            this.logger.debug(JSON.stringify(handler));
            if (handlerParams.length) {
                var params = path.match(reg).slice(1);
                this.logger.debug("URL Params = " + JSON.stringify(params))
                for (var j in handlerParams) {
                    keys[handlerParams[j]] = params[j];
                    this.logger.debug("Added key : " + handlerParams[j] + " value : " + params[j]);
                }
            }
            retArr.push(ret);
        });
        for (var i in map) {
            var reg = new RegExp(i, "i");
            this.logger.debug("Testing " + reg + " against " + path);
            if (reg.test(path)) {
                this.logger.debug("Filter Match!");
                var handler = map[i];
                if (handler instanceof Array) {
                    handler.forEach(addHandler);
                } else {
                    addHandler(handler)
                }
            }
        }
        this.logger.debug("FINAL RET = " + JSON.stringify(retArr))
        return retArr;
    },

    addFilter : function (path, filter, init, params, scope) {
        this.logger.debug("Adding Filter with path " + path);
        var path = util.buildUrlRegexp(path), keys = path.keys || [];
        var filterMap;
        if (!(filterMap = this.filterMap[path.path])) {
            filterMap = this.filterMap[path.path] = [];
        }
        filterMap.push({filter : new filter(init || {}), params : this._normalizeParams(params), keys : keys});
        this.logger.debug(JSON.stringify(this.filterMap[path.path]));
    }
});
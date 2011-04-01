var Session = require('./Session'),
        log4js = require("log4js")(),
        dojo = require("node-dojo");

var SessionManager = exports = module.exports = dojo.declare(null, {

    _sessionStore : null,

    options : null,

    domain : '',

    path : '/',

    persistent : true,

    timeOutInterval : 30000,

    lifetime : 86400,

    sidAlgo : 'sha512',

    salt : "123456789",

    secure : false,

    httpOnly : false,

    sessionId : "SID",

    constructor : function(options) {
        this.logger = log4js.getLogger('dug-server');
        options && dojo.mixin(this, options);
        setTimeout(dojo.hitch(this, this.cleanup), this.timeOutInterval)
    },

    create : function(resp) {},

    lookup : function(req) {},

    lookupOrCreate : function(req, resp) {},

    has : function(req) {
        return this.lookup(req) ? true : false;
    },

    get : function(sid) {return this._sessionStore[sid];},

    destroy : function(sid) {},

    cleanup : function() {
        //todo change this to log4js
        this.logger.info("Cleaning up sessions.");

        for (var sid in this._sessionStore) {
            var session = this._sessionStore[sid];
            if (session) {
                if (session.isExpired()) {
                    //todo change this to log4js
                    this.logger.info("Removed session: " + sid);
                    this.destroy(sid);
                }
            }
        }
        setTimeout(dojo.hitch(this, this.cleanup), this.timeOutInterval)
    }

});
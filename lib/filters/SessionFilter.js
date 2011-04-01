var dojo = require("node-dojo"), _Filter = require("./_Filter"), SessionManager = require("../sessions/SessionManager");

exports = module.exports = dojo.declare(_Filter, {

    sessionManager : null,

    sessionKey : 'user',

    session : true,

    domain : '',

    persistent : true,

    timeOutInterval : 30000,

    sidAlgo : 'sha512',

    salt : "123456789",

    lifetime : 86400,

    secure : false,

    httpOnly : false,

    sessionId : "SID",

    constructor : function(options) {
        dojo.mixin(this, options);
        console.log(JSON.stringify(options));
        var args = {
            domain : this.domain,
            path : this.basePath,
            persistent : this.persistent,
            timeOutInterval : this.timeOutInterval,
            lifetime : this.lifetime,
            secure : this.secure,
            httpOnly : this.httpOnly,
            sidAlgo : this.sidAlgo,
            salt : this.salt,
            sessionId : this.sessionId};
        this.sessionManager = new SessionManager(args);
    },

    getOrCreateSession : function(req, res) {
        return this.sessionManager.lookupOrCreate(req, res);
    },

    filter : function(req, res) {
        req.session = this.getOrCreateSession(req, res);
        this.inherited(arguments);
    }

});
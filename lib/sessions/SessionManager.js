var Session = require('./Session'), _SessionManager = require("./_SessionManager"), dojo = require("node-dojo");

var SessionManager = exports = module.exports = dojo.declare(_SessionManager, {

    constructor : function(options) {

        this._sessionStore = {};
    },

    create : function(resp) {
        var manager = this;
        var session = Session.getSession({lifetime : this.lifetime, sidAlgo : this.sidAlgo, salt : this.salt}), sid = session.sid;
        this._sessionStore[sid] = session;

        resp.setCookie(this.sessionId, sid, {
            domain : this.domain,
            path : this.path,
            expires : session.expires,
            secure : this.secure,
            httpOnly : this.httpOnly
        });

        //todo change this to log4js
        this.logger.debug("Session " + sid + " expires at " + new Date(session.expires));
        return session;
    },

    lookup : function(req, resp) {
        var sid = req.getCookie(this.sessionId);
        this.logger.debug(JSON.stringify(sid));
        var session = this._sessionStore[sid] || null;
        if (session && session.isExpired()) {
            resp && session.destroy(resp);
            this.destroy(sid);
            session = null;
        } else {
            session && session.touch();
        }
        return session;
    },

    lookupOrCreate : function(req, resp) {
        var session = this.lookup(req, resp);
        return session ? session : this.create(resp);
    },

    has : function(req) {
        return this.lookup(req) ? true : false;
    },

    get : function(sid) {
        return this._sessionStore[sid];
    },

    destroy : function(sid) {
        var session = this._sessionStore[sid];
        if (session) {
            session.destroy();
            delete this._sessionStore[sid];
        }
    }

});
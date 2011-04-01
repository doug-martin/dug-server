var dojo = require('node-dojo'), crypto = require('crypto'), log4js = require("log4js")();

var sidFactory = function(algo, salt) {
    return crypto.createHmac(algo, salt).update(new Date().getTime()).digest("hex");
};

var Session = exports = module.exports = dojo.declare(null, {

    sid : null,

    manager : null,

    sidAlgo : 'sha512',

    salt : "123456789",

    lifetime : 86400,

    data : {},

    constructor  : function(params) {
        dojo.mixin(this, params);
        this.logger = log4js.getLogger('dug-server');
        this.expires = Math.floor((+new Date) + this.lifetime * 1000);
        this.logger.debug(this.sidAlgo + " " +  this.salt + " " + this.lifetime);
        this.sid = exports.sidFactory(this.sidAlgo, this.salt, new Date);
    },

    attr : function(key, value) {
        if (key && value) {
            this.logger.debug("Set Data: " + this.sid + " key : " + JSON.stringify(value));
            this.data[key] = value;
        } else if (key) {
            this.logger.debug("Get Data: " + this.sid + " key : " + key);
            return this.data[key];
        } else {
            return this.data;
        }
    },

    isExpired : function() {
        var now = Date.now(), sessionExp = this.expires;
        return sessionExp - now < 100;
    },

    touch : function() {
        this.expires = Math.floor((+new Date) + this.lifetime * 1000);
    },

    destroy : function(resp) {
        resp.clearCookie("SID");
    }
});

exports.sidFactory = sidFactory;

exports.getSession = function(params) {
    return new Session(params);
}
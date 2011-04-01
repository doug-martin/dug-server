var dojo = require("node-dojo"), _Filter = require("./_Filter"), SessionManager = require("../sessions/SessionManager");

exports = module.exports = dojo.declare(_Filter, {

    filter : function(req, res) {
        req.getCookie();
        this.inherited(arguments);
    }

});
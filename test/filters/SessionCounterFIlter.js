var dojo = require("node-dojo"), dugServer = require("dug-server");

exports = module.exports = dojo.declare(dugServer.filters._Filter, {

    filter : function(req, res){
        var map, session = req.session;
        var count = session.attr("count") || 0;
        req.session.attr("count", ++count);
        this.inherited(arguments);
    }

});
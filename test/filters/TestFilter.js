var dojo = require("node-dojo"), dugServer = require("dug-server");

exports = module.exports = dojo.declare(dugServer.filters._Filter, {

     i : 0,

    filter : function(req, res){
        console.log("App request count : " + ++this.i);
        this.inherited(arguments);
    }

});
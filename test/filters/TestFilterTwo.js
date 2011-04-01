var dojo = require("node-dojo"), dugServer = require("dug-server");

exports = module.exports = dojo.declare(dugServer.filters._Filter, {

    nameMap : null,

    constructor : function(){
        this.nameMap = {};
    },

    filter : function(name, req, res){
        var map;
        if(!(map = this.nameMap[name])){
            map = this.nameMap[name] = 0;
        }
        console.log("App request count for " + name + " = " + ++map);
        this.inherited(arguments);
    }

});
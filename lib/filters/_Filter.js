var dojo = require("node-dojo");

exports = module.exports = dojo.declare(null, {

    filter : function(req, res, next){
        var args = Array.prototype.slice.call(arguments, 0);
        args.pop()();
    }

});
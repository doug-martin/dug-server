var dojo = require("node-dojo");

exports.hello = function(req, res, server) {
    res.simpleText("HELLO \n You have visited " + req.session.attr("count") + " times");
}

exports.helloWithName = function(name, req, res, server) {
    res.simpleText("HELLO " + name.charAt(0).toUpperCase() + name.substr(1) + "\nYou have visited " + req.session.attr("count") + " times");
}

exports.bye = function(req, res) {
    var args =dojo._toArray(arguments);
    if (args.length > 3) {
        var name = args[0], req = args[1], res = args[2];
        res.simpleText("BYE " + name.charAt(0).toUpperCase() + name.substr(1));
    } else {
        res.simpleText("BYE");
    }
}
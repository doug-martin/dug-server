var readFile = require("fs").readFile,
        dojo = require("node-dojo"),
        servers = require("./lib/servers"),
        filters = require("./lib/filters");

var modules = {};

var cwd = process.cwd();

function resolveMethods(methodObj, httpMethod, server) {
    console.log("loading " + httpMethod + " methods");
    var methods = methodObj.methods || [];
    for (var i in methods) {
        var method = methods[i];
        var handlerClass = method.handler, operations = method.operations;
        var handler = require(cwd + "/" + handlerClass);
        for (var j in operations) {
            var operation = operations[j];
            var func = operation.method;
            console.log(JSON.stringify(handler));
            if (handler[func]) {
                var path = operation.path != null && operation.path != undefined ? operation.path : "/" + func;
                var params = operation.params || "";
                var session = operation.session || false;
                console.log("adding method at path " + server.basePath + path);
                server[httpMethod.toLowerCase() + "Request"](server.basePath + path, handler[func], session, params, handler);
            } else {
                throw new Error("Cannot add method " + func);
            }
        }
    }
}

var loadedFilters = {"SessionFilter" : filters.SessionFilter}

function resolveFilters(filters, server) {
    console.log("loading  filters");
    for (var i in filters) {
        var filter = filters[i];
        var filterClass;
        if(filter.filter in loadedFilters){
            filterClass = loadedFilters[filter.filter];
        }else{
           filterClass = require(cwd + "/" + filter.filter);
        }
        var path = filter.path || "", params = filter.params, init = filter.init || {};
        server.addFilter(path, filterClass, init, params);
    }
}

var createServer = function(methods, fileServer, filters, session) {
    var base = [servers._ServerBase]
    filters && base.push(servers.FilterServer);
    for (var i in methods) {
        if (i == "GET" && methods[i]) {
            base.push(servers.GetServer)
        } else if (i == "POST" && methods[i]) {
            base.push(servers.PostServer)
        } else if (i == "PUT" && methods[i]) {
            base.push(servers.PutServer)
        } else if (i == "DELETE" && methods[i]) {
            base.push(servers.DeleteServer)
        }
    }
    if (fileServer) {
        base.push(servers.StaticServer)
    }
    return dojo.declare(base, {});
};

var baseConfiguration = {
    port : 8080,
    host : 'localhost',
    path : '',
    session : false
};

var createServerFromJson = function(json){
        var configuration = dojo.mixin({}, baseConfiguration, json)
        var port = configuration.port;
        var host = configuration.host;
        var path = configuration.path;
        var filters = configuration.filters;
        var GET = configuration.GET;
        var POST = configuration.POST;
        var PUT = configuration.PUT;
        var DELETE = configuration.DELETE;
        var welcomeFiles = configuration.welcomeFiles;
        var errorFiles = configuration.errorFiles;
        var serverClass = configuration.server;
        var server = null;
        if (configuration.serverClass) {
            server = require(serverClass)[serverClass.substring(serverClass.lastIndexOf("/") + 1)];
        } else {
            var fileServer = welcomeFiles || errorFiles || (GET && GET.dirs);
            server = createServer(json, fileServer, filters);
        }
        server = new server({basePath : path});
        if(filters && filters.length){
            resolveFilters(filters, server);
        }
        if (GET) {
            var dirs = GET.dirs || null;
            if (dirs) {
                dirs.forEach(function(obj){server.addDirectoryGet(obj.path, obj.dir, obj.session)}, server);
            }
            resolveMethods(GET, "GET", server);
        }
        if (POST) {
            resolveMethods(POST, "POST", server);
        }
        if (PUT) {
            resolveMethods(PUT, "PUT", server);
        }
        if (DELETE) {
            resolveMethods(DELETE, "DELETE", server);
        }
        if (welcomeFiles) {
            console.log("loading welcomeFiles methods");
            welcomeFiles.forEach(function(obj){server.addFileGet(obj.path, obj.file, obj.session)}, server);
        }
        if (errorFiles) {
            console.log("loading errorFiles methods");
            errorFiles.forEach(function(obj){server.addErrorFile(obj.code, obj.file)}, server);
        }
        console.log("starting server");
        server.listen(port, host);
}

function parseConfiguration(serverArr) {
    if(serverArr instanceof Array) serverArr.forEach(createServerFromJson)
    else createServerFromJson(serverArr)
}

var loadFromFile = function(file) {
    var json;
    console.log("Reading configuration at : ", file);
    readFile(file, function (err, data) {
        if (err) {
            console.log("Error loading configuration file : " + file);
        } else {
            parseConfiguration(JSON.parse(data));
        }
    });
};

exports.createServer = function(data){
    if(typeof data === "string"){
       loadFromFile(process.cwd() + "/" + data);
    }else{
        parseConfiguration(data);
    }
}

exports.servers = servers;
exports.filters = filters;


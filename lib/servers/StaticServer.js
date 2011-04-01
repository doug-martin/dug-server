var readFile = require("fs").readFile,
        sys = require("sys"),
        url = require("url"),
        path = require("path"),
        dojo = require("node-dojo"),
        fileUtil = require("../util/file"),
        util = require("../util/util");

exports = module.exports = dojo.declare(null, (function() {

    var DEBUG = false;

    return{

        dirs : null,

        files : null,

        errorFiles : null,

        constructor : function() {
            this.dirs = {};
            this.files = {};
            this.errorFiles = {};
        },

        staticHandler : function (filename, code) {
            var body, headers;
            this.logger.debug(fileUtil.extname(filename));
            this.logger.debug(fileUtil.mime.lookupExtension(fileUtil.extname(filename)));
            var content_type = fileUtil.mime.lookupExtension(fileUtil.extname(filename));

            function loadResponseData(callback) {
                if (body && headers && !DEBUG) {
                    callback();
                    return;
                }
                readFile(filename, function (err, data) {
                    if (err) {
                        callback(err);
                    } else {
                        body = data;
                        headers = { "Content-Type": content_type
                            , "Content-Length": body.length
                        };
                        if (!DEBUG) headers["Cache-Control"] = "public";
                        callback();
                    }
                });
            }

            return dojo.hitch(this, function (req, res) {
                var _this = this;
                loadResponseData(function (err) {
                    if (err) {
                        _this.notFound(req, res);
                    } else {
                        res.writeHead(code, headers);
                        res.end(req.method === "HEAD" ? "" : body);
                    }
                });
            });
        },

        _handleRequest : function(req, res) {
            if (req.method === "GET") {
                var path = url.parse(req.url).pathname;
                var handlerObj = this._findHandler(this.files, path);
                if (handlerObj) {
                    var file = handlerObj.handler;
                    this.logger.debug("Requesting " + path);
                    var session = req.session;
                    if (!file.session || session.attr(this.sessionKey)) {
                        return file.handler;
                    } else {
                        res.redirect(this.basePath + '/');
                    }
                } else {
                    //this is a directory lookup
                    handlerObj = this._findHandler(this.dirs, path);
                    if (handlerObj) {
                        this.logger.debug("Requesting " + path);
                        var dir = handlerObj.handler, originalPath = dir.originalPath;
                        var session = req.session;
                        if (!dir.session || session.attr(this.sessionKey)) {
                            var file = path.replace(new RegExp(originalPath), dir.dir);
                            var path = util.buildUrlRegexp(path).path;
                            this.logger.debug("Adding File handler with path " + path + " and " + file);
                            this.files[path] = {handler : this.staticHandler(file, 200), session : dir.session};
                            return this.files[path].handler;
                        } else {
                            res.redirect(this.basePath + '/');
                        }
                    } else {
                       return this.inherited(arguments);
                    }
                }
            }
            return this.inherited(arguments);
        },

        getErrorFile : function(code) {
            var file = this.errorFiles[code];
            return file.file;
        },

        addDirectoryGet : function(path, dir, session) {
            if (dir) {
                dir += dir.lastIndexOf("/") != dir.length - 1 ? "/" : "";
                var newPath = util.buildUrlRegexp(path).path, location = dir.dir;
                this.logger.debug("Adding DIR handler with path " + newPath);
                this.logger.debug(JSON.stringify(dir));
                this.dirs[newPath] = {dir : dir, originalPath : dojo.regexp.escapeString(path.replace("*", "")), session : session || false};
            }
        },

        addFileGet : function(path, file, session) {
            if (file) {
                var path = util.buildUrlRegexp(path).path;
                this.logger.debug("Adding File handler with path " + path);
                this.logger.debug(JSON.stringify(file));
                this.files[path] = {handler : this.staticHandler(file, 200), session : session || false};
            }
        },

        addErrorFile : function(code, file) {
            if (file) {
                this.logger.debug("Adding Error handler with path " + code);
                this.logger.debug(file);
                this.errorFiles[code] = {handler : this.staticHandler, file : this.staticHandler(file, code)};
            }
        }
    }
})());
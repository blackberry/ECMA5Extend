require("shelljs/make");
var path = require("path"),
	buildDir = path.join(__dirname, "src", "build"),
	rjsPath = path.join(__dirname, "..", "node_modules", "requirejs", "bin", "r.js");
	
var build = function(mode) {
	
	var dst = path.join(__dirname, "app" + (mode != "release" ? ".js" : ".min.js"));
	
	cd(buildDir);
	echo("build mode=" + mode);
	
	var res = exec("node " + rjsPath + " -o build.js out=" + dst + (mode == "release" ? " optimize=uglify" : ""));

	if (res.code != 0) {
		exit(1);
	}

};

target.dev = function(){
	build("dev");
};

target.release = function(){
	build("release");
};

target.all = target.dev;
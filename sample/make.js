require("shelljs/make");
var path = require("path"),
	buildDir = path.join(__dirname, "src", "build");

var build = function(mode) {

	var dst = path.join(__dirname, "app" + (mode != "release" ? ".js" : ".min.js"));
	cd(buildDir);
	
	var res = exec("node r.js -o build.js out=" + dst + " optimize=uglify");

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
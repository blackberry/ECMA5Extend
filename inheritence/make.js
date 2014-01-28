/* Copyright 2013 Research In Motion
 * @author: Anzor Bashkhaz
 * @author: Isaac Gordezky
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
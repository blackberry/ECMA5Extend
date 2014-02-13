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

require.config({
	baseUrl: "src",
	paths : {
		"extend" : "../../../src/extend",
	}
});

require(["extend!ParentClass", "extend!ChildClass"], function(ParentClass, ChildClass) {

	
    window.parentObject = ParentClass.create();
    parentObject.value = "hi!";
    
    window.childObject = ChildClass.create();
    // chilObject inherits parent's public properties and methods
    childObject.value = "ho!";
    
});

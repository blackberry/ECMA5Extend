/* Copyright 2013 BlackBerry Limited
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
		"extend" : "../../../../src/ECMA5Extend",
	}
});

require(["extend!ParentType", "extend!ChildType"], function(ParentType, ChildType) {

	//extend returns a type with method "create"
	window.parentInstance = ParentType.create();
    //parentInstance.value = "hi!"; //[protected] ParentClass: value changed to hi! 
    
    window.childInstance = ChildType.create();

    // we've re-implemented parent's valueChanged protected method 
    childInstance.value = "ho!"; // [protected] ChildClass: value changed to ho! 
    
    //we've not re-implemented parent class' anotherValue protected method, so this will use the parents' within the child's scope
    childInstance.anotherValue = "hello!"; //[protected implemented in ParentClass]: value changed to hello! 
        
});

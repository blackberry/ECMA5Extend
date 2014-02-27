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
	baseUrl : "src",
	paths : {
		"extend" : "../../../../src/ECMA5Extend",
	}
});

require(["extend!SomeType"], function(someType) {

	window.someTypeInstance = someType.create();
	someTypeInstance.value = "hi!";
	// value changed to hi! 
	
	someTypeInstance.readOnlyValue = "Let's see if this works!";
	//no effect on value

	// Let's go behind the subscribers' backs and change the value of 'value'
	someTypeInstance.updateValueQuietly("hmmmm");

	someTypeInstance.limitedValue = 101;
	//Error: Out of bounds

});

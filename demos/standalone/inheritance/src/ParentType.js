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

ParentType = {

	name : "ParentType",

	public : {

		value : null,

		anotherValue : null

	},

	private : {

		valueChanged : function valueChanged(newValue) {
			// call the protected method
			this.protected.valueChanged(newValue);
		},

		anotherValueChanged : function valueChanged(newValue) {
			// call the protected method
			this.protected.anotherValueChanged(newValue);
		}
	},

	protected : {

		valueChanged : function valueChanged(newValue) {
			console.log("[protected] ParentType: value changed to " + newValue);
		},

		anotherValueChanged : function valueChanged(newValue) {
			//example of protected that is not implemented by the child type
			console.log("[protected implemented in ParentType]: value changed to " + newValue);
		},
	},

	init : function init() {
		console.log("ParentType init");
	},

	destroy : function destroy() {

	}
};

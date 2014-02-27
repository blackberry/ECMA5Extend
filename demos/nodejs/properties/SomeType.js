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

module.exports = {

	name : "SomeType",

	public : {

		value : null,

		// ECMA5 property descriptor way of definging a read only property
		readOnlyProperty : {
			get : function() {
				return this.readOnlyProperty;
			}
			//notice there is no setter
		},

		// ECMA5 property descriptor way of definging a write only property
		writeOnlyProperty : {
			set : function(value) {
				this.writeOnlyProperty = value;
			}
		},

		// ECMA5 property descriptor way of providing a custom setter and publishing a change event manually
		limitedValue : {
			get : function() {
				return this.limitedValue;
			},
			set : function(newValue) {
				// intercept the setter and check to make sure it is within bounds
				if (newValue > 100 || newValue < 0)
					throw new Error("Value out of bounds");
				else {
					// set the value
					this.limitedValue = newValue;
					//publish changed event
					this.public.publish("limitedValueChanged", this.limitedValue);
				}
			}
		},

		// public function that interfaces with a private function
		updateValueQuietly : function updateValueQuietly(newValue) {
			//run the private updateValueQuietly function
			this.updateValueQuietly(newValue);
		}
	},

	private : {

		valueChanged : function valueChanged(newValue) {
			console.log("value changed to " + newValue);
		},

		updateValueQuietly : function updateValueQuietly(value) {
			console.log("shhh.. I just went behind the property's back, without triggering valueChanged!!");
			this.value = value;
		}
	},

	protected : {

	},

	init : function init() {

	},

	destroy : function destroy() {

	}
};
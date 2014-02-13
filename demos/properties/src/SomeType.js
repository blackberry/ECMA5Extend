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

define(function() {

	var someType = {

		public : {

			value : null,

			// ECMA5 property descriptor way of definging a read only property
			readOnlyValue : {
				enumerable : true,
				get : function() {
					return this.readOnlyValue;
				}
				//notice there is no setter
			},

			// ECMA5 property descriptor way of providing a custom setter and publishing a change event manually
			limitedValue : {
				enumerable : true,
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
						this.public.publish("limitedValueChanged", newValue);
					}
				}
			},
			
			// public function that interfaces with a private function
			updateValueQuietly : function(newValue) {
				//run the private updateValueQuietly function
				this.updateValueQuietly(newValue);
			}
		},

		private : {

			valueChanged : function(newValue) {
				console.log("value changed to " + newValue);
			},

			updateValueQuietly : function(value) {
				console.log("shhh.. I just went behind the property's back, without triggering valueChanged!!");
				this.value = value;
			}
		},

		protected : {

		},

		init : function() {
			console.log("someType init");
			// set the public API property, which triggers a valueChanged event
			this.public.value = "something";
			// set the private property, which quietly sets the value
			this.value = "something";
		},

		destroy : function() {

		}
	};

	return {
		extend : null, //parent type
		definition : someType
	};

});

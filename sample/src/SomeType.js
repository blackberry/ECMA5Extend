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
			
			value : null
			
		},

		private : {
			
			valueChanged : function(newValue){
				console.log("value changed to " + newValue);
			},
			
			updateValueQuietly : function(value){
				console.log("shhh.. I just went behind the property's back, without triggering valueChanged!!");
				this.value = value;
			}
			
		},
		
		protected : {
			
						
		},
		
		init : function(){
			console.log("someType init");
			var _self = this;
			
			// Let's go behind the subscribers' backs and change the value of 'value'
			setTimeout(function updateValueQuietly(){
				_self.updateValueQuietly("hmmmm");
			},2000);
		},
		
		destroy : function(){
			
		}

	};

	return {
		extend : null, //parent type
		object : someType
	};

});

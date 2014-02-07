# ExtendJS

Small toolkit for writing 'big-boy' JavaScript APIs. Currenlty, it is a RequireJS(http://requirejs.org) plugin only, but a distributable library is in the works.

## Why?

JavaScript was originally invented to do basic form validation and arithmetic, and is evolving into a full-blow language for writing Apps.

**As JavaScript evolves, so should the developers that use it.**

A mature programming language provides:

- Inheritance
- public, private and protected spaces for its API
- event system

Some of these are coming in ECMA6, and it will take years for browsers to implement it, plus the syntax changes.
This is why, after many painful projects, we've developed ExtendJS. 

Unlike other "extend-like" projects, this one relies on Object creation and manipulation tools provided by ECMA5, including Object.create and Object.defineProperty. This project does not encourage the use of the "new" keyword. 

### Why inheritance?

Simple: Code Reuse.

### Why private?

If you haven't found the need to have private methods and properties in code, then you probably haven't been desiging APIs for long enough. Keep at it. It doesn't happen overnight.

A good API exposes only a subset of guts to the outside. The rest reside "under the hood", away from the developer. 
Think of a thermostat, you don't have control over heat or cold directly. You set the temperature, and the thermostat decides which one to turn on, and for how long, based on the room temperature. Setting the temperature is your public API, while access to heat and cold directly are inside of the private API.

### Why protected?

What if your child type wants to inherit a non-public method? That's called protected.


### Structure

``` javascript

In this example, we define a parent Type, and a child Type that inherits from the parent. the child will inherit the public and protected spaces.

//parent class
define("parent", function() {

	var parentType = {

		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};

	return {
		extend : null, // what does this type extend?
		object : parentType
	};

});

//child class
define(["extend!parent"], function(parent) {

	var childType = {

		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};

	return {
		extend : parent
		object : childType
	};

});

```

## Intelligent Event/Notification System

ExtendJS has an intelligent event system. Any property created in the "public" space, automatically gets setters and getters so that :

- Setting the public property to a specific value triggers an "<propertyName>Changed" event. All subscribers, and any "<propertyName>Changed" methods inside private get notified of the change.
- Setting the private property to a specific value allows you to go behind the property's back if you don't want to alarm the subscribers.

Example:


``` javascript

	var someType = {

		public : {
			
			value : null,
			
			quietlySetValue : function(value) {				
				//call the private function to update value behind the event's back
				console.log("shhh.. I just went behind the propertys back, without triggering valueChanged!!");
				this.value = value;
			}
			
		},

		private : {
			
			// this is triggered anytime "value" is set using the public API
			valueChanged : function(newValue){
				console.log("value changed to " + newValue);
			}
			
		},
...
```

Let's play:

``` javascript
var newType = someType.create();
newType.value = "hi!";
> "value changed to hi!"

newType.value = "hello";
> "value changed to hello!"

newType.quietlySetValue("shhh...");
> "shhh.. I just went behind the property's back, without triggering valueChanged!!"
newType.value;
> "shhh..."

// Let's add a subscriber
newType.subscribe("valueChanged", function(newValue){
	console.log("subscriber has been notified of change to " + newValue);
});

// we now get two notifications
newType.value = "hi!";
> "value changed to hi!"
> "subscriber has been notified of change to hi!"


```

## Accessing private, public, protected

Access is simple. From anywhere within your type (eg. the init function), use:

``` javascript
init : function(){
	
	// access to private property
	this.text = "hi there, I just secretly set the value of text :)";
	
	// access to private method
	this.waveHello();
	
	// access to public API (will trigger textChanged event)
	this.public.text = "hi there!"; 	

	//access to protected, will call the parent type's draw if draw isn't reimplemented by this type
	this.protected.draw(); 

}
```

## Using ECMA5 descriptors to define properties

One of the amazing parts of ECMA5Extend is that developers are able to define properties using property descriptors. This not only allows to define read-only properties, but also provide limits on changes among other features.


``` javascript

	var someType = {

		public : {
			
			value : {
				enumerable: true,
				get: function(){
					return this.value;				
				},
				set: function(newValue){
					if (newValue < 0 || newValue > 100){
						throw new Error("out of bounds exception for value");
					else
						this.value = newValue;
					
				}
			}
			
		}

...
```

## How to build

1. Install dependencies:

```
> npm install
```

2. Build sample

```
> cd sample
> node make

```

**Author** 

* Isaac Gordezky (https://github.com/igordezky)
* Anzor Bashkhaz (https://github.com/anzorb)

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
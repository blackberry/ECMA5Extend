# ECMA5Extend

Small toolkit for writing good JavaScript APIs.

## Why?

JavaScript was originally invented to do basic form validation and arithmetic, and is evolving into a full-blow language for writing Apps.

**As JavaScript evolves, so should the developers that use it.**

A mature programming language provides:

- Inheritance
- Public, private and protected API
- Intelligent event system

Some of these are coming in ECMA6, and it will take years for browsers to implement it, plus the syntax changes.
This is why, after many painful projects, we've developed ExtendJS. 

Unlike other "extend-like" projects, this one relies on Object creation and manipulation tools provided by ECMA5, including Object.create and Object.defineProperty. This project does not use the "new" keyword and instead relies on inheritance using ECMA5 Object.create(). 

### Why inheritance?

Simple: Code Reuse.

### Why private?

A good API exposes only a subset of guts to the outside. The rest reside "under the hood", away from the developer. These are private APIs. 
Think of a thermostat, you don't have control over heat or cold directly. You set the temperature, and the thermostat decides which one to turn on, and for how long, based on the room temperature. Setting the temperature is your public API, while access to heat and cold directly are inside of the private API.

### Why protected?

What if your child type wants to inherit a non-public method and/or re-implement it? That's called protected.

## Structure

It comes in two flavors:

1. RequireJS AMD Plugin (http://requirejs.org/)
2. Standalone Library

### **Standalone Library**

``` javascript

var parent = {
	
		name : "parentType",
		
		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};

var child = {
	
		name : "childType",
		
		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};
	
```

ECMA5Extend has a single method:

_createType(definition, extends)_

```
//create both types
var parentType = ECMA5Extend.createType(parent);
var childType = ECMA5Extend.createType(child, parent);
```

Once a type is created, it has a create() method, to spawn instances:

```
//create instances
var parentInstance = parentType.create();
var childInstance = childType.create();
```

Anything you pass into create, gets passed into the type's init() functions as arguments.

### **RequireJS AMD Plugin (http://requirejs.org/)**

To use ECMA5Extend as a RequireJS plugin. You need to:

1. Wrap the module in a define()
2. Import parent Types using the extend! plugin, ```define([extend!parent], function(parentType){ })```
3. Add an "extend" property that points at what was returned from the extend! plugin
4. Return the type definition, as with any RequireJS modules

```
//parent class
define("parent", function() {

	return {
	
		name : "parentType",
		
		extend : null, //parent Type

		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};

});


//child class
define(["extend!parent"], function(parent) {

	return {
	
		name : "childType"
		
		extend : parent, //this points at what extend!parent passes into this module

		public : { },

		private : { },
		
		protected : { },
		
		init : function(){ },
		
		destroy : function(){ }

	};

});
```

The result type will have a ```create()``` method, that creates instances.

```
require(["extend!child"], function(childType) {

	var newInstance = childType.create();

});
```


## Intelligent Event/Notification System

ECMA5Extend has an intelligent event system. Any property created in the "public" space, automatically gets setters and getters so that :

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
					//this provides granular control over what the values are set to
					if (newValue < 0 || newValue > 100){
						throw new Error("out of bounds exception for value");
					}
					else{
						//set value
						this.value = newValue;
						//publish change event on type
						this.public.publish("valueChanged", newValue);
					}					
				}
			},
			
			someReadOnlyProperty: {
				//omit the "set" function for the property to be read-only
				get: function(){
					return this.someReadOnlyProperty;
				}			
			}
			
		}

...
```

This also allows you to directly access other variables in the getter and setter, for example, let's design a TextField type, which is essentially an input box:

```
var definition = {
   public: {
      value: {
         get: function(){
            return this.public.el.value; //direct access to DOM
         },
         set: function(newValue){
            if (validate(newValue)){ //this allows for smart validation and setting limits
                this.public.el.value = newValue;
                // this also requires to publish a change event manually
                this.public.publish("textChanged", newValue);
            }
         }
      }
   },

   init : function(){
      this.public.el = document.createElement("input");
      this.public.el.setAttribute("type","text");
      //subscribe to changes to DOM, so that we publish a changedEvent
      var _self = this;
      this.public.el.addEventListener("change", function(){
         //publish the value retrieved using getter defined above, as to not duplicate data
         _self.public.publish("valueChanged", _self.public.value); 
      }
   }
...
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

	//access to protected, will call the parent type's draw if draw isn't reimplemented by the child (self) type
	this.protected.draw(); 

}
```

## Re-implementing parent methods using protected

One of the best features of ECMA5Extend, is the ability to declare protected methods. Protected methods allow child types to inherit non-public methods from their parents, and re-impliment parents' protected methods.

Take a look at demos/inhertance for an example of this.
	
## Tests

Install jasmine-node

```
npm install -g jasmine-node
```

Run tests:

```
jasmine-node --runWithRequireJs .\tests
```

If jasmine returns nothing, add --captureExceptions flag

```
jasmine-node --runWithRequireJs --captureExceptions .\tests
```

**Author** 

* Anzor Bashkhaz (https://github.com/anzorb)
* Isaac Gordezky (https://github.com/igordezky)

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
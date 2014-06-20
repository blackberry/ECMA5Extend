# ecma5-extend #

Ecma5-extend is a javascript library that provides a generic class structure for javascript. In contrast to other solutions, ecma5-extend classes are written in pure javascript and it requires support for ECMA5.

------------

#### Requirements ###

* [Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


#### High-Level Features ###

* Public, protected and private scopes
* Public and protected inheritance
* ECMA5 shorthand syntax

## Overview ##

Ecma5-extend is a commonjs module for writing javascript types that behave like C++ classes. Ecma5-extend supports creating public, protected and private scopes on objects and includes a customizable publish/subscribe system. Ecma5-extend suports type inheritance for both JavaScript types and DOM Elements.

    var personType = {

        name: "Person",

        /* defaults to Object if not specified */
        extends : Object,

        public: {
            firstName: {
                /* read/write value property */
                value : "Isaac"
            },
            lastName: {
                /* read/write accessor/mutator property */
                set: function(firstName) {
                    this.lastName = lastName;
                }
            },
            fullName: {
                /* read-only accessor property */
                get: function() {
                    return this.concatinateName();
                }
            }
        },

        private: {
            concatinateName: function() {
                return this.firstName + ' ' + this.lastName;
            }
        },

        init: function(first, last) {
            this.firstName = first;
            this.lastName = last;
        }
    }

    var person = Type.create('Frank', 'Jones');
    console.log(person.fullName); // Frank Jones
    person.firstName = "John";
    console.log(person.fullName); // John Jones

## Object Implementation ##

To support private, protected and public scopes, ecma5-extend creates instance-specific objects for public and protected scopes and an instance-specific object for each ecma5-extend type in the type hierarchy.


#### Structure ####

The structure of an ecma5-extend object is functionally equivalent to the following pseudo-code:

    var publicObject = {
        __proto__ : /* public scope definition */
    };
    var protectedObject = {
        __proto__ : /* protected scope definition */
    };
    var privateObject = {
        "public" : publicObject,
        "protected" : protectedObject,
        __proto__ : /* private scope definition */
    };

**All functions are called with `this` as the private object.**

Unless otherwise implemented, **all properties are stored on the private object.** This means that within methods on the private scope, properties and methods in protected and public scopes must be accessed via the scope name, i.e: `this.public.myMethod()`


## Type Definition Syntax ##

Types are defined in a custom object format that uses ECMA5 style scope definitions as well as several short-forms. All parameters are optional.

    var typeDefinition = {
        name : "mycustomtype",
        extends : Object,
        private : {
            /* private scope definition */
        },
        protected : {
            /* protected scope definition */
        },
        public : {
            /* public scope definition */
        },
        init : function() {
        },
        destroy : fuction() {
        }
    }

* **name** - the type name (will be shown in devtools)
* **extends** - (optional) the type to inherit from (defaults to Object). Ecma5-extend types, javascript types and DOM Element types are supported
* **private** - the private scope definition
* **protected** - the protected scope definition
* **public** - the public scope definition
* **init** - called during object creation (after parent classes and before child classes)
* **destroy** - called during object destruction (before parent classes and after child classes)


## Scope Definition Syntax ##

Scope definitions are used to declare properties and methods in ECMA5 property descriptor syntax, tradtional object syntax and custom short forms. For the latter cases, ecma5-extend will create and auto-fill an ECMA5 property descriptor.


#### ECMA5 Property Descriptor Syntax ###

ECMA5 properties are defined using the ECMA5 property descriptor syntax. ECMA5 supports both value and accessor/mutator properties.

* **configurable** - true if the property can be re-defined
* **writable** - true if the property can be changed using `object.property = value`
* **enumerbale** - true if the property is iterated by `for ... in` loops


##### Value Properties #####

* **value** - the initial value of the property


##### Accessor / Mutator Properties #####

* **get** - function which returns the current value of the property
* **set** - function which sets the value of the property

[See MDN for more information](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description)


#### Short Forms and Default Values ####

Ecma5-extend includes a parser that converts the traditional and shorthand forms to ECMA5 property descriptor, which sets default values according to the following rules:

* functions are read-only and not enumerable
* objects are writable and enumerable
* when only a set function is defined, a get function that returns `<private object>.<propertyname>` is assumed.
Note: *implied get is faster than writing your own, so it use where possible*

For traditional syntax, ecma5-extend assumes default values for the property descriptor. An example of traditional syntax is shown here:

    var publicDefinition = {
        myproperty : "myvalue",
        mymethod : function () {}
    };


## Eventing ##

Ecma5-extend provides a default implementation for an eventing system, with the following api

* *public* **publish (event, ...)** - emit an event (supports multiple parameters)
* *public* **subscribe (event, callback)** - subscribe to an event
* *public* **unsubscribe (event, callback)** - unsubscribe from an event


### Automatic Change Events ###

**Caution: this behaviour may change in the future**

Ecma5-extend automatically publishes a *propertyChanged* event when a **public** property is changed.


### Intercepting Events ###

If a *protected* method named *propertynameChanged* is defined, it will be called before any subscribers. Currently there is no way to prohibit an event or modify its arguments, but that could be implemented with custom eventing.


### Custom Eventing ###

Ecma5-extend will automatically install its publish/subscribe system unless one is provided by the developer or inherited from a parent type. The ecma5-extend publish/subscribe system can be customized by implementing the following api in a type definition:

* *protected* **publish (event, ...)** - emit an event (supports multiple parameters)
* *public* **subscribe (event, callback)** - subscribe to an event
* *public* **unsubscribe (event, callback)** - unsubscribe from an event


## Object Creation / Destruction ##

An object of a specific type can be created by calling the `create` method on the type, supplying any parameters to be passed to the type's init method.

    var object = Type.create(arg1, arg2);

Objects **must** be destroyed to have their memory reclaimed.

    object.destroy();

### DOM Objects ###

When inheriting from DOM Element types, a *name* must be provided in the type definition. This name will be used to create the html tag name for your type.

To turn an already-existing dom node into your type, pass the DOM node as the first parameter to `type.create`. Otherwise, it will be created automatically.

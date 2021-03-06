/* Copyright 2013 BlackBerry Limited
* @author: Isaac Gordezky
* @author: Anzor Bashkhaz
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

/**
 * Ecma5-extend is a javascript library that provides a generic class
 * structure for javascript. In contrast to other solutions, ecma5-extend
 * classes are written in pure javascript and it requires support for ECMA5.
 *
 * @module ecma5-extend
 *
 * @property {boolean} memoryLeakWarning - Enables memory leak warnings for ecma5-extend classes. (Default: true)
 *
 * @property {boolean} memoryLeakProtection - Enables memory leak protection for ecma5-extend classes.
 * Memory leak protection automatically deletes properties on the private and protected objects during destroy. (Default: false)
 *
 * @property {boolean} autoNotifyOnSet - Determines if a class's property setters will automatically publish
 * a propertyChanged event when the value is set. This does not affect the protected interface propertyChanged
 * API, which will be called regardless of this option. This value can be overridden by individual object
 * definitions. (default: true)
 *
 */

/**
 * The common interface shared by every ecma5-extend type.
 *
 * @class Type
 * @memberof ecma5-extend
 */

/**
 * The common interface shared by every object that is an instance of an ecma5-extend type.
 *
 * Due to the limitations of javascript types, a single ecma5-extend instance has three associated objects:
 *
 *  * {@link ecma5-extend.Object.PublicInterface PublicInterface}
 *      An object that is the public interface of an ecma5-extend instance
 *  * {@link ecma5-extend.Object.ProtectedInterface ProtectedInterface}
 *      An object that is the protected interface of an ecma5-extend instance, shared between all ecma5-extend types in an instance's type hierarchy
 *  * {@link ecma5-extend.Object.PrivateInterface PrivateInterface}
 *      An object that is the private interface of an ecma5-extend instance, specific to each ecma5-extend type in an instance's type hierarchy
 *
 *
 * @class Object
 * @memberof ecma5-extend
 *
 * @property {string} name - The name of the type
 *
 * @property {object} extend - An ecma5-extend, HTMLElement or javascript type
 *
 * @property {Array.<object>} mixin - A list of ecma5-extend mixins
 *
 * @property {Array.<object>} mixinExtended - A list of ecma5-extend extended mixins with init()/destroy() support
 *
 * @property {ecma5-extend.Object.PublicInterface} public - The public interface
 *
 * @property {ecma5-extend.Object.ProtectedInterface} protected - The protected interface
 *
 * @property {ecma5-extend.Object.PrivateInterface} private - The private interface
 *
 * @property {function} init - The constructor function
 *
 * @property {function} destroy - The destructor function
 *
 * @property {boolean} autoNotifyOnSet - Determines if a class's property setters will automatically publish
 * a propertyChanged event when the value is set. This does not affect the protected interface propertyChanged
 * API, which will be called regardless of this option. This value overrides the global value. (default: true)
 *
 */

/**
 * Callback for ecma5-extend events.
 * @callback EventCallback
 * @memberof ecma5-extend.Object
 * @param {ecma5-extend.Object.PublicInterface} object - The object from which the event was emitted
 * @param {*} value - The value associated with the event
 * @param {*} [oldvalue] - The old value associated with the event
 */

/**
 * The public interface of an ecma5-extend object
 *
 * @class PublicInterface
 * @memberof ecma5-extend.Object
 */

/**
 * The protected interface of an ecma5-extend object
 *
 * @class ProtectedInterface
 * @memberof ecma5-extend.Object
 *
 * @property {ecma5-extend.Object.PublicInterface} public The public interface of this object
 *
 */

/**
 * The private interface of an ecma5-extend object.
 *
 * @class PrivateInterface
 * @memberof ecma5-extend.Object
 *
 * @property {ecma5-extend.Object.PublicInterface} public The public interface of this ecma5-extend object
 * @property {ecma5-extend.Object.ProtectedInterface} protected The protected interface of this ecma5-extend object
 */

var NOTIFY_ALL = true;
var STATIC_IGNORE_NAMES = ['name', 'extend', 'extends', 'public', 'private', 'protected', 'init', 'destroy', 'mixin', 'mixins', 'tagName', 'tagname', 'mixinExtended', 'autoNotifyOnSet'];

var objectCount = 1;
var definitionCount = 1;

var exports = {
    memoryLeakWarnings : true,
    memoryLeakProtector : false,
    autoNotifyOnSet : true
};
var typeRegistry = {};

// TODO: add test for this
var badDefineProperty = false;

if ( typeof Object.setPrototypeOf === "undefined") {
    Object.defineProperties(Object, {
        "getPrototypeOf" : {
            value : function getPrototypeOf(object) {
                /* jshint ignore:start */
                return object.__proto__;
                /* jshint ignore:end */
            }
        },
        "setPrototypeOf" : {
            value : function setPrototypeOf(object, proto) {
                /* jshint ignore:start */
                object.__proto__ = proto;
                /* jshint ignore:end */
            }
        }
    });
}

/************************* per-type functions go here ************************/
/**
 * Access the super-class implementation of functions via `super.protected` and `super.public`.
 * Each function calls the super-class implementation of `methodname` within the respective scope.
 *
 * @member {Object} super
 * @memberof ecma5-extend.Object.PrivateInterface#
 *
 * @property {function} public(methodname,...) Calls the super-class pubilc implementation of `methodname`
 * *Throws **`TypeError`** if a public super method `methodname` does not exist*
 * @property {function} protected(methodname,...) Calls the super-class protected implementation of `methodname`
 * *Throws **`TypeError`** if a protected super method `methodname` does not exist*
 */
var defineSuper = function(prototype, scope) {
    return function getSuper(methodName) {
        var _this = this.object;
        var _super = Object.getPrototypeOf(prototype)[methodName];
        if (!_super) {
            throw new TypeError(_this.public.constructor.name + "." + scope + "." + methodName + " does not have a super method");
        }
        return _super.apply(_this.public, Array.prototype.slice.call(arguments, 1));
    };
};

/**
 * Returns the private object from a public instance of that object.
 *
 * @memberof ecma5-extend.Object.PrivateInterface#
 *
 * @param {ecma5-extend.Object.PublicInterface} object - An object of this type
 * @returns {ecma5-extend.Object.PrivateInterface} The private object
 */
var getPrivate = function getPrivate(object) {
    return Object.getPrototypeOf(this).privateRegistry[object.__id];
};

var defineSubscribe = function(privateRegistry) {
    /**
     * Subscribe to an event with a callback (Overridable)
     *
     * @public
     * @memberof ecma5-extend.Object.PublicInterface#
     *
     * @param {string} eventName - The event name
     * @param {ecma5-extend.Object.EventCallback} callback - The callback to bind to the event.
     */
    return function subscribe(eventName, callback, id) {
        var priv = privateRegistry[this.__id];
        if (!priv.__subscribers__) {
            priv.__subscribers__ = {};
        }
        if (!priv.__subscribers__[eventName]) {
            priv.__subscribers__[eventName] = [];
        }
        priv.__subscribers__[eventName].push({
            id : id || null,
            fn : callback
        });
    };
};

var defineUnsubscribe = function(privateRegistry) {
    /**
     * Unsubscribe to an event with a callback (Overridable)
     *
     * @public
     * @memberof ecma5-extend.Object.PublicInterface#
     *
     * @param {string} eventName - The event name
     * @param {ecma5-extend.Object.EventCallback} - The callback to unbind from the event.
     */
    return function unsubscribe(eventName, callback, id) {
        var priv = privateRegistry[this.__id];
        if (!priv.__subscribers__) {
            return;
        }
        var eventGroup = priv.__subscribers__[eventName];
        if (eventGroup) {
            for (var i = 0; i < eventGroup.length; i++) {
                var singleEvent = eventGroup[i];
                if (id && singleEvent.id && singleEvent.id === id) {
                    eventGroup.splice(i, 1);
                    i -= 1;
                } else if (callback && singleEvent.fn && singleEvent.fn === callback) {
                    eventGroup.splice(i, 1);
                    i -= 1;
                }
            }
        }
    };
};

var definePublish = function(privateRegistry) {
    /**
     * Publish implementation called by {@link ecma5-extend.Object.PublicInterface#publish PublicInterface.publish} (Overridable)
     *
     * ##### Behavior #####
     * Before publishing an event, this function will look for a protected-interface method
     * with the same name as the event and call it with newValue and oldValue.
     * If this method returns true, **the event will be cancelled**.
     *
     * @memberof ecma5-extend.Object.ProtectedInterface#
     *
     * @param {string} eventName - The name of the event
     * @param {*} value - The new value associated with the event
     * @param {*} [oldvalue] - The old value associated with the event
     * @returns {boolean} If the event was cancelled
     */

    return function publish(eventName, newValue, oldValue) {
        var priv = privateRegistry[this.public.__id];
        if ( typeof priv.protected[eventName] === "function") {
            var cancel = priv.protected[eventName](newValue, oldValue);
            if (cancel) {
                return true;
            }
        }
        if (priv.__subscribers__ && priv.__subscribers__[eventName]) {
            var listeners = priv.__subscribers__[eventName].slice();
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if ( typeof listener.fn === "function") {
                    listener.fn.call(this.public, newValue, oldValue);
                }
            }
        }
        return false;
    };
};

var definePublicPublishNotify = function(privateRegistry) {
    /**
     * Publish an event on the object. For default behavior see {@link ecma5-extend.Object.ProtectedInterface#publish Object.publish}.
     *
     * @memberof ecma5-extend.Object.PublicInterface#
     *
     * @param {string} eventName - The name of the event
     * @param {*} value - The new value associated with the event
     * @param {*} [oldvalue] - The old value associated with the event
     * @returns {boolean} If the event was cancelled
     */
    return function publish(eventName, newValue, oldValue) {
        var priv = privateRegistry[this.__id];
        return priv.protected.publish(eventName, newValue, oldValue);
    };
};
var definePublicPublish = function(privateRegistry) {
    return function publish(eventName, newValue, oldValue) {
        var priv = privateRegistry[this.__id];
        return priv.protected.publish(eventName, newValue, oldValue);
    };
};

var defineCallMethod = function(privateRegistry, fcn) {
    return function callMethod() {
        //TODO investigate race condition
        if (!privateRegistry[this.__id]) {
            console.error('callMethod - privateRegistry[this.__id] is undefined', privateRegistry, this);
        }
        return fcn.apply(privateRegistry[this.__id], arguments);
    };
};

var defineGetAccessorProperty = function(privateRegistry, get) {
    return function getProperty() {
        return get.call(privateRegistry[this.__id]);
    };
};

var defineGetProperty = function(privateRegistry, propertyName) {
    return function getProperty() {
        return privateRegistry[this.__id][propertyName];
    };
};

var defineSetPublicAccessorPropertyNotify = function(privateRegistry, set, notifyKey) {
    return function setProperty(value) {
        var priv = privateRegistry[this.__id];
        //if (get)
        //  var oldValue = get.call(priv);
        set.call(priv, value);
        if ( typeof priv.protected[notifyKey] === "function") {
            priv.protected[notifyKey](value);
        }
        priv.protected.publish(notifyKey, value);
    };
};
var defineSetPublicAccessorProperty = function(privateRegistry, set, notifyKey) {
    return function setProperty(value) {
        var priv = privateRegistry[this.__id];
        //if (get)
        //  var oldValue = get.call(priv);
        set.call(priv, value);
        if ( typeof priv.protected[notifyKey] === "function") {
            priv.protected[notifyKey](value);
        }
        priv.protected.publish(notifyKey, value);
    };
};

var defineSetProtectedAccessorProperty = function(privateRegistry, set, notifyKey) {
    return function setProperty(value) {
        var priv = privateRegistry[this.__id];
        set.call(priv, value);
        /*if ( typeof priv.protected[notifyKey] === "function")
         priv.protected[notifyKey](value, oldValue);*/
    };
};

var defineSetAccessorProperty = function(privateRegistry, set) {
    return function setProperty(value) {
        set.call(privateRegistry[this.__id], value);
    };
};

var defineSetPublicPropertyNotify = function(privateRegistry, key) {
    var notifyKey = key + "Changed";
    return function setProperty(value) {
        var priv = privateRegistry[this.__id];
        var oldValue = priv[key];
        priv[key] = value;
        if ( typeof priv.protected[notifyKey] === "function") {
            priv.protected[notifyKey](value, oldValue);
        }
        priv.protected.publish(notifyKey, value, oldValue);
    };
};
var defineSetPublicProperty = function(privateRegistry, key) {
    var notifyKey = key + "Changed";
    return function setProperty(value) {
        var priv = privateRegistry[this.__id];
        var oldValue = priv[key];
        priv[key] = value;
        if ( typeof priv.protected[notifyKey] === "function") {
            priv.protected[notifyKey](value, oldValue);
        }
    };
};

var defineSetProperty = function(privateRegistry, key) {
    return function setProperty(value) {
        privateRegistry[this.__id][key] = value;
    };
};

var defineInit = function(privateRegistry, init, _super, name, mixins, mixinExtended) {
    /**
     * Initialize an elsa object (Overridable)
     * @function initialize
     * @memberof ecma5-extend.Object.ProtectedInterface#
     */
    return function callInit() {
        var i, len;
        //console.log(definition.name + ": callInit");
        if ( typeof _super === "function") {
            _super.apply(this, arguments);
        }

        if (mixins) {
            len = mixins.length;
            for ( i = 0; i < len; i++) {
                mixins[i].apply(this.public, arguments);
            }
        }

        var priv = privateRegistry[this.public.__id];
        if (mixinExtended) {
            len = mixinExtended.length;
            for ( i = 0; i < len; i++) {
                mixinExtended[i].init.apply(priv, arguments);
            }
        }

        if ( typeof init === "function") {
            init.apply(priv, arguments);
        }
    };
};

var destroyObjectProperties = function(priv, type) {
    if (exports.memoryLeakWarnings || exports.memoryLeakProtector) {
        Object.getOwnPropertyNames(priv).forEach(function(key) {
            var value = priv[key];
            if (value && typeof value === "object") {
                if (exports.memoryLeakWarnings) {
                    console.warn("ecma5-extend.memoryLeakWarning " + type.name + "." + key + " = " + (value.tagName ? "<" + value.tagName.toLowerCase() + ">" : value));
                }
                if (exports.memoryLeakProtector) {
                    Object.defineProperty(priv, key, {
                        value : undefined
                    });
                }
            }
        }, this);
    }
};

var defineDestroy = function(privateRegistry, destroy, _super, publicPrototype, mixinExtended) {
    /**
     * Destroy an elsa object (Overridable)
     * @function destroy
     * @memberof ecma5-extend.Object.ProtectedInterface#
     */
    return function callDestroy() {
        var priv = privateRegistry[this.__id];
        if (!priv) {
            return;
        }

        if (destroy) {
            destroy.call(priv);
        }

        if (mixinExtended) {
            var len = mixinExtended.length;
            for (var i = 0; i < len; i++) {
                mixinExtended[i].destroy.call(priv);
            }
        }

        if (_super) {
            _super.call(this);
        }

        // we are is the 'final' type
        if (Object.getPrototypeOf(this) === publicPrototype) {
            Object.defineProperties(priv.protected, {
                "public" : {
                    value : undefined
                }
            });
            destroyObjectProperties(priv.protected, publicPrototype);
            Object.setPrototypeOf(priv.protected, Object.prototype);

            Object.defineProperties(priv.public, {
                "__id" : {
                    value : undefined
                }
            });

            if (HTMLElement.prototype.isPrototypeOf(priv.public)) {
                // Here we remove our proto hooks and restore the normal DOM
                var proto = Object.getPrototypeOf(priv.public);
                while ( typeof proto.constructor.extend === "function" && typeof proto.constructor.tagName === "string") {
                    proto = Object.getPrototypeOf(proto);
                }
                Object.setPrototypeOf(priv.public, proto);
            } else {
                Object.setPrototypeOf(priv.public, Object.prototype);
            }
        }
        Object.defineProperties(priv, {
            "protected" : {
                value : undefined
            },
            "public" : {
                value : undefined
            },
            "__subscribers__" : {
                value : undefined
            }
        });
        destroyObjectProperties(priv, publicPrototype.constructor);
        Object.setPrototypeOf(priv, Object.prototype);
        delete privateRegistry[this.__id];
    };
};

// ---------------------------------------------------------
var propertyDescriptorNames = ["configurable", "enumerable", "writable", "set", "get", "value", "publish"];
var isPropertyDescriptor = function(obj) {
    if ( typeof obj !== "object" || obj === null) {
        return false;
    }

    var keys = Object.getOwnPropertyNames(obj);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (propertyDescriptorNames.indexOf(key) === -1) {
            return false;
        }
    }
    return (keys.length > 0);
};

var extendMixin = function(mixin) {
    var okeys = Object.keys(Object.prototype);
    var src = mixin.prototype || mixin;
    Object.keys(src).forEach(function(key) {
        if (okeys.indexOf(key) !== -1) {
            return;
        }
        var value = src[key];
        var isFunction = typeof value === "function";
        this[key] = Object.getOwnPropertyDescriptor(src, key) || {
            configurable : true,
            writable : true,
            enumerable : !isFunction,
            value : value
        };
    }, this);
};

var extendSimpleScope = function(definitionObj, propertyDescriptors, protectedPrototype, publicPrototype, ignore) {
    ignore = ignore || [];
    Object.getOwnPropertyNames(definitionObj).forEach(function(key) {
        if (ignore.indexOf(key) === -1) {
            var defn = definitionObj[key];
            if (isPropertyDescriptor(defn)) {
                propertyDescriptors[key] = defn;
            } else {
                propertyDescriptors[key] = {
                    configurable : true,
                    writable : true,
                    enumerable : true,
                    value : defn
                };
            }
        }
    });

    var _super = {};
    Object.defineProperties(_super, {
        "public" : {
            value : defineSuper(publicPrototype, "public"),
            writable : false
        },
        "protected" : {
            value : defineSuper(protectedPrototype, "protected"),
            writable : false
        }
    });
    propertyDescriptors["super"] = {
        get : function() {
            _super.object = this;
            return _super;
        }
    };
    propertyDescriptors.getPrivate = {
        value : getPrivate
    };
};

var addExtendedMixins = function(definition) {
    var mixin, name, len = definition.mixinExtended.length;
    for (var i = 0; i < len; i++) {
        mixin = definition.mixinExtended[i];
        for (name in mixin.public) {
            definition.public[name] = mixin.public[name];
        }
        for (name in mixin.protected) {
            if (!( name in definition.protected)) {
                definition.protected[name] = mixin.protected[name];
            }
        }
        for (name in mixin.private) {
            if (!( name in definition.private)) {
                definition.private[name] = mixin.private[name];
            }
        }
    }
};

/*
 * build a scope prototype from its definition
 * auto-fill ECMA5 descriptors
 * build inheritence links
 */
var extendScope = function(definition, scope, baseType, privateDefn, privateRegistry, ultimateType) {
    var scopeDefn = {}, obj;

    if (!baseType) {
        obj = {};
    } else if (scope === "protected") {
        if ( typeof baseType.extend === "function") {
            obj = baseType.extend({});
        } else {
            obj = {};
        }
    } else {
        obj = Object.create(baseType.prototype);
    }

    var autoNotifyOnSet = "autoNotifyOnSet" in definition ? definition.autoNotifyOnSet : exports.autoNotifyOnSet;

    Object.getOwnPropertyNames(definition[scope]).forEach(function(key) {
        if (key === "constructor" && scope === "public") {
            return;
        } else if (key === "public" && (scope === "protected" || scope === "private")) {
            return;
        } else if (key === "protected" && scope === "private") {
            return;
        }

        var defn = definition[scope][key];
        if (!isPropertyDescriptor(defn)) {
            var isFunction = typeof defn === "function";
            scopeDefn[key] = defn = {
                configurable : false,
                enumerable : !isFunction,
                writable : !isFunction, // && defn !== undefined && defn !== null
                value : defn
            };
        }
        if ( typeof defn.value === "function") {
            var callMethod = defineCallMethod(privateRegistry, defn.value);
            scopeDefn[key] = {
                enumerable : defn.enumerable || false,
                configurable : defn.configurable || false,
                writable : defn.writable || false,
                value : callMethod
            };
            return;
        }

        var descriptor = scopeDefn[key] = {
            enumerable : defn.enumerable !== false,
            configurable : defn.configurable || false,
        };
        var get, set, notifyKey = key + "Changed";

        if (defn.hasOwnProperty("get")) {
            get = defn.get;
            descriptor.get = defineGetAccessorProperty(privateRegistry, get);
        }
        if (defn.hasOwnProperty("set")) {
            if (!defn.hasOwnProperty("get")) {
                descriptor.get = defineGetProperty(privateRegistry, key);
            }

            set = defn.set;
            if (defn.publish || NOTIFY_ALL) {
                if (scope === "public") {
                    descriptor.set = (autoNotifyOnSet ? defineSetPublicAccessorPropertyNotify : defineSetPublicAccessorProperty)(privateRegistry, set, notifyKey);
                } else {
                    descriptor.set = defineSetProtectedAccessorProperty(privateRegistry, set, notifyKey);
                }
            } else {
                descriptor.set = defineSetAccessorProperty(privateRegistry, set);
            }
        }
        if ( typeof get === "undefined" && typeof set === "undefined") {
            privateDefn[key] = {
                configurable : true,
                writable : true,
                enumerable : true,
                value : defn.value
            };
            descriptor.get = defineGetProperty(privateRegistry, key);
            if (defn.writable !== false) {
                if (defn.publish || NOTIFY_ALL) {
                    if (scope === "public") {
                        descriptor.set = (autoNotifyOnSet ? defineSetPublicPropertyNotify : defineSetPublicProperty)(privateRegistry, key);
                    } else {
                        descriptor.set = defineSetProperty(privateRegistry, key);
                    }
                } else {
                    descriptor.set = defineSetProperty(privateRegistry, key);
                }
            }
        }
    });

    if (ultimateType) {
        if (scope === "public" && (!scopeDefn.subscribe || !scopeDefn.unsubscribe)) {
            scopeDefn.subscribe = {
                enumerable : false,
                configurable : false,
                writable : false,
                value : defineSubscribe(privateRegistry)
            };
            scopeDefn.unsubscribe = {
                enumerable : false,
                configurable : false,
                writable : false,
                value : defineUnsubscribe(privateRegistry)
            };
        } else if (scope === "protected" && !scopeDefn.publish) {
            scopeDefn.publish = {
                enumerable : false,
                configurable : false,
                writable : false,
                value : definePublish(privateRegistry)
            };
        }
        if (scope === "public" && !scopeDefn.publish) {
            scopeDefn.publish = {
                enumerable : false,
                configurable : false,
                writable : false,
                value : (autoNotifyOnSet ? definePublicPublishNotify : definePublicPublish)(privateRegistry)
            };
        }
    }

    var mixins;
    if (definition.mixin) {
        mixins = Array.isArray(definition.mixin) ? definition.mixin : [definition.mixin];
    }

    if (scope === "protected") {
        scopeDefn.init = {
            value : defineInit(privateRegistry, definition.init, (Object.getPrototypeOf(obj) || Object).init, definition.name, mixins, definition.mixinExtended)
        };
    } else if (scope === "public") {
        scopeDefn.destroy = {
            value : defineDestroy(privateRegistry, definition.destroy, (Object.getPrototypeOf(obj) || Object).destroy, obj, definition.mixinExtended)
        };
        if (definition.mixin) {
            mixins = Array.isArray(definition.mixin) ? definition.mixin : [definition.mixin];
            mixins.forEach(extendMixin, scopeDefn);
        }
    }

    Object.defineProperties(obj, scopeDefn);

    return obj;
};

var isHTMLType = function(object) {
    if (typeof window === "undefined" || typeof window.Node === "undefined" || typeof object === "undefined") {
        return false;
    }
    return (object instanceof window.Node);
};

// Used to resolve the internal `[[Class]]` of values
var toString = Object.prototype.toString;

// Used to resolve the decompiled source of functions
var fnToString = Function.prototype.toString;

// Used to detect host constructors (Safari > 4; really typed array specific)
var reHostCtor = /^\[object .+?Constructor\]$/;

// Compile a regexp using a common native method as a template.
// We chose `Object#toString` because there's a good chance it is not being mucked with.
var reNative = RegExp('^' +
    // Coerce `Object#toString` to a string
    String(toString)
    // Escape any special regexp characters
    .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
    // Replace mentions of `toString` with `.*?` to keep the template generic.
    // Replace thing like `for ...` to support environments like Rhino which add extra info
    // such as method arity.
    .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

var isNative = function(value) {
    var type = typeof value;
    return type === 'function' ?
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        reNative.test(fnToString.call(value)) :
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        (value && type === 'object' && reHostCtor.test(toString.call(value))) || false;
};

var EXTEND_ORACLE = "75E3BA8C-63AF-45DE-85C3-260FF96453B9";
var defineTypeProperties = function defineTypeProperties(desc, publicPrototype, protectedPrototype, privatePrototype) {
    var self = desc.self;
    var extend;
    if (desc.final !== true) {
        extend = function(properties) {
            return Object.create(protectedPrototype, properties || {});
        };
    } else {
        extend = function() {};
    }
    Object.defineProperty(extend, " oracle ", {
        value : EXTEND_ORACLE
    });
    return {
        create : {
            /**
             * Create an instance of this type.
             * @method create
             * @memberof ecma5-extend.Type#
             * @param  {...*} [arguments] Initialization arguments to be passed to the type init() function
             * @return {ecma5-extend.Object} An initialized ecma5-extend object
             */
            value : function() {
                var iPublic;
                var args = Array.prototype.slice.call(arguments);
                var RootType = desc ? desc.baseType : undefined;
                while (RootType && typeof RootType.extend === "function" && RootType.extend[' oracle '] === EXTEND_ORACLE) {
                    var proto = Object.getPrototypeOf(RootType.prototype);
                    RootType = proto ? proto.constructor : undefined;
                }

                if (RootType && isHTMLType(RootType.prototype)) {
                    iPublic = document.createElement(this.tagName);
                    if (iPublic.prototype !== publicPrototype) {
                        // what, no custom elements ?
                        Object.setPrototypeOf(iPublic, publicPrototype);
                    }
                } else {
                    iPublic = Object.create(publicPrototype);
                    if (typeof RootType === 'function') {
                        if (isNative(RootType)) {
                            // this type requires `new` to construct
                            iPublic = new (Function.prototype.bind.apply(RootType, [RootType].concat(args)))();
                            Object.setPrototypeOf(iPublic, publicPrototype);
                        } else {
                            // if you want to use `new`, use ecma5-extend.Type.upgrade(new Something())
                            RootType.apply(iPublic, arguments);
                        }
                    }
                }
                args.unshift(iPublic);
                return self.initialize.apply(self, args);
            }
        },

        upgrade : {
            /**
             * Upgrades an object of a type from which this type ultimately inherits, and initializes it.
             * Example: CustomEvent or HTMLElement DOM types
             *
             * @method upgrade
             * @memberof ecma5-extend.Type#
             * @param  {object} Object An instance of a type from which this type ultimately inherits
             * @param  {...*} [arguments] Initialization arguments to be passed to the type init() function
             * @return {ecma5-extend.Object} An initialized ecma5-extend object
             */
            value : function(iPublic) {
                Object.setPrototypeOf(iPublic, publicPrototype);
                return self.initialize.apply(self, arguments);
            }
        },

        initialize : {
            /**
             * Initializes an object of this type
             * Example: Object.create(ecmae-extend.Type.prototype) or custom-elements
             *
             * @method initialize
             * @memberof ecma5-extend.Type#
             * @param  {object} Object An un-initialized object of this type
             * @param  {...*} [arguments] Initialization arguments to be passed to the type init() function
             * @return {ecma5-extend.Object} An initialized ecma5-extend object
             */
            value : function(iPublic) {
                if (self.prototype.isPrototypeOf(this.public)) {
                    /* chain to base clase: this === iProtected */
                    if (desc.baseType && typeof desc.baseType.extend === "function" && desc.baseType.extend[' oracle '] === EXTEND_ORACLE) {
                        desc.baseType.initialize.apply(this, arguments);
                    }

                    var iPrivate = Object.create(privatePrototype, {
                        "protected" : {
                            enumerable : true,
                            writable : badDefineProperty,
                            configurable : true,
                            value : this
                        },
                        "public" : {
                            enumerable : true,
                            writable : badDefineProperty,
                            configurable : true,
                            value : this.public
                        }
                    });

                    desc.privateRegistry[this.public.__id] = iPrivate;
                } else {
                    /* we are the final type */
                    if (iPublic.__id) {
                        console.warn('ecma5-extend: object is already initialized', iPublic);
                        return iPublic;
                    }

                    var __id = objectCount++;
                    Object.defineProperty(iPublic, "__id", {
                        configurable : true,
                        writable : false,
                        enumerable : false,
                        value : __id
                    });

                    var iProtected = Object.create(protectedPrototype, {
                        "public" : {
                            enumerable : true,
                            writable : badDefineProperty,
                            configurable : true,
                            value : iPublic
                        },
                        "__id" : {
                            configurable : true,
                            writable : false,
                            enumerable : false,
                            value : __id
                        }
                    });

                    var args = Array.prototype.slice.call(arguments, 1);

                    // call the branch below to chain up the extend type hierarchy to create private objects
                    self.initialize.apply(iProtected, args);

                    // run the type initialization code (chains through the types)
                    iProtected.init.apply(iProtected, args);

                    return iPublic;
                }
            }
        },
        extend : {
            value : extend
        },
        "prototype" : {
            enumerable : true,
            writable : false,
            configurable : false,
            value : publicPrototype
        },
        constructor : {
            configurable : false,
            writable : false,
            enumerable : false,
            value : Object.create({}, {
                "name" : {
                    configurable : false,
                    writable : false,
                    enumerable : false,
                    value : "Type<" + desc.name + ">"
                }
            })
        },
        /**
         * The name of this type
         * @constant {string} name
         * @memberof ecma5-extend.Type#
         */
        "name" : {
            enumerable : true,
            value : desc.name
        },
        /*"__definition__" : {
         value : definition
         }*/
    };
};

var defineTypeGetPrivate = function(publicPrototype, privateRegistry) {
    return function(object) {
        if (!publicPrototype.isPrototypeOf(object)) {
            throw TypeError("object " + object.constructor.name + " is not of type " + publicPrototype.constructor.name);
        }
        return privateRegistry[object.__id];
    };
};

/**
 * check if an object is an ecma5-extend type
 *
 * @instance
 * @param {Object} type - an object that may be an ecma5-extend type
 * @returns {Boolean}
 */
var isType = function isType(type) {
    if ( typeof type.extend === "function") {
        return type.extend[' oracle '] === EXTEND_ORACLE;
    } else {
        return false;
    }
};

/**
 * <p>Build a type from a compiled type definition</p>
 * <p>Type definitions have a custom object format that uses ECMA5 style scope definitions
 * as well as several short-forms (all parameters are optional)</p>
 *
 * @instance
 * @param {object} type definition - extend class definition created by the extend compiler
 * @returns {type}
 *
 * @example
 *
 * ecma5_extend.createType({
 *     name : "mycustomtype",
 *     extends : Object,
 *     private : {
 *         // private scope definition
 *     },
 *     protected : {
 *         // protected scope definition
 *     },
 *     public : {
 *         // public scope definition
 *     },
 *     init : function() {
 *     },
 *     destroy : fuction() {
 *     }
 * });
 */
var createType = function(definition) {
    if (definition.__id) {
        return typeRegistry[definition.__id];
    }
    var privateRegistry = {}, privateDefn = {}, privatePrototype = {}, protectedPrototype, publicPrototype;
    var self, baseType = null, ultimateType = true;
    var baseTypeDefinition = definition.extend;

    Object.defineProperties(definition, {
        "__id" : {
            writable : false,
            configurable : false,
            enumerable : false,
            value : definitionCount++
        }
    });

    if (!baseTypeDefinition) {
        self = {};
    } else if ( typeof baseTypeDefinition.create === "function" && baseTypeDefinition !== Object) {
        baseType = baseTypeDefinition;
        self = Object.create(baseType);
        ultimateType = false;
    } else if (isHTMLType(baseTypeDefinition)) {
        baseType = baseTypeDefinition;
        self = {};
    } else if ( typeof baseTypeDefinition === "function") {
        baseType = baseTypeDefinition;
        self = {};
    } else if ( typeof baseTypeDefinition === "string") {
        baseType = document.createElement(baseTypeDefinition).constructor;
        self = {};
        self.tagName = baseTypeDefinition.toUpperCase();
    } else {
        // lets hope what you gave me is a valid baseType
        baseType = baseTypeDefinition;
        self = {};
    }
    if (baseType && isHTMLType(baseType.prototype)) {
        self.tagName = (definition.tagName || "EL-" + definition.name).toUpperCase();
    }
    typeRegistry[definition.__id] = self;

    definition.public = definition.public || {};
    definition.protected = definition.protected || {};
    definition.private = definition.private || {};

    if (definition.mixinExtended) {
        addExtendedMixins(definition);
    }

    Object.defineProperties(privatePrototype, {
        "privateRegistry" : {
            value : privateRegistry
        }
    });
    protectedPrototype = extendScope(definition, "protected", baseType, privateDefn, privateRegistry, ultimateType);
    publicPrototype = extendScope(definition, "public", baseType, privateDefn, privateRegistry, ultimateType);

    // public/protected extendScope MUST be before this ??
    extendSimpleScope(definition.private, privateDefn, protectedPrototype, publicPrototype);
    Object.defineProperties(privatePrototype, privateDefn);

    var typeDescriptor = {};
    extendSimpleScope(definition, typeDescriptor, protectedPrototype, publicPrototype, STATIC_IGNORE_NAMES);
    Object.defineProperties(self, typeDescriptor);

    // TODO: pull these out for scope save reduction
    Object.defineProperties(self, defineTypeProperties({
        self : self,
        name : definition.name,
        privateRegistry : privateRegistry,
        baseType : baseType,
        final : definition.final
    }, publicPrototype, protectedPrototype, privatePrototype));

    Object.defineProperties(publicPrototype, {
        constructor : {
            configurable : true,
            writable : false,
            enumerable : false,
            value : self
        }
    });

    Object.defineProperties(definition, {
        getPrivate : {
            writable : false,
            configurable : false,
            enumerable : false,
            value : defineTypeGetPrivate(publicPrototype, privateRegistry)
        }
    });

    // Note : enable these to peer into 'forbidden' scopes
    //self.private = privatePrototype;
    //self.protected = protectedPrototype;

    return self;
};

module.exports = exports;
Object.defineProperties(module.exports, {
    createType : {
        enumerable : true,
        value : createType
    },
    isType : {
        enumerable : true,
        value : isType
    }
});

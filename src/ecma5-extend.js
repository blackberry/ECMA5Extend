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
 */

/**
 * The common interface shared by every ecma5-extend type.
 *
 * @class Type
 * @memberof ecma5-extend
 */

/**
 * @function create
 * @memberof ecma5-extend.Type#
 * @returns {ecma5-extend.Object} A new ecma5-extend object
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

var objectCount = 1;
var definitionCount = 1;

var exports = {
    memoryLeakWarnings : true,
    memoryLeakProtector : false
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

var getPublicSuper = function getPublicSuper(methodName) {
    var _this = this.object;
    var _super = _this.public[methodName].__super__;
    if (!_super) {
        throw new TypeError(_this.public.constructor.name + ".public." + methodName + " does not have a super method");
    }
    return _super.apply(_this.public, Array.prototype.slice.call(arguments, 1));
};

var getProtectedSuper = function getProtectedSuper(methodName) {
    var _this = this.object;
    var _super = _this.protected[methodName].__super__;
    if (!_super) {
        throw new TypeError(_this.public.constructor.name + ".protected." + methodName + " does not have a super method");
    }
    return _super.apply(_this.public, Array.prototype.slice.call(arguments, 1));
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

var definePublicPublish = function(privateRegistry) {
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

var defineCallMethod = function(privateRegistry, fcn) {
    return function callMethod() {
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

var defineSetPublicProperty = function(privateRegistry, key) {
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

var extendPrivateScope = function(definition, privateDefn) {
    Object.getOwnPropertyNames(definition.private).forEach(function(key) {
        var defn = definition.private[key];
        if (isPropertyDescriptor(defn)) {
            privateDefn[key] = defn;
        } else {
            privateDefn[key] = {
                configurable : true,
                writable : true,
                enumerable : true,
                value : defn
            };
        }
    });

    var _super = {};
    Object.defineProperties(_super, {
        "public" : {
            value : getPublicSuper,
            writable : false
        },
        "protected" : {
            value : getProtectedSuper,
            writable : false
        }
    });
    privateDefn["super"] = {
        get : function() {
            _super.object = this;
            return _super;
        }
    };
    privateDefn.getPrivate = {
        value : getPrivate
    };
};

var addExtencedMixins = function(definition) {
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
            var _super = Object.getPrototypeOf(obj)[key];
            if ( typeof _super === "function") {
                callMethod.__super__ = _super;
                //console.log("INSTALL SUPER " + definition.name + " " + scope + "." + key);
            }
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
                    descriptor.set = defineSetPublicAccessorProperty(privateRegistry, set, notifyKey);
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
                        descriptor.set = defineSetPublicProperty(privateRegistry, key);
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
                value : definePublicPublish(privateRegistry)
            };
        }
    }

    var mixins;
    if (definition.mixin) {
        mixins = Array.isArray(definition.mixin) ? definition.mixin : [definition.mixin];
    }

    if (scope === "protected") {
        scopeDefn.init = {
            value : defineInit(privateRegistry, definition.init, Object.getPrototypeOf(obj).init, definition.name, mixins, definition.mixinExtended)
        };
    } else if (scope === "public") {
        scopeDefn.destroy = {
            value : defineDestroy(privateRegistry, definition.destroy, Object.getPrototypeOf(obj).destroy, obj, definition.mixinExtended)
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
    if ( typeof window === "undefined" || typeof window.Node === "undefined" || typeof object === "undefined") {
        return false;
    }
    return (object.prototype instanceof window.Node || object instanceof window.Node);
};

var defineTypeProperties = function defineTypeProperties(desc, publicPrototype, protectedPrototype, privatePrototype) {
    var self = desc.self;
    return {
        create : {
            /**
             * Create an instance of this type.
             * @name create
             * @memberof ecma5-extend.Type#
             */
            value : function() {
                var args = Array.prototype.slice.apply(arguments);
                var iPublic;

                if (this === self) {
                    var __id = objectCount++;
                    if (isHTMLType(args[0]) && isHTMLType(publicPrototype)) {
                        iPublic = args[0];
                        args = args.slice(1);
                        if (Object.getPrototypeOf(iPublic) !== publicPrototype) {
                            Object.setPrototypeOf(iPublic, publicPrototype);
                        }
                    } else if (this.tagName !== undefined) {
                        iPublic = document.createElement(this.tagName);
                        Object.setPrototypeOf(iPublic, publicPrototype);
                    } else {
                        iPublic = Object.create(publicPrototype);
                    }
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

                    var instance = self.create.apply(iProtected, args);
                    iProtected.init.apply(iProtected, args);
                    return instance;
                } else {
                    /* chain to base clase: this === iProtected */
                    if (desc.baseType && typeof desc.baseType.extend === "function") {
                        desc.baseType.create.apply(this, args);
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
                    return this.public;
                }
            }
        },
        extend : {
            value : function(properties) {
                return Object.create(protectedPrototype, properties || {});
            }
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

/**
 * check if an object is an ecma5-extend type
 *
 * @instance
 * @param {Object} type - an object that may be an ecma5-extend type
 * @returns {Boolean}
 */
var isType = function isType(type) {
    if ( typeof type.__id === "number") {
        return (typeRegistry[type.__id] === type);
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
    var privateRegistry = {};
    Object.defineProperties(definition, {
        "__id" : {
            writable : false,
            configurable : false,
            enumerable : false,
            value : definitionCount++
        },
        getPrivate : {
            writable : false,
            configurable : false,
            enumerable : false,
            value : function(object) {
                if (!publicPrototype.isPrototypeOf(object)) {
                    throw TypeError("object " + object.constructor.name + " is not of type " + publicPrototype.constructor.name);
                }
                return privateRegistry[object.__id];
            }
        }
    });

    var baseTypeDefinition = definition.extend;

    var baseType = null, self;
    var ultimateType = true;
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
    if (baseType && isHTMLType(baseType)) {
        self.tagName = "EL-" + definition.name.toUpperCase();
    }
    typeRegistry[definition.__id] = self;

    definition.public = definition.public || {};
    definition.protected = definition.protected || {};
    definition.private = definition.private || {};

    if (definition.mixinExtended) {
        addExtencedMixins(definition);
    }

    var privatePrototype = {}, privateDefn = {};
    Object.defineProperties(privatePrototype, {
        "privateRegistry" : {
            value : privateRegistry
        }
    });
    var protectedPrototype = extendScope(definition, "protected", baseType, privateDefn, privateRegistry, ultimateType);
    var publicPrototype = extendScope(definition, "public", baseType, privateDefn, privateRegistry, ultimateType);

    // public/protected extendScope MUST be before this ??
    extendPrivateScope(definition, privateDefn);
    Object.defineProperties(privatePrototype, privateDefn);

    // TODO: pull these out for scope save reduction
    Object.defineProperties(self, defineTypeProperties({
        self : self,
        name : definition.name,
        privateRegistry : privateRegistry,
        baseType : baseType
    }, publicPrototype, protectedPrototype, privatePrototype));

    Object.defineProperties(publicPrototype, {
        constructor : {
            configurable : true,
            writable : false,
            enumerable : false,
            value : self
        }
    });

    // TODO : remove for release 1
    self.private = privatePrototype;
    self.protected = protectedPrototype;

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

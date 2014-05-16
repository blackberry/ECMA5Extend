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
 * ECMA5Extend client-side module
 * @module ECMA5Extend
 */

var NOTIFY_ALL = true;

var objectCount = 1;
var definitionCount = 1;

var exports = {};
var typeRegistry = {};

// TODO: add test for this
var badDefineProperty = false;

if ( typeof Object.setPrototypeOf === "undefined") {
    Object.defineProperties(Object, {
        "getPrototypeOf" : {
            value : function getPrototypeOf(object) {
                return object.__proto__; // jshint ignore:line
            }
        },
        "setPrototypeOf" : {
            value : function setPrototypeOf(object, proto) {
                object.__proto__ = proto; // jshint ignore:line
            }
        }
    });
}

/* per-type functions go here */
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

var getPrivate = function getPrivate(obj) {
    return Object.getPrototypeOf(this).privateRegistry[obj.__id];
};

var defineSubscribe = function(privateRegistry) {
    return function(eventName, callback, id) {
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
    return function(eventName, listener, id) {
        var priv = privateRegistry[this.__id];
        var eventGroup = priv.__subscribers__[eventName];
        if (eventGroup) {
            for (var i = 0; i < eventGroup.length; i++) {
                var singleEvent = eventGroup[i];
                if (id && singleEvent.id && singleEvent.id === id) {
                    eventGroup.splice(i, 1);
                    i -= 1;
                } else if (listener && singleEvent.fn && singleEvent.fn === listener) {
                    eventGroup.splice(i, 1);
                    i -= 1;
                }
            }
        }
    };
};

var definePublish = function(privateRegistry) {
    return function(eventName, newValue, oldValue) {
        var priv = privateRegistry[this.public.__id];
        if ( typeof priv.protected[eventName] === "function") {
            priv.protected[eventName](newValue, oldValue);
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
    };
};

var definePublicPublish = function(privateRegistry) {
    return function(eventName, newValue, oldValue) {
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

var defineInit = function(privateRegistry, init, _super, name, mixins) {
    return function callInit() {
        //console.log(definition.name + ": callInit");
        if ( typeof _super === "function") {
            _super.apply(this, arguments);
        }

        if (mixins) {
            mixins.forEach(function(mixin) {
                mixin.apply(this.public, arguments);
            });
        }

        if ( typeof init === "function") {
            init.apply(privateRegistry[this.public.__id], arguments);
        }
    };
};

var defineDestroy = function(privateRegistry, destroy, _super, _public) {
    return function callDestroy() {
        var priv = privateRegistry[this.__id];
        if (!priv) {
            return;
        }

        if (destroy) {
            destroy.apply(priv, arguments);
        }
        if (_super) {
            _super.apply(this, arguments);
        }

        // we are is the 'final' type
        if (Object.getPrototypeOf(this) === _public) {            
            Object.defineProperties(priv.protected, {
                "public" : {
                    value : undefined
                }
            });

            Object.getOwnPropertyNames(priv.protected).forEach(function(key) {
                Object.defineProperty(priv.protected, key, {
                    value : undefined
                });
            });

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
            }
        });
        Object.getOwnPropertyNames(priv).forEach(function(key) {
            Object.defineProperty(priv, key, {
                value : undefined
            });
        });
        Object.setPrototypeOf(priv, Object.prototype);
        delete privateRegistry[this.__id];
    };
};

// ---------------------------------------------------------

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
    Object.getOwnPropertyNames(definition.private || {}).forEach(function(key) {
        var defn = definition.private[key];
        if (!(defn.value || defn.get || defn.set)) {
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
            value : getPublicSuper
        },
        "protected" : {
            value : getProtectedSuper
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

var propertyDescriptorNames = ["configurable", "enumerable", "writable", "set", "get", "value", "publish"];
var isPropertyDescriptor = function(obj) {
    if ( typeof obj !== "object" || obj === null) {
        return false;
    }

    var keys = Object.getOwnPropertyNames(obj);

    for (var i = 0; i < keys.length; i++) {
        if (i > propertyDescriptorNames.length) {
            return false;
        }

        var key = keys[i];
        if (propertyDescriptorNames.indexOf(key) === -1) {
            return false;
        }
    }
    return true;
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

    Object.getOwnPropertyNames(definition[scope] || {}).forEach(function(key) {
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
    if (scope === "protected") {
        if (definition.mixin) {
            mixins = Array.isArray(definition.mixin) ? definition.mixin : [definition.mixin];
            mixins = mixins.map(function(value) {
                if ( typeof value.constructor === "function") {
                    return value.constructor;
                }
                if ( typeof value === "function") {
                    return value;
                }
            }, scopeDefn);
        }
        scopeDefn.init = {
            value : defineInit(privateRegistry, definition.init, Object.getPrototypeOf(obj).init, definition.name, mixins)
        };
    } else if (scope === "public") {
        scopeDefn.destroy = {
            // TODO
            value : defineDestroy(privateRegistry, definition.destroy, Object.getPrototypeOf(obj).destroy, obj)
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
    return (object.prototype instanceof window.Node || object instanceof window.Node);
};


/**
 * check if an object is an ecma5-extend type
 * @static
 * @param {Object} type - an object that may be an ecma5-extend type
 * @returns {Boolean}
 */
var isType = function isType(type) {
    if (typeof type.__id === "number") {
        return (typeRegistry[type.__id] === type);
    } else {
        return false;
    }
};

/**
 * build a type from a compiled type definition
 * @static
 * @param {Object} definition - extend class definition created by the extend compiler
 * @returns {Type}
 */
var createType = function(definition) {
    if (definition.__id) {
        return typeRegistry[definition.__id];
    }
    Object.defineProperty(definition, "__id", {
        writable : false,
        configurable : false,
        enumerable : false,
        value : definitionCount++
    });

    var baseTypeDefinition = definition.extend;
    var baseType = null, _type;
    var ultimateType = true;
    if (!baseTypeDefinition) {
        _type = {};
    } else if ( typeof baseTypeDefinition.create === "function") {
        baseType = baseTypeDefinition;
        _type = Object.create(baseType);
        ultimateType = false;
    } else if (isHTMLType(baseTypeDefinition)) {
        baseType = baseTypeDefinition;
        _type = {};
    } else if ( typeof baseTypeDefinition === "function") {
        baseType = baseTypeDefinition;
        _type = {};
    } else if ( typeof baseTypeDefinition === "string") {
        baseType = document.createElement(baseTypeDefinition).constructor;
        _type = {};
        _type.tagName = baseTypeDefinition.toUpperCase();
    } else {
        // lets hope what you gave me is a valid baseType
        baseType = baseTypeDefinition;
        _type = {};
    }
    if (baseType && isHTMLType(baseType)) {
        _type.tagName = "EL-" + definition.name.toUpperCase();
    }
    typeRegistry[definition.__id] = _type;

    var _private = {}, privateRegistry = {}, privateDefn = {};
    Object.defineProperties(_private, {
        "privateRegistry" : {
            value : privateRegistry
        }
    });
    var _protected = extendScope(definition, "protected", baseType, privateDefn, privateRegistry, ultimateType);
    var _public = extendScope(definition, "public", baseType, privateDefn, privateRegistry, ultimateType);

    // public/protected extendScope MUST be before this ??
    extendPrivateScope(definition, privateDefn);
    Object.defineProperties(_private, privateDefn);

    // TODO: pull these out for scope save reduction
    Object.defineProperties(_type, {
        create : {
            value : function() {
                var args = Array.prototype.slice.apply(arguments);
                var iPublic;

                if (this === _type) {
                    var __id = objectCount++;
                    if (isHTMLType(args[0]) && isHTMLType(_public)) {
                        iPublic = args[0];
                        args = args.slice(1);
                        if (Object.getPrototypeOf(iPublic) !== _public) {
                            Object.setPrototypeOf(iPublic, _public);
                        }
                    } else if (this.tagName !== undefined) {
                        iPublic = document.createElement(this.tagName);
                        Object.setPrototypeOf(iPublic, _public);
                    } else {
                        iPublic = Object.create(_public);
                    }
                    Object.defineProperty(iPublic, "__id", {
                        configurable : true,
                        writable : false,
                        enumerable : false,
                        value : __id
                    });

                    var iProtected = Object.create(_protected, {
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

                    var instance = _type.create.apply(iProtected, args);
                    iProtected.init.apply(iProtected, args);
                    return instance;
                } else {
                    /* chain to base clase: this === iProtected */
                    if (baseType && typeof baseType.extend === "function") {
                        baseType.create.apply(this, args);
                    }

                    var iPrivate = Object.create(_private, {
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

                    privateRegistry[this.public.__id] = iPrivate;
                    return this.public;
                }
            }
        },
        extend : {
            value : function(properties) {
                return Object.create(_protected, properties || {});
            }
        },
        "prototype" : {
            enumerable : true,
            writable : false,
            configurable : false,
            value : _public
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
                    value : "Type<" + definition.name + ">"
                }
            })
        },
        "name" : {
            enumerable : true,
            value : definition.name
        },
        "__definition__" : {
            value : definition
        }
    });

    Object.defineProperties(_public, {
        constructor : {
            configurable : true,
            writable : false,
            enumerable : false,
            value : _type
        }
    });

    _type.private = _private;
    _type.protected = _protected;

    return _type;
};

module.exports = exports;
Object.defineProperties(module.exports, {
    createType : {
        enumerable : true,
        value : function(child, parent) {
            if (parent) {
                child.extend = createType(parent);
            }
            //else
            //child.extend = null;
            return createType(child);
        }
    },
    isType : {
        enumerable : true,
        value : isType
    }
});

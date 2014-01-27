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

    var createType = function(typeDefinition, name) {

        var newType = buildType(typeDefinition, name);
        buildPrototype(typeDefinition, newType);
        buildConstructor(typeDefinition, newType);

        return newType;
    };

    var recursiveInit = function(type, protected, args) {
        if (type.__proto__)
            recursiveInit(type.__proto__, protected, args);
        if (type.hasOwnProperty("init"))
            type.init.apply(protected, args);
    };

    var definePublicFunction = function(object, propertyName, value, instancePrivate, writable) {
        Object.defineProperty(object, propertyName, {
            enumerable : writable ? writable : false,
            writable : writable ? writable : false,
            configurable : true,
            value : function() {
                return value.apply(instancePrivate, arguments);
                //return instancePrivate[privatePropertyName](arguments);
            }
        });
    };

    var defineProtectedFunction = function(object, propertyName, value, instancePrivate, writable) {
        Object.defineProperty(object, propertyName, {
            configurable : true,
            enumerable : writable ? writable : false,
            writable : writable ? writable : false,
            value : function() {
                return value.apply(instancePrivate, arguments);
                //return instancePrivate[protectedPropertyName](arguments);
            }
        });

    };

    var definePostChainedFunction = function(object, propertyName, value, instancePrivate) {
        var wrapperFunction = function() {
            if (arguments[0] === 31415926)
                var result = value.apply(instancePrivate, arguments[1]);
            else
                var result = value.apply(instancePrivate, arguments);

            if (wrapperFunction.__proto__ !== definePostChainedFunction.__proto__)
                result = wrapperFunction.__proto__(31415926, result);
            return result;
        };
        if (object[propertyName]) {
            wrapperFunction.__proto__ = object[propertyName];
        }

        Object.defineProperty(object, propertyName, {
            configurable : true,
            value : wrapperFunction
        });
    };

    var definePreChainedFunction = function(object, propertyName, value, instancePrivate) {
        var wrapperFunction = function() {
            //console.log(arguments[0]);
            if (wrapperFunction.chained) {
                wrapperFunction.chained.apply(wrapperFunction, arguments);
            }
            return value.apply(instancePrivate, arguments);
        };
        if (object[propertyName]) {
            wrapperFunction.chained = object[propertyName];
        }

        Object.defineProperty(object, propertyName, {
            configurable : true,
            value : wrapperFunction
        });
    };

    var defineProperty = function(_this, propertyName, propertyValue) {
        var definition;
        _this[propertyName] = propertyValue;
        if (window.__debug)
            console.log("define property on " + propertyName + " = " + propertyValue);
        Object.defineProperty(_this.public, propertyName, {
            configurable : true,
            enumerable : true,
            get : function get() {
                return _this[propertyName];
            },
            set : function set(nValue) {
                var oldValue = _this[propertyName];
                if (nValue === oldValue) {
                    if (window.__debug)
                        console.log("Setting property to the same value. Ignoring");
                    return;
                }
                _this[propertyName] = nValue;
                //if (_this[propertyName] !== null && _this[propertyName] !== undefined) {

                var eventName = propertyName + "Changed";
                if (_this.public[eventName])
                    _this.public[eventName](nValue, oldValue);
                //internal notification
                if (_this[eventName])
                    _this[eventName](nValue, oldValue);
					
                if (_this.public.subscribers[eventName]) {
                    var listeners = _this.public.subscribers[eventName];
                    _.each(listeners, function(listener) {
                        if (_.isFunction(listener.fn))
                            listener.fn(nValue, oldValue);
                    });

                }

                if (window.__debug)
                    console.log("value of " + propertyName + " changed to " + _this[propertyName]);
            }
            // }
        });
    };

    var buildType = function(definition, name) {
        var type = definition.extend ? Object.create(definition.extend) : {};

        Object.defineProperties(type, {
            constructor : {
                value : Object.create(null, {
                    name : {
                        enumerable : true,
                        value : "Class<" + name + ">"
                    }
                })
            },
            name : {
                enumerable : true,
                value : name
            }
        });

        return type;
    };

    var buildPrototype = function(definition, newType) {
        var prototype = definition.extend ? Object.create(definition.extend.prototype) : {};
        Object.defineProperty(prototype, "constructor", {
            value : newType
        });

        Object.defineProperty(newType, "prototype", {
            enumerable : true,
            value : prototype
        });
    };

    var buildConstructor = function(definition, newType) {
        var public = definition.object.public;
        var protected = definition.object.protected;
        var private = definition.object.private;
        var objectInit = definition.object.init ? definition.object.init : function() {
        };
        var objectDestroy = definition.object.destroy ? definition.object.destroy : function() {
        };
        var _this = this;

        var create = function() {
            var instancePrivate = {};

            if (( typeof newType.__proto__.create) == "function") {
                var instanceProtected = newType.__proto__.create.call(this);
            } else {
                /* we are the base class */
                var instanceProtected = {};
                Object.defineProperty(instanceProtected, "public", {
                    configurable : true,
                    value : Object.create(this.prototype)
                });
            }

            if (window.__debug)
                console.log("CREATE " + newType.name);
            Object.defineProperties(instancePrivate, {
                protected : {
                    configurable : true,
                    value : instanceProtected
                },
                public : {
                    configurable : true,
                    value : instanceProtected.public
                }
            });

            // apply the private definition to instancePrivate
            for (var propertyName in private) {
                var value = private[propertyName];
                var notFunction = ( typeof private[propertyName]) !== "function";
                if (notFunction) {
                    Object.defineProperty(instancePrivate, propertyName, {
                        configurable : true,
                        writable : true,
                        value : private[propertyName]
                    });
                } else {
                    Object.defineProperty(instancePrivate, propertyName, {
                        configurable : true,
                        enumerable : false,
                        writable : false,
                        value : private[propertyName]
                    });
                }
            }

            // apply the protected definition to instancePrivate.protected
            for (var propertyName in protected) {
                var notFunction = ( typeof protected[propertyName]) !== "function";
                var value = protected[propertyName];
                if (notFunction) {
                    Object.defineProperty(instancePrivate.protected, propertyName, {
                        configurable : true,
                        enumerable : notFunction,
                        writable : notFunction,
                        value : protected[propertyName]
                    });
                } else {
                    defineProtectedFunction(instancePrivate.protected, propertyName, value, instancePrivate);
                }
            }

            // apply the public definition to instancePrivate.public
            for (var propertyName in public) {
                var notFunction = ( typeof public[propertyName]) !== "function";
                var value = public[propertyName];
                if (notFunction && value && value.get) {
                	(function(instancePrivate, propertyName, value) {
	                    Object.defineProperty(instancePrivate.public, propertyName, {
	                        enumerable : value.enumerable,
	                        configurable : true,
	                        get : function() {
	                            return value.get.apply(instancePrivate);
	                        },
	                        set : function() {
	                            return value.set.apply(instancePrivate, arguments);
	                        },
	                    });
                	})(instancePrivate, propertyName, value);
                } else if (notFunction) {
                    defineProperty(instancePrivate, propertyName, value);
                } else {
                    definePublicFunction(instancePrivate.public, propertyName, value, instancePrivate, true);
                }
            }

            /* add initi as a pre-chained function */
            definePreChainedFunction(instanceProtected, "init", objectInit, instancePrivate);
            definePostChainedFunction(instanceProtected, "destroy", objectDestroy, instancePrivate);

            if (instancePrivate.public.constructor !== newType) {
                return instanceProtected;
            }
            /* final type : init runs after all properties on child classes are defined */

            Object.defineProperty(instancePrivate.public, "destroy", {
                configurable : true,
                value : function() {
                    return instanceProtected.destroy();
                }
            });
            instanceProtected.init.apply(instanceProtected, arguments);
            return instancePrivate.public;
        };

        Object.defineProperty(newType, "create", {
            value : create
        });

    };

    var extend = {

        write : function(pluginName, moduleName, write) {

            write.asModule(pluginName + "!" + moduleName, "define(['" + moduleName + "', 'extend'],function (module, extend) { return extend.createType(module, '" + moduleName + "' );});\n");

        },

        load : function(name, req, onload, config) {

            req([name], function(typeDefinition) {

                if (config.isBuild) {
                    return onload();
                }
                var newType = createType(typeDefinition, name);
                onload(newType);
            });

        },

        createType : createType
    };

    return extend;
});

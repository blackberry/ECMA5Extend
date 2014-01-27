(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        factory();
    }
}(this, function () {
    //almond, and your modules will be inlined here

/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
var requirejs,require,define;(function(e){function c(e,t){return f.call(e,t)}function h(e,t){var n,r,i,s,o,a,f,l,c,h,p=t&&t.split("/"),d=u.map,v=d&&d["*"]||{};if(e&&e.charAt(0)==="."){if(t){p=p.slice(0,p.length-1);e=p.concat(e.split("/"));for(l=0;l<e.length;l+=1){h=e[l];if(h==="."){e.splice(l,1);l-=1}else if(h===".."){if(l===1&&(e[2]===".."||e[0]==="..")){break}else if(l>0){e.splice(l-1,2);l-=2}}}e=e.join("/")}else if(e.indexOf("./")===0){e=e.substring(2)}}if((p||v)&&d){n=e.split("/");for(l=n.length;l>0;l-=1){r=n.slice(0,l).join("/");if(p){for(c=p.length;c>0;c-=1){i=d[p.slice(0,c).join("/")];if(i){i=i[r];if(i){s=i;o=l;break}}}}if(s){break}if(!a&&v&&v[r]){a=v[r];f=l}}if(!s&&a){s=a;o=f}if(s){n.splice(0,o,s);e=n.join("/")}}return e}function p(t,r){return function(){return n.apply(e,l.call(arguments,0).concat([t,r]))}}function d(e){return function(t){return h(t,e)}}function v(e){return function(t){s[e]=t}}function m(n){if(c(o,n)){var r=o[n];delete o[n];a[n]=true;t.apply(e,r)}if(!c(s,n)&&!c(a,n)){throw new Error("No "+n)}return s[n]}function g(e){var t,n=e?e.indexOf("!"):-1;if(n>-1){t=e.substring(0,n);e=e.substring(n+1,e.length)}return[t,e]}function y(e){return function(){return u&&u.config&&u.config[e]||{}}}var t,n,r,i,s={},o={},u={},a={},f=Object.prototype.hasOwnProperty,l=[].slice;r=function(e,t){var n,r=g(e),i=r[0];e=r[1];if(i){i=h(i,t);n=m(i)}if(i){if(n&&n.normalize){e=n.normalize(e,d(t))}else{e=h(e,t)}}else{e=h(e,t);r=g(e);i=r[0];e=r[1];if(i){n=m(i)}}return{f:i?i+"!"+e:e,n:e,pr:i,p:n}};i={require:function(e){return p(e)},exports:function(e){var t=s[e];if(typeof t!=="undefined"){return t}else{return s[e]={}}},module:function(e){return{id:e,uri:"",exports:s[e],config:y(e)}}};t=function(t,n,u,f){var l,h,d,g,y,b=[],w;f=f||t;if(typeof u==="function"){n=!n.length&&u.length?["require","exports","module"]:n;for(y=0;y<n.length;y+=1){g=r(n[y],f);h=g.f;if(h==="require"){b[y]=i.require(t)}else if(h==="exports"){b[y]=i.exports(t);w=true}else if(h==="module"){l=b[y]=i.module(t)}else if(c(s,h)||c(o,h)||c(a,h)){b[y]=m(h)}else if(g.p){g.p.load(g.n,p(f,true),v(h),{});b[y]=s[h]}else{throw new Error(t+" missing "+h)}}d=u.apply(s[t],b);if(t){if(l&&l.exports!==e&&l.exports!==s[t]){s[t]=l.exports}else if(d!==e||!w){s[t]=d}}}else if(t){s[t]=u}};requirejs=require=n=function(s,o,a,f,l){if(typeof s==="string"){if(i[s]){return i[s](o)}return m(r(s,o).f)}else if(!s.splice){u=s;if(o.splice){s=o;o=a;a=null}else{s=e}}o=o||function(){};if(typeof a==="function"){a=f;f=l}if(f){t(e,s,o,a)}else{setTimeout(function(){t(e,s,o,a)},4)}return n};n.config=function(e){u=e;if(u.deps){n(u.deps,u.callback)}return n};define=function(e,t,n){if(!t.splice){n=t;t=[]}if(!c(s,e)&&!c(o,e)){o[e]=[e,t,n]}};define.amd={jQuery:true}})();
define("almond", function(){});

define('extend',[],function() {

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

define('SomeType',[],function() {

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

define('extend!SomeType',['SomeType', 'extend'],function (module, extend) { return extend.createType(module, 'SomeType' );});

define('main',["extend!SomeType"], function(someType) {

    var init = function() {    
    	 
    	window.newType = someType.create();  	 
        newType.value = "hi!";
    };
    
    window.addEventListener("load", init);
});

    return require("main");
       
}));
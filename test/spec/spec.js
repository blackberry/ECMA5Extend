/* Copyright 2013 BlackBerry Limited
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

/*jshint expr: true*/
//var expect = require("chai").expect;
var Extend = require('ecma5-extend');

var baseDefinition = require('../types/base.js');
var derivedDefinition = require('../types/derived.js');
var simpleDefinition = require('../types/simple.js');
var BaseType, DerivedType, SimpleType;

describe('../types/base.js', function() {

    describe('Type Creation', function() {
        it('create BaseClass', function() {
            BaseType = Extend.createType(baseDefinition);
            typeTester(BaseType, "BaseClass");
        });

        it('create DerivedClass', function() {
            DerivedType = Extend.createType(derivedDefinition);
            typeTester(DerivedType, "DerivedClass");
        });
        
        it('create SimpleClass', function() {
            SimpleType = Extend.createType(simpleDefinition);
            typeTester(SimpleType, "SimpleClass");
        });
    });

    describe('BaseClass Instance', function() {

        it('create an instance', function() {
            this.base = BaseType.create();
        });

        it('add an instance to the dom', function() {
            domTester(this.base);
        });

        it('value property', function() {
            propertyTester(this.base, "a", "a", true, true);
        });

        it('verbose value property', function() {
            propertyTester(this.base, "b", "b", true, true);
        });

        it('read-only property', function() {
            propertyTester(this.base, "c", "c", false, true);
        });

        it('configurable getter property', function() {
            propertyTester(this.base, "d", "d", false, true);
        });

        it('set (implied-get) property', function() {
            propertyTester(this.base, "e", undefined, false);
        });

        it('get set property', function() {
            propertyTester(this.base, "f", "f", true, true);
        });

        it('empty verbose property', function() {
            propertyTester(this.base, "g", {}, true, true);
        });

        it('null property', function() {
            propertyTester(this.base, "h", null, true, true);
        });

        it('undefined property', function() {
            propertyTester(this.base, "i", undefined, true, true);
        });

        it('not quite a property descriptor', function() {
            propertyTester(this.base, "j", {
                writable : false,
                value : 1,
                name : "hi"
            }, true, true);
        });

        it('private property: undefined', function() {
            expect(this.base.getPrivate("q").value).to.equal(undefined);
        });

        it('private property: null', function() {
            expect(this.base.getPrivate("r").value).to.equal(null);
        });

        it('private property: {}', function() {
            expect(this.base.getPrivate("s").value).to.deep.equal({});
        });

        it('private property: {value}', function() {
            expect(this.base.getPrivate("t").value).to.equal("t");
        });

        it('private property: {full-value}', function() {
            expect(this.base.getPrivate("u").value).to.equal("u");
            expect(this.base.getPrivate("u").writable).to.equal(false);
            expect(this.base.getPrivate("u").configurable).to.equal(true);
        });

        it('private property: {get-set}', function() {
            expect(this.base.getPrivate("v").get).to.be.a("function");
            expect(this.base.getPrivate("v").set).to.be.a("function");
            this.base.getPrivate("v").set.call(this.base,101);
            expect(this.base.getPrivate("v").get.call(this.base)).to.equal(101);
        });

        it('standalone accessor message (getX)', function() {
            methodTester(this.base, "getX", 101);
        });

        it('standalone accessor message (sumX)', function() {
            methodTester(this.base, "sumX", 101);
        });

        it('pure virtual method (vp)', function() {
            methodExceptionTester(this.base, "runProtected", TypeError, "vp");
        });

        it('destroy an instance', function() {
            destructorTester(this.base);
        });

    });

    describe('DerivedClass Instance', function() {

        it('create an instance', function() {
            this.derived = DerivedType.create();
        });

        it('add an instance to the dom', function() {
            domTester(this.derived);
        });

        it('override value property (a)', function() {
            propertyTester(this.derived, "a", 2, true);
        });

        it('value property (y)', function() {
            propertyTester(this.derived, "y", 202, false, true);
        });

        it('standalone accessor message (getX)', function() {
            methodTester(this.derived, "getX", 202);
        });

        it('super-chained accessor message (sumX)', function() {
            methodTester(this.derived, "sumX", 303);
        });

        it('implementaation of pure virual method (vp)', function() {
            methodTester(this.derived, "runProtected", true, "vp");
        });

        it('notify public property (n)', function() {
            notifyPublicPropertyTester(this.derived, "n");
        });

        it('notify public property (nn)', function() {
            notifyPublicPropertyTester(this.derived, "nn");
        });

        it('getPrivate(self) returns self', function() {
            expect(this.derived.other()).to.equal(this.derived);
        });

        //test.equal(objDerived, objDerived.other(), "DerivedClass: other getPrivate()");

        it('destroy an instance', function() {
            destructorTester(this.derived);
        });

    });

});

var typeTester = function(type, moduleName) {
    expect(type).not.to.equal(undefined);
    expect(type.name).to.equal(moduleName);
    expect(type.constructor.name).to.equal("Type<" + moduleName + ">");
};

var propertyTester = function(obj, propName, value, writable, enumerable) {
    expect(obj[propName]).to.eql(value);

    if (writable) {
        var tmp = obj[propName];
        obj[propName] = "testValue";
        expect(obj[propName]).to.equal("testValue");
        obj[propName] = tmp;
    } else {
        obj[propName] = "testValue";
        expect(obj[propName]).to.equal(value);
        obj[propName] = value;
    }

    if (enumerable !== undefined) {
        expect(obj.__proto__.propertyIsEnumerable(propName)).to.equal(enumerable);
    }
};
var methodTester = function(obj, methodName, value) {
    var args = Array.prototype.slice.call(arguments, 3);
    expect(obj[methodName].apply(obj, args)).to.equal(value);
};
var methodExceptionTester = function(obj, methodName, exceptionType) {
    var args = Array.prototype.slice.call(arguments, 3);
    expect(function() {
        obj[methodName].apply(obj, args);
    }).to.throws(exceptionType, "Abstract Method: BaseClass.vp");
    //, exceptionType, moduleName + ": public." + methodName + "(" + args.join(",") + ")");
};
var notifyPublicPropertyTester = function(obj, propName) {
    var notifyName = propName + "Changed";

    var _oldValue = obj[propName];
    var _newValue = "test value";
    var _flag = false;

    obj.subscribe(notifyName, function(newValue, oldValue) {
        _flag = true;
        //console.log(notifyName + ": " + oldValue + " --> " + newValue);

        expect(newValue).to.equal(_newValue);
        expect(oldValue).to.equal(_oldValue);
    });

    obj[propName] = _newValue;
    expect(_flag).to.equal(true);
};

var destructorTester = function(obj, moduleName) {
    expect(obj.destroy()).to.equal(undefined);
    expect(obj.__id).to.equal(undefined);

    // TODO: figure out why this doesn't work with node.js
    //test.equal(obj.__proto__, undefined, moduleName + ": __proto__ destroyed");
};

var domTester = function(base) {
    var parentEl = document.createElement("div");
    expect(function() {
        parentEl.appendChild(base);
    }).not.throw();
    parentEl.removeChild(base);
    expect(base.tagName).to.equal(base.constructor.tagName || "DIV");
};


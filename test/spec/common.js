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

var Extend = require('ecma5-extend');

module.exports = {
    typeTester : function(type, moduleName) {
        expect(type).not.to.equal(undefined);
        expect(type.name).to.equal(moduleName);
        expect(type.constructor.name).to.equal("Type<" + moduleName + ">");
    },
    propertyTester : function(obj, propName, value, writable, enumerable) {
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
    },
    methodTester : function(obj, methodName, value) {
        var args = Array.prototype.slice.call(arguments, 3);
        expect(obj[methodName].apply(obj, args)).to.equal(value);
    },
    methodExceptionTester : function(obj, methodName, exceptionType) {
        var args = Array.prototype.slice.call(arguments, 3);
        expect(function() {
            obj[methodName].apply(obj, args);
        }).to.throws(exceptionType, "Abstract Method: BaseClass.vp");
        //, exceptionType, moduleName + ": public." + methodName + "(" + args.join(",") + ")");
    },
    notifyPublicPropertyTester : function(obj, propName) {
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
    },
    destructorTester : function(obj, moduleName) {
        expect(obj.destroy()).to.equal(undefined);
        expect(obj.__id).to.equal(undefined);

        // TODO: figure out why this doesn't work with node.js
        //test.equal(obj.__proto__, undefined, moduleName + ": __proto__ destroyed");
    },
    domTester : function(base) {
        var parentEl = document.createElement("div");
        expect(function() {
            parentEl.appendChild(base);
        }).not.throw();
        parentEl.removeChild(base);
        expect(base.tagName).to.equal(base.constructor.tagName || "DIV");
    }
};

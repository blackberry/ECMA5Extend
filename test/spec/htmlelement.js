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

var common = require("./common.js");

var definition = require('../types/htmlelement.js');
var Type;

describe('htmlelement.js', function() {

    it('create a Type', function() {
        Type = Extend.createType(definition);
        common.typeTester(Type, "xelement");
        expect(Type.tagName.toUpperCase()).to.equal("X-ELEMENT");
        expect(Type.prototype instanceof window.HTMLElement).to.equal(true);
    });

    it('create an instance', function() {
        this.obj = Type.create();
        expect(this.obj.tagName.toUpperCase()).to.equal("X-ELEMENT");
        expect(this.obj instanceof window.HTMLElement).to.equal(true);
    });

    it('publish/subscribe', function() {
        expect(this.obj.publish).to.be.a("function");
        expect(this.obj.subscribe).to.be.a("function");
        expect(this.obj.unsubscribe).to.be.a("function");

        common.notifyPublicPropertyTester(this.obj, "a");
    });

    it('destroy an instance', function() {
        common.destructorTester(this.obj);
    });

    describe('create with htmlelement params', function() {
        afterEach(function() {
            this.obj.destroy();
        });

        it('upgrade an html element', function() {
            this.obj = document.createElement(Type.tagName);
            var obj = Type.upgrade(this.obj);
            expect(obj.tagName.toUpperCase()).to.equal(Type.tagName.toUpperCase(), 'object has the correct tag name');
            expect(obj).to.equal(this.obj, 'object is upgraded in-place');
        });

        it('initialize an html custom-element', function() {
            this.obj = document.createElement(Type.tagName);
            Object.setPrototypeOf(this.obj, Type.prototype);
            var obj = Type.initialize(this.obj);
            expect(obj.tagName.toUpperCase()).to.equal(Type.tagName.toUpperCase(), 'object has the correct tag name');
            expect(obj).to.equal(this.obj, 'object is initialized in-place');
        });

        (typeof document.registerElement === 'function' ? it : it.skip)('initialize a real custom-element', function() {
            Type.prototype.createdCallback = function() {
                Type.initialize(this);
            };
            document.registerElement(Type.tagName, {
                prototype : Type.prototype
            });
            var obj = document.createElement(Type.tagName);
            expect(obj.tagName.toUpperCase()).to.equal(Type.tagName.toUpperCase(), 'object has the correct tag name');
            expect(typeof obj.__id).to.equal('number', 'object is initialized in-place');
        });
    });

});


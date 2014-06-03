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

var definition = require('../types/base.js');
var Type;

describe('base.js', function() {

    it('create a Type', function() {
        Type = Extend.createType(definition);
        common.typeTester(Type, "BaseClass");
    });

    it('create an instance', function() {
        this.obj = Type.create();
    });

    it('add an instance to the dom', function() {
        common.domTester(this.obj, Type.tagName);
    });

    it('value property', function() {
        common.propertyTester(this.obj, "a", "a", true, true);
    });

    it('verbose value property', function() {
        common.propertyTester(this.obj, "b", "b", true, true);
    });

    it('read-only property', function() {
        common.propertyTester(this.obj, "c", "c", false, true);
    });

    it('configurable getter property', function() {
        common.propertyTester(this.obj, "d", "d", false, true);
    });

    it('set (implied-get) property', function() {
        common.propertyTester(this.obj, "e", undefined, false);
    });

    it('get set property', function() {
        common.propertyTester(this.obj, "f", "f", true, true);
    });

    it('empty verbose property', function() {
        common.propertyTester(this.obj, "g", {}, true, true);
    });

    it('null property', function() {
        common.propertyTester(this.obj, "h", null, true, true);
    });

    it('undefined property', function() {
        common.propertyTester(this.obj, "i", undefined, true, true);
    });

    it('not quite a property descriptor', function() {
        common.propertyTester(this.obj, "j", {
            writable : false,
            value : 1,
            name : "hi"
        }, true, true);
    });

    it('private property: undefined', function() {
        expect(this.obj.getPrivate("q").value).to.equal(undefined);
    });

    it('private property: null', function() {
        expect(this.obj.getPrivate("r").value).to.equal(null);
    });

    it('private property: {}', function() {
        expect(this.obj.getPrivate("s").value).to.deep.equal({});
    });

    it('private property: {value}', function() {
        expect(this.obj.getPrivate("t").value).to.equal("t");
    });

    it('private property: {full-value}', function() {
        expect(this.obj.getPrivate("u").value).to.equal("u");
        expect(this.obj.getPrivate("u").writable).to.equal(false);
        expect(this.obj.getPrivate("u").configurable).to.equal(true);
    });

    it('private property: {get-set}', function() {
        expect(this.obj.getPrivate("v").get).to.be.a("function");
        expect(this.obj.getPrivate("v").set).to.be.a("function");
        this.obj.getPrivate("v").set.call(this.obj, 101);
        expect(this.obj.getPrivate("v").get.call(this.obj)).to.equal(101);
    });

    it('standalone accessor message (getX)', function() {
        common.methodTester(this.obj, "getX", 101);
    });

    it('standalone accessor message (sumX)', function() {
        common.methodTester(this.obj, "sumX", 101);
    });

    it('pure virtual method (vp)', function() {
        common.methodExceptionTester(this.obj, "runProtected", TypeError, "vp");
    });

    it('destroy an instance', function() {
        common.destructorTester(this.obj);
    });

});


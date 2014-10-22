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

var definition = require('../types/derived.js');

describe('derived.js', function() {

    it('create a this.Type', function() {
        this.Type = Extend.createType(definition);
        common.typeTester(this.Type, "DerivedClass");
    });

    it('type property', function() {
        common.propertyTesterStatic(this.Type, "someOption", "someValue", false, false);
    });

    it('create an instance', function() {
        this.obj = this.Type.create();
    });

    it('add an instance to the dom', function() {
        common.domTester(this.obj, this.Type.tagName);
    });

    it('override value property (a)', function() {
        common.propertyTester(this.obj, "a", 2, true);
    });

    it('value property (y)', function() {
        common.propertyTester(this.obj, "y", 202, false, true);
    });

    it('standalone accessor message (getX)', function() {
        common.methodTester(this.obj, "getX", 202);
    });

    it('super-chained accessor message (sumX)', function() {
        common.methodTester(this.obj, "sumX", 303);
    });

    it('implementaation of pure virual method (vp)', function() {
        common.methodTester(this.obj, "runProtected", true, "vp");
    });

    it('notify public property (n)', function() {
        common.notifyPublicPropertyTester(this.obj, "n");
    });

    it('notify public property (nn)', function() {
        common.notifyPublicPropertyTester(this.obj, "nn");
    });

    it('getPrivate(self) returns self', function() {
        expect(this.obj.other()).to.equal(this.obj);
    });

    //test.equal(objDerived, objDerived.other(), "DerivedClass: other getPrivate()");

    it('destroy an instance', function() {
        common.destructorTester(this.obj);
    });

});


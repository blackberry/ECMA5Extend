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

var definition = require('../types/object.js');
var Type;

describe('object.js', function() {

    it('create a Type', function() {
        Type = Extend.createType(definition);
        common.typeTester(Type, "SimpleClass");
    });

    it('create an instance', function() {
        this.obj = Type.create();
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

});


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

var mixins = require('../types/mixins.js');
var Type;

describe('mixins', function() {

    it('create a Type with js mixin', function() {
        Type = Extend.createType(mixins.definition);
        common.typeTester(Type, "MixinClass");
    });

    it('create an instance', function() {
        this.obj = Type.create(1, 2, 3);
    });

    it('mixin: constructor', function() {
        var spy = mixins.spies.mixin.constructor;
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0]).to.deep.equal([1, 2, 3]);
    });
    it('mixin: prototype function', function() {
        var spy = mixins.spies.mixin.g;
        this.obj.g(4, 4, 4);
        expect(spy.calledOnce).to.equal(true);
        expect(spy.args[0]).to.deep.equal([4, 4, 4]);
    });

    it('extendedMixin: init', function() {
        var spy = mixins.spies.extend.init;
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0]).to.deep.equal([1, 2, 3]);
    });
    it('extendedMixin: property', function() {
        common.notifyPublicPropertyTester(this.obj, "f");
        expect(this.obj.f).to.equal(this.obj.getF());
        this.obj.setF(5);
        expect(this.obj.f).to.equal(5);
    });

    it('destroy an instance', function() {
        common.destructorTester(this.obj);
        expect(mixins.spies.extend.destroy.calledOnce).to.equal(true);
    });

});


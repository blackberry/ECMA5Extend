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

describe('module api', function() {

    it('memoryLeakWarnings', function() {
        var Type = Extend.createType({
            init : function() {
                this.dummy = document.createElement("div");
            }
        });
        var originalWarn = console.warn;
        var spy = sinon.spy();
        Object.defineProperty(console, "warn", {configurable : true, value : spy});

        Type.create({}).destroy();
        expect(spy.calledOnce).to.equal(true);

        Object.defineProperty(console, "warn", {value : originalWarn});
    });
});


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

var mixin = sinon.spy();
mixin.prototype.g = sinon.spy();

var extendMixin = {
    public : {
        f : undefined
    },
    init : sinon.spy(),
    destroy : sinon.spy()
};
var def = {
    name : "MixinClass",
    public : {
        getF : function() {
            return this.f;
        },
        setF : function(f) {
            this.f = f;
        },
    },
    mixin : [mixin],
    mixinExtended : [extendMixin]
};

module.exports = {
    definition : def,
    spies : {
        extend : extendMixin,
        mixin : {
            constructor : mixin,
            g : mixin.prototype.g
        }
    }
};


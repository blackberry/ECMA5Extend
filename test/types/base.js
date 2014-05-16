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

var _f = "f";

module.exports = {

    name : "BaseClass",

    extend : window.HTMLDivElement,

    /*tagName : "EL-BASECLASS",*/

    private : {
        x : 101,
        c : "c",
    },

    public : {
        a : "a",

        b : {
            value : "b"
        },

        c : {
            writable : false,
        },

        d : {
            configurable : false,
            get : function() {
                return "d";
            }
        },

        e : {
            set : function(v) {
            }
        },

        f : {
            get : function() {
                return _f;
            },
            set : function(v) {
                _f = v;
            }
        },

        g : {
        },

        h : null,
        i : undefined,

        q : {
            writable : false,
            value : 1,
            name : "hi"
        },

        getX : function() {
            return this.x;
        },
        sumX : function() {
            return this.x;
        },
        runProtected : function(fcnName, a, b, c, d, e, f, g, h, i, j, k) {
            return this.protected[fcnName](a, b, c, d, e, f, g, h, i, j, k);
        }
    },

    protected : {
        vp : function() {
            throw new TypeError("Abstract Method: BaseClass.vp");
        }
    },

    init : function() {
        //console.log("<base>\t\t\t\tinit\t" + this.public.__id);
    },

    destroy : function() {
        //console.log("<base>\t\t\t\tdestroy\t" + this.public.__id);
    },
};
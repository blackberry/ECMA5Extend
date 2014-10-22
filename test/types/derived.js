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

var Extend = require("ecma5-extend");

module.exports = {

    name : "DerivedClass",

    extend : Extend.createType(require("./base.js")),

    someFunction : function() {
        return "someValue";
    },

    private : {
        x : 202
    },

    protected : {
        vp : function() {
            return true;
        },
        pn : undefined,
        pnn : {
            get : function() {
                return this.pnn;
            },
            set : function(v) {
                var old = this.pnn;
                this.pnn = v;
                this.protected.publish("pnnChanged", v, old);
            }
        }
    },

    public : {
        n : {
            value : null,
            notify : true,
        },

        nn : {
            get : function() {
                return this.pnn;
            },
            set : function(v) {
                var old = this.pnn;
                this.nn = v;
                this.protected.publish("nnChanged", v, old);
            }
        },

        y : {
            writable : false,
            value : 202
        },

        getX : function() {
            return this.x;
        },
        sumX : function() {
            return this.x + this.super.public("sumX");
        },

        other : function() {
            return this.getPrivate(this.public).public;
        }
    },

    init : function() {
        this.public.a = 2;
        //console.log("<derived>\t\t\tinit\t" + this.public.__id);
    },

    destroy : function() {
        //console.log("<derived>\t\t\tdestroy\t" + this.public.__id);
    }
};

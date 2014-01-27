/* Copyright 2013 Research In Motion
* @author: Anzor Bashkhaz
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

({
    baseUrl: "../",
    
    paths: {
        "almond" : "../../node_modules/almond/almond",
        "extend" : "../../src/extend",
    },
    
    include:[ 
    			"almond",
    			"extend",
   			  	"main",              
              ],
              
    preserveLicenseComments: false,
        
    wrap: {
        startFile:"wrap-start.frag",
        endFile:"wrap-end.frag"
    },
    
    optimizeAllPluginResources : true,
    
    optimize:"none"
})
({
    baseUrl: "../",
    
    paths: {
    	"extend":"../../src/extend",
        "almond":"build/almond",
	},
    
    include:[ 
              "almond",
              "extend",
              "main"
              ],
              
    preserveLicenseComments: false,
    
    wrap: {
        startFile:"wrap-start.frag",
        endFile:"wrap-end.frag"
    },
    
    optimize: "none"
        
})

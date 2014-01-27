define(["extend!SomeType"], function(someType) {

    var init = function() {    
    	 
    	window.newType = someType.create();    	 
        newType.value = "hi!";
    };
    
    window.addEventListener("load", init);
});

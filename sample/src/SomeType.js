define(function() {

	var someType = {

		public : {
			
			value : null
			
		},

		private : {
			
			valueChanged : function(newValue){
				console.log("value changed to " + newValue);
			}
			
		},
		
		protected : {
			
						
		},
		
		init : function(){
			console.log("someType init");			
		},
		
		destroy : function(){
			
		}

	};

	return {
		extend : null, //parent type
		object : someType
	};

});

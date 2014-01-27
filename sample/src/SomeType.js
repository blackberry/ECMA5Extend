define(function() {

	var someType = {

		public : {
			
			value : null
			
		},

		private : {
			
			valueChanged : function(newValue){
				console.log("value changed to " + newValue);
			},
			
			updateValueQuietly : function(value){
				console.log("shhh.. I just went behind the property's back, without triggering valueChanged!!");
				this.value = value;
			}
			
		},
		
		protected : {
			
						
		},
		
		init : function(){
			console.log("someType init");
			var _self = this;
			setTimeout(function updateValueQuietly(){
				_self.updateValueQuietly("hmmmm");
			},2000);
		},
		
		destroy : function(){
			
		}

	};

	return {
		extend : null, //parent type
		object : someType
	};

});

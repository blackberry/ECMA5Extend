require.config({	
	paths : {
		"extend" : "../src/extend",
	}
});

require(['extend!../demos/inheritance/src/ParentType'], function(ParentType) {
	
	console.log(ParentType);

	describe('Basics', function() {

		var parentInstance;
		var childInstance;
		
		beforeEach(function() {
			parentInstance = ParentType.create();
    		childInstance = ChildType.create();
		});
		
		it('child type should inherit from parent type', function() {
			expect(childInstance.__proto__.name).toBe(parentInstance.name);
		});

	});

});

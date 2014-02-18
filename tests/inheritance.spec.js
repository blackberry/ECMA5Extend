require.config({	
	paths : {
		"extend" : "../src/extend",
		"ChildType" : "../demos/inheritance/src/ChildType",
		"ParentType" : "../demos/inheritance/src/ParentType"
	}
});

require(['extend!ParentType', 'extend!ChildType'], function(ParentType, ChildType) {

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

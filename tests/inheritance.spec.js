require.config({	
	paths : {
		"extend" : "../src/extend",
		"ChildType" : "../demos/requirejs/inheritance/src/ChildType",
		"ParentType" : "../demos/requirejs/inheritance/src/ParentType"
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

require(['../src/extend!../demos/properties/src/SomeType'], function(type) {

	describe('Basics', function() {

		beforeEach(function() {

		});
		
		//Need a better naming system
		xit('should load type', function() {		
			expect(type.name).toBe('SomeType');
		});
		
		//Need a better naming system
		xit('should be able to create instance', function(){
			expect(type.create).not.toBe(null);
			var instance = type.create();
			expect(instance.constructor.name).toBe("SomeType");
		});

	});

	describe('Properties', function() {
		
		var instance;

		beforeEach(function() {
			instance = type.create();
		});

		it('should allow to define read only properties', function() {
			instance.readOnlyProperty = "Let's see if this works!";
			expect(instance.readOnlyProperty).toBe(undefined);
		});

		it('should allow to define write only properties', function() {
			instance.writeOnlyProperty = "Write only!";
			expect(instance.writeOnlyProperty).toBe(undefined);
		});

		it('should allow for setting setter limits', function() {
			expect(function() {
				instance.limitedValue = 101;
			}).toThrow();
			expect(function() {
				instance.limitedValue = 50;
			}).not.toThrow();
		});
		
		it("should allow to update values behind the subscribers' back", function(){
			instance.valueChanged = function(){};
			spyOn(instance, "valueChanged");
			instance.updateValueQuietly(5);
			expect(instance.value).toBe(5);
			expect(instance.valueChanged).not.toHaveBeenCalled();
		});

	});

	describe('Change events: ', function() {

		var instance;
		var reciever = {
			notify : function() {
			}
		};

		beforeEach(function() {
			instance = type.create();
			instance.valueChanged = function() {
			};
			instance.subscribe('valueChanged', reciever.notify);
			spyOn(instance, 'valueChanged');
			spyOn(reciever, 'notify');
			instance.value = 5;

		});

		it('can publish custom events', function() {
			instance.customHandler = function() {
			};
			spyOn(instance, 'customHandler');
			instance.publish('customHandler');
			expect(instance.customHandler).toHaveBeenCalled();
		});

		it('can publish custom events using subscribe', function() {
			instance.subscribe('customHandler', reciever.notify);
			instance.publish('customHandler');
			expect(reciever.notify).toHaveBeenCalled();
		});

		it('emit change event with new, oldValue', function() {
			expect(instance.valueChanged).toHaveBeenCalledWith(5, null);
		});

		xit('[publish/subscribe] emit change event with new, oldValue', function() {			
			expect(reciever.notify).toHaveBeenCalledWith(5, null);
		});

	});
});

app.factory('socket', function($rootScope){
		var socket = io.connect();
		return{
			on: function(eventName, callback){
				socket.on(eventName, function(){
					var args = arguments;
					$rootScope.$apply(function(){
						callback.apply(socket, args);
					})
				})
			},
			
			emit: function(eventName, data, callback){
				socket.emit(eventName, data, function(){
					var args = arguments;
					$rootScope.$apply(function(){
						if(callback){
							callback.apply(socket, args);
						}
					})
				})
			}
		};	
	});
	
	app.directive('hotkey', function() {
  		return {
    		link: function(scope, element, attrs) {
      			var config = scope.$eval(attrs.hotkey)
      			angular.forEach(config, function(value, key) {
        			angular.element(window).on('keydown', function(e) {
          				if (e.keyCode === Number(key)) {
            				element.triggerHandler(value)  
          				}
        			})
      			})
    		}
  		}
	})
	
	app.directive('scroll', function($timeout){
		return{
			restrict: 'A',
			link: function(scope, element, attr){
				scope.$watchCollection(attr.scroll, function(newVal){
					$timeout(function(){
						element[0].scrollTop = element[0].scrollHeight;
        			});
      			});
    		}
  		}
	});
(function(){
	'use strict';
	
	var app = angular.module("chatApp", ['ngRoute']);
	app.config(function($routeProvider) {
		$routeProvider
		.when("/login", {
			templateUrl : "pages/login.html",
			controller: "authCtrl"
		})
		.when("/register", {
			templateUrl : "pages/registration.html",
			controller: "regCtrl"
		})
		.when("/dash", {
			templateUrl : "pages/admin.html",
			controller: "dashboardCtrl"
		})
		.when("/", {
			templateUrl : "pages/chat.html",
			controller: "chatCtrl"
		});
	});
	
	
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
	
	app.controller("dashboardCtrl", function($scope, socket, $location, $http){
		$scope.usersList =[];
		$http.get('/users/userslist').then(function(data){
			$scope.usersList.push(data.data.usersList);
		});
		console.log($scope.usersList);
	})
	
	app.controller("authCtrl", function($scope, socket, $rootScope, $location, $http){
		
		$rootScope.users=[];
		
		$scope.username = '';
        $scope.checkLoginContent = function(){
			if(typeof $scope.username === 'undefined'){
				$scope.logInfo = "Пожалуйста, введите свое имя";
			}else{
				$scope.submit = function(){
					$http.get('/users/signin/' + $scope.currentUser.username).then(function(data){
						if(data.status=200){
							$rootScope.globals = {
								currentUser: {
									username: $scope.currentUser.username
								}
							};
							$location.path('/');
						}else if(data.status=404){
							$location.path('/login');
							$scope.logInfo = "Неверенно введенный логин";
						}
					})
//					socket.emit('newUser', $scope.currentUser, function(data){})
				}
			}
		} 
	});
	
	app.controller("regCtrl", function($scope, $http, socket, $rootScope, $location){
		
		$scope.signIn = function(){
			if($scope.newUser.password == $scope.newUser.password2){
				$http.post('/users/register', $scope.newUser).then(function(data){
					if( data.status==200){
						console.log('success');
						$location.path('/login');
					}else if(data.status==400){
						console.log('error');
						$scope.regInfo = "Пользователь с таким ником уже существует";
					}
				}).catch(function(err, data){
					$scope.regInfo = "При регистрации возникли проблемы.";
					console.log(data);
				})
			}else{
				$scope.regInfo = "Пароли не совпадают";
			}
		}
	})
	
	app.controller("chatCtrl", function($scope, socket, $location, $rootScope, $http){
		if(!$rootScope.globals){
			$location.path('/login');
		}else{
			
//			console.log('globals', $rootScope.globals.currentUser);
//			$scope.usersList.push($rootScope.globals.currentUser.username);
//			console.log('user list', $scope.usersList);
			
			$scope.sendMessage = function(){
				if($scope.message != ""){
					socket.emit('sendMessage', $scope.message);
					$scope.message = "";
				}
			}
		
			$scope.messages = [];
		
			socket.on('newMessage', function(data){
				$scope.messages.push(data);
	//			$chat.append('<div class="sent-message"><strong>'+data.user+'</strong>:'+ data.msg+'</div');
			});
		}
	});
})();
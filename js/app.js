// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('underscore', [])
	.factory('_', function() {
	return window._; // assumes underscore has already been loaded on the page
});
angular.module('dallaapp', [
	'angularMoment',
	'ion-google-place',
	'ionic',
	'dallaapp.controllers',
	'dallaapp.directives',
	'dallaapp.filters',
	'dallaapp.services',
	'dallaapp.factories',
	'dallaapp.config',
	'monospaced.elastic',
	'ngResource',
	'ngCordova',
	'ngOpenFB',
	'underscore',
])
.run(function($ionicPlatform, $cordovaPush, $rootScope, ngFB, $http, $localstorage) {
	var iosConfig = {
		"badge": true,
		"sound": true,
		"alert": true,
	};
	var androidConfig = {
		"senderID": "490377537674"
	};
	$ionicPlatform.ready(function() {
		ngFB.init({appId: '1524286451204491'});
		$ionicPlatform.ready(function() {
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if(window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	});
	document.addEventListener("deviceready", function(){
		var devicePlatform = device.platform
		if(devicePlatform == "iOS "){
			$cordovaPush.register(iosConfig).then(function(deviceToken) {
				var a__li = $localstorage.getObject('a__li');
				if(a__li && a__li != ""){
					$http({
						method: "post",
						url: "http://godalla.com/app/pushnotif",
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
						data: {a__li:a__li, u__u:"ios", u__d: deviceToken}
					})
				}
			});
			
			
			$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
				if (notification.alert) {
					navigator.notification.alert(notification.alert);
				}
				
				if (notification.sound) {
					var snd = new Media(event.sound);
					snd.play();
				}
				
				if (notification.badge) {
					$cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
					// Success!
					}, function(err) {
					// An error occurred. Show a message to the user
					});
				}
			});
		}
		else{
			//Register device
			$cordovaPush.register(androidConfig).then(function(result){
			},
			function(err) {
			});
			
			//Receive Token or Notification
			$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
				switch(notification.event) {
					case 'registered':
						if (notification.regid.length > 0 ) {
							var a__li = $localstorage.getObject('a__li');
							if(a__li && a__li != ""){
								$http({
									method: "post",
									url: "http://godalla.com/app/pushnotif",
									headers: {'Content-Type': 'application/x-www-form-urlencoded'},
									data: {a__li:a__li, u__u:"android", u__d:notification.regid}
								})
							}
						}
					break;
					
					case 'message':
					// this is the actual push notification. its format depends on the data model from the push server
						//alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
					break;
					
					case 'error':
						alert('Sorry = ' + notification.msg);
					break;
					
					default:
						alert('An unknown event has occurred');
					break;
				}
			});	
		}
		document.addEventListener("backbutton", function(e){
			if(window.location.hash == "#/app/exchange"){
				navigator.app.exitApp();
			}
			else{
				navigator.app.backHistory();
			}
		}, false);
	});
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.tabs.position('top');
	$stateProvider
	.state('auth', {
		url: "/auth",
		templateUrl: "views/auth/auth.html",
		abstract: true,
		controller: 'AuthCtrl'
	})
		.state('auth.walkthrough', {
			url: '/walkthrough',
			templateUrl: "views/auth/walkthrough.html"
		})
		
		.state('auth.login', {
			url: '/login',
			templateUrl: "views/auth/login.html",
			controller: 'LoginCtrl'
		})
		
		.state('auth.signup', {
			url: '/signup',
			templateUrl: "views/auth/signup.html",
			controller: 'SignupCtrl'
		})
		
		.state('auth.verify', {
			url: '/verify',
			templateUrl: "views/auth/verify.html",
			controller: 'VerifyCtrl'
		})
		
		.state('auth.reverify', {
			url: '/reverify',
			templateUrl: "views/auth/reverify.html",
			controller: 'VerifyCtrl'
		})
		
		.state('auth.forgot-password', {
			url: "/forgot-password",
			templateUrl: "views/auth/forgot-password.html",
			controller: 'ForgotPasswordCtrl'
		})
	.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "views/app/side.html",
		controller: 'AppCtrl'
	})
		.state('app.exchange', {
			url: "/exchange",
			views: {
				'menuContent': {
					templateUrl: "views/app/exchange.html",
					controller: 'ExchangeCtrl'
				}
			}
		})
		.state('app.bdcexchange', {
			url: "/bdcexchange",
			views: {
				'menuContent': {
					templateUrl: "views/app/bdcexchange.html",
					controller: 'BDCExchangeCtrl'
				}
			}
		})
	.state('exchange', {
		url: "/exchange",
		abstract: true,
		templateUrl: "views/exchange/main.html",
		controller: 'ExchangeMainCtrl'
	})
		.state('exchange.requests', {
			url: "/requests",
			views: {
				'mainExchange': {
					templateUrl: "views/exchange/requests.html"
				}
			}
		})
		.state('exchange.edit', {
			url: "/edit/:id/:fro/:frosym/:fros/:tro/:trosym/:tros",
			views: {
				'mainExchange': {
					templateUrl: "views/exchange/edit.html",
					controller: 'EditExhchangeListingsCtrl'
				}
			}
		})
		.state('exchange.settings', {
			url: "/settings",
			views: {
				'mainExchange': {
					templateUrl: "views/exchange/settings.html",
					controller: 'SettingsCtrl'
				}
			}
		})
		.state('exchange.listings', {
			url: "/listings/:id/:fro/:tro",
			views: {
				'mainExchange': {
					templateUrl: "views/exchange/listings.html",
					controller: 'ExhchangeListingsCtrl'
				}
			}
		})
			.state('exchange.listings.distance', {
				url: "/listings_distance",
				views: {
					'listings-filter': {
						templateUrl: "views/exchange/tabs/distance.html",
						controller: 'ExhchangeListingsCtrlDis'
					}
				}
			})
			.state('exchange.listings.rate', {
				url: "/listings_rate",
				views: {
					'listings-rate': {
						templateUrl: "views/exchange/tabs/rate.html",
						controller: 'ExhchangeListingsCtrlR'
					}
				}
			})
			.state('exchange.listings.date', {
				url: "/listings_date",
				views: {
					'listings-date': {
						templateUrl: "views/exchange/tabs/date.html",
						controller: 'ExhchangeListingsCtrlD'
					}
				}
			})
		.state('exchange.profile', {
			url: "/profile/:profilename/:pdistance/:prating/:plat/:plng/:cavatar",
			views: {
				'mainExchange': {
					templateUrl: "views/exchange/profile.html",
					controller: 'ExchangeProfile'
				}
			}
		})
	.state('chat', {
		url: "/chat",
		abstract: true,
		templateUrl: "views/chat/main.html",
		controller: 'ChatCtrl'
	})
		.state('chat.open', {
			url: "/open",
			views: {
				'mainChat': {
					templateUrl: "views/chat/open.html"
				}
			}
		})
		.state('chat.conversation', {
			url: "/conversation/:chat/:avatar",
			views: {
				'mainChat': {
					templateUrl: "views/chat/conversation.html",
					controller: 'ConvoCtrl'
				}
			}
		})
	if(window.localStorage['a__li']) {
		$urlRouterProvider.otherwise('/app/exchange');
		
	}
	else{
		$urlRouterProvider.otherwise('/auth/login');
	}
});

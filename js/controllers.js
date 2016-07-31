angular.module('dallaapp.controllers', [])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

.controller('LoginCtrl', function($scope, $ionicConfig, $ionicLoading, $ionicPopup, $http, ngFB, $localstorage, $state) {
	$scope.user = {};
	$scope.doLogIn = function() {
		if(!$scope.user.uname || !$scope.user.password){
			var alertPopup = $ionicPopup.alert({
				title: 'Login failed!',
				template: 'Please enter your email address and password in the fields provided'
			});
		}
		else{
			$ionicLoading.show({
				content: '<i class="ion-loading-c"></i>',
				animation: 'fade-in',
				noBackdrop: false
			});
			$http({
				method: "post",
				url: "http://godalla.com/app/login",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {a__e:$scope.user.uname, a__p:$scope.user.password}
			})
			.then(function(resp) {
				$ionicLoading.hide();
				if(resp.data.status == 5){
					$ionicPopup.alert({
						title: "Login failed",
						template: "The login fields cannot be empty"
					});
				}
				else if(resp.data.status == 0){
					$ionicPopup.alert({
						title: "Login failed",
						template: "Incorrect login details"
					});
				}
				else{
					$localstorage.setObject('a__li', {
						ua: resp.data.k___yc
					});
					if(resp.data.status == "1"){
						$state.go('app.exchange');
					}
				}				
			}, function(err) {
				$ionicLoading.hide();
				console.error('ERR', err);
				$ionicPopup.alert({
					title: 'Login Error!',
					template: err.status
				});
			});
		}
    };
	$scope.fbLogin = function () {
		ngFB.login({scope: 'email'})
	.then(
        function (response) {
            if (response.status === 'connected') {
				$scope.FBloginUser(response.authResponse);
            }
			else{
				$ionicPopup.alert({
					title: 'Facebook login failed!',
					template: 'Please try again later'
				});
            }
        });
	};
	$scope.FBloginUser = function (auth){
		ngFB.api({
			path: '/me',
			params: {fields: 'id,name,email,gender'}
		})
		.then(
			function(user){
				$scope.FBremoteLogin(user.id, user.name, user.email, user.gender);
			},
			function(error){
				$ionicPopup.alert({
					title: 'Facebook login error!',
					template: error
				});
			}
		);
	}
	$scope.FBremoteLogin = function(userid, username, useremail, usergender){
		$ionicLoading.show({
			content: '<i class="ion-loading-c"></i>',
			animation: 'fade-in',
			noBackdrop: false
		});
		$http({
			method: "post",
			url: "http://godalla.com/app/fblogin",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__ui:userid, a__uu:username, a__ue:useremail, a__ug:usergender}
		})
		.then(function(resp) {
			$ionicLoading.hide();
			if(resp.data.status == 5){
				$ionicPopup.alert({
					title: "Login failed",
					template: "Facebook authorization error"
				});
			}
			else if(resp.data.status == 0){
				$ionicPopup.alert({
					title: "Login failed",
					template: "Incorrect login details"
				});
			}
			else{
				$localstorage.setObject('a__li', {
					ua: resp.data.k___yc
				});
				$state.go('app.exchange');
			}				
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Login Error!',
				template: err.status
			});
		});
	}
})
.controller('AppCtrl', function($scope, $ionicConfig, $window, $window, $ionicLoading, $state, $http, $localstorage) {
	//Control notifications here
	var a__li = $localstorage.getObject('a__li');
	$scope.$on('$ionicView.enter', function() {
		$scope.notifications = {};
		$scope.notifications.inbox = 0;
		$scope.notifications.requests = 0;
		$http({
			method: "post",
			url: "http://godalla.com/app/getnotifs",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li}
		})
		.then(function(resp) {
			if(resp.data.status == 1){
				$scope.notifications.inbox = resp.data.inbox;
				//$scope.notifications.requests = resp.data.requests;
			}
		});
	});
	$scope.LOGDallaOut = function() {
		$ionicLoading.show({
			content: '<i class="ion-loading-c"></i>',
			animation: 'fade-in',
			noBackdrop: false
		});
		$window.localStorage.removeItem("a__li");
		$ionicLoading.hide();
		$state.go('auth.login');
		ionic.Platform.exitApp();
	};
})

.controller('MainCtrl', function($scope) {
	
})
.controller('ExhchangeListingsCtrlDis', function($scope, $ionicConfig, $window, $ionicLoading, $state, $localstorage, $http, $stateParams, $ionicPopup) {
	var a__li = $localstorage.getObject('a__li');
	$scope.req = $stateParams;
	$scope.exchangers = {};
	$scope.bdcexchangers = {};
	$scope.orate = "Not available";
	$scope.excount = 0;
	$scope.pager = 1;
	$scope.MoreItemsAvailable = false;
	
	$scope.$on('$ionicView.enter', function() {
		$scope.countEx();
	});
	$scope.findBDCs = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findbdcexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(!resp.data.status){
				$scope.bdcexchangers = resp.data;	
			}
			else{
				$scope.bdcexchangers.status = resp.data;
			}
		});
	}
	$scope.findEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.exchangers = resp.data;
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.loadMoreRequests = function (pager){
		$scope.loadmoreaction = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id, p__gr:pager}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					if(($scope.pager*10) >= $scope.excount){
						$scope.MoreItemsAvailable = false;
					}
					else{
						$scope.MoreItemsAvailable = true;
						$scope.pager = $scope.pager+1;
					}
					$scope.exchangers = $scope.exchangers.concat(resp.data);
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.countEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/countexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.excount = resp.data.excount;
					if($scope.excount > 0){
						$scope.findEx();
						if($scope.excount > 10){
							$scope.loadmoreaction = 1;
							$scope.pager = 2;
							$scope.MoreItemsAvailable = true;
						}
					}
					else{
						$scope.exchangers = {};
						$scope.exchangers.status = 2;
					}
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$http({
		method: "post",
		url: "http://godalla.com/app/convert",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: {__f:$scope.req.tid, __t:$scope.req.fid}
	})
	.then(function(resp) {
		if(resp.data.rate){
			$scope.orate = resp.data.rate;
		}
	});
	$scope.findBDCs();
})
.controller('ExhchangeListingsCtrlR', function($scope, $ionicConfig, $window, $ionicLoading, $state, $localstorage, $http, $stateParams, $ionicPopup) {
	var a__li = $localstorage.getObject('a__li');
	$scope.req = $stateParams;
	$scope.exchangers = {};
	$scope.bdcexchangers = {};
	$scope.orate = "Not available";
	$scope.excount = 0;
	$scope.pager = 1;
	$scope.MoreItemsAvailable = false;
	$scope.loadmoreaction = "0";
	
	$scope.$on('$ionicView.enter', function() {
		$scope.countEx();
	});
	$scope.findBDCs = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findbdcexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(!resp.data.status){
				$scope.bdcexchangers = resp.data;	
			}
			else{
				$scope.bdcexchangers.status = resp.data;
			}
		});
	}
	$scope.findEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id, t__or:"rate"}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.exchangers = resp.data;
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.loadMoreRequests = function (pager){
		$scope.loadmoreaction = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id, p__gr:pager, t__or:"rate"}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					if(($scope.pager*10) >= $scope.excount){
						$scope.MoreItemsAvailable = false;
					}
					else{
						$scope.MoreItemsAvailable = true;
						$scope.pager = $scope.pager+1;
					}
					$scope.exchangers = $scope.exchangers.concat(resp.data);
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.countEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/countexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.excount = resp.data.excount;
					if($scope.excount > 0){
						$scope.findEx();
						if($scope.excount > 10){
							$scope.loadmoreaction = 1;
							$scope.pager = 2;
							$scope.MoreItemsAvailable = true;
						}
					}
					else{
						$scope.exchangers = {};
						$scope.exchangers.status = 2;
					}
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$http({
		method: "post",
		url: "http://godalla.com/app/convert",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: {__f:$scope.req.tid, __t:$scope.req.fid}
	})
	.then(function(resp) {
		if(resp.data.rate){
			$scope.orate = resp.data.rate;
		}
	});
	$scope.findBDCs();
})
.controller('ExhchangeListingsCtrlD', function($scope, $ionicConfig, $window, $ionicLoading, $state, $localstorage, $http, $stateParams, $ionicPopup) {
	var a__li = $localstorage.getObject('a__li');
	$scope.req = $stateParams;
	$scope.exchangers = {};
	$scope.bdcexchangers = {};
	$scope.orate = "Not available";
	$scope.excount = 0;
	$scope.pager = 1;
	$scope.MoreItemsAvailable = false;
	$scope.loadmoreaction = "0";
	
	$scope.$on('$ionicView.enter', function() {
		$scope.countEx();
	});
	$scope.findBDCs = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findbdcexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(!resp.data.status){
				$scope.bdcexchangers = resp.data;	
			}
			else{
				$scope.bdcexchangers.status = resp.data;
			}
		});
	}
	$scope.findEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id, t__or:"recent"}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.exchangers = resp.data;
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.loadMoreRequests = function (pager){
		$scope.loadmoreaction = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/findexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id, p__gr:pager, t__or:"recent"}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					if(($scope.pager*10) >= $scope.excount){
						$scope.MoreItemsAvailable = false;
					}
					else{
						$scope.MoreItemsAvailable = true;
						$scope.pager = $scope.pager+1;
					}
					$scope.exchangers = $scope.exchangers.concat(resp.data);
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$scope.countEx = function (){
		$http({
			method: "post",
			url: "http://godalla.com/app/countexchangers",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, s__id:$scope.req.id}
		})
		.then(function(resp) {
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.exchangers = {};
				$scope.orate = "Not available";
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.exchangers = {};
					$scope.orate = "Not available";
				}
				else{
					$scope.excount = resp.data.excount;
					if($scope.excount > 0){
						$scope.findEx();
						if($scope.excount > 10){
							$scope.loadmoreaction = 1;
							$scope.pager = 2;
							$scope.MoreItemsAvailable = true;
						}
					}
					else{
						$scope.exchangers = {};
						$scope.exchangers.status = 2;
					}
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving requests!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
	}
	$http({
		method: "post",
		url: "http://godalla.com/app/convert",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: {__f:$scope.req.tid, __t:$scope.req.fid}
	})
	.then(function(resp) {
		if(resp.data.rate){
			$scope.orate = resp.data.rate;
		}
	});
	$scope.findBDCs();
})
.controller('EditExhchangeListingsCtrl', function($scope, $ionicConfig, $rootScope, $http, $ionicLoading, $localstorage, $ionicPopup, $state, $stateParams) {
	var a__li = $localstorage.getObject('a__li');
	$scope.location= {};
	$scope.location.geometry = {};
	$scope.currencies = {};
	$scope.seller = {};
	$scope.seller.amount = 0;
	$scope.seller.tamount = 0;
	$scope.ocurr = "0.00";
	$scope.socurr = "0.00";
	$scope.rocurr = 0;
	$scope.rval = 0;
	$scope.abbrev = "";
	$scope.sabbrev = "";
	$scope.asym = "";
	$scope.sym = "";
	$scope.ssym = "";
	$scope.currAction = 0;
	$scope.range = [];
	$scope.range.mplier = $scope.ocurr;
	$scope.range.rmplier = '0';
	$scope.range.val = 50;
	$scope.range.factor = 0;
	$scope.range.ifactor = 0;
	$scope.range.mplierreverse = 0;
	$scope.buttonPressed = 0;
	
	$scope.req = $stateParams;
	$scope.reqq = {};
	
	$scope.$on('$ionicView.enter', function() {
		$http({
			method: "post",
			url: "http://godalla.com/app/getrequests",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, r__id:$scope.req.id}
		})
		.then(function(resp) {
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
				$scope.request = {};
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Invalid request',
						template: "Sorry there are no exchanges that match your request."
					});
					$scope.request = {};
				}
				else{
					$scope.reqq.exchangeid = resp.data.exchangeid;
					$scope.reqq.location = resp.data.location;
					$scope.reqq.rate = resp.data.rate;
					$scope.reqq.formatted_address = resp.data.formatted_address;
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving your request!',
				template: err.status
			});
			$scope.exchangers = {};
			$scope.orate = "Not available";
		});
		
		$scope.doConversion();
	});
	
	$scope.$watch('range.val', function(newValue, oldValue) {
		if($scope.range.mplierreverse == 0){
			$scope.range.mplier = $scope.range.factor*$scope.range.val;
		}
		else{
			var nu_scope_factor = (1/$scope.ocurr)/50;
			$scope.range.mplier = $scope.range.factor*$scope.range.val;
			if($scope.buttonPressed == 1){
				$scope.buttonPressed = 0;
				if((1/$scope.ocurr) < 10){
					var rxrrr = parseFloat(nu_scope_factor*$scope.range.val);
					$scope.range.rmplier = rxrrr;
				}
				else{
					$scope.range.rmplier = parseInt(nu_scope_factor*$scope.range.val);
				}
			}
			else{
				$scope.range.rmplier = nu_scope_factor*$scope.range.val;
			}
		}
		if($scope.range.mplier == 0){
			$scope.seller.tamount = 0;
		}
		else{
			if($scope.range.mplierreverse == 0){
				$scope.seller.tamount = $scope.seller.amount/$scope.range.mplier;
			}
			else{
				$scope.seller.tamount = $scope.seller.amount*$scope.range.rmplier;
			}
		}
	});
	$scope.$watch('seller.amount', function(newValue, oldValue) {
		if($scope.seller.amount){
			if($scope.seller.amount == 0){
				$scope.seller.amount = 1;
			}
			if($scope.range.mplier == 0){
				$scope.seller.tamount = 0;
			}
			else{
				if($scope.range.mplierreverse == 0){
					$scope.seller.tamount = $scope.seller.amount/$scope.range.mplier;
				}
				else{
					$scope.seller.tamount = $scope.seller.amount*$scope.range.rmplier;
				}
			}
		}
	});
	
	$scope.increaseAmt = function(){
		if($scope.range.mplierreverse == 0){
			var theInt = Math.floor($scope.range.mplier);
			var theDecO = ($scope.range.mplier)%1;
			var theDec = (parseFloat(theDecO).toFixed(4)).toString().split(".")[1];
			if(parseInt(theDec) == 0){
				if(theInt == 0){
					theInt = 1;
				}
				$scope.range.mplier = theInt+$scope.range.ifactor;
				$scope.range.val = (theInt+$scope.range.ifactor)/$scope.range.factor;
			}
			else{
				if($scope.range.mplier != 0){
					if(parseFloat($scope.range.ifactor) > parseFloat(theDecO)){
						$scope.range.mplier = theInt+$scope.range.ifactor;
						$scope.range.val = (theInt+$scope.range.ifactor)/$scope.range.factor;
					}
					else{
						var theDec1 = $scope.range.ifactor;
						while (parseFloat(theDec1).toFixed(4) <= parseFloat(theDecO).toFixed(4)) {
							theDec1 = theDec1+$scope.range.ifactor;
						}
						$scope.range.mplier = theInt+theDec1;
						$scope.range.val = (theInt+theDec1)/$scope.range.factor;
					}
				}
			}
		}
		else{
			$scope.buttonPressed = 1;
			var increments = 0;
			var nu_scope_factor = (1/$scope.ocurr)/50;
			var ol_val = $scope.range.val;
			
			if((1/$scope.ocurr) < 0.25){
				increments = 0.0025;
			}
			else if((1/$scope.ocurr) < 0.5){
				increments = 0.005;
			}
			else if((1/$scope.ocurr) < 1){
				increments = 0.025;
			}
			else if((1/$scope.ocurr) < 2){
				increments = 0.05;
			}
			else if((1/$scope.ocurr) < 5){
				increments = 0.25;
			}
			else if((1/$scope.ocurr) < 10){
				increments = 0.5;
			}
			else if((1/$scope.ocurr) < 500){
				increments = 1;
			}
			else if((1/$scope.ocurr) < 1000){
				increments = 10;
			}
			else if((1/$scope.ocurr) < 5000){
				increments = 100;
			}
			else if((1/$scope.ocurr) < 10000){
				increments = 1000;
			}
			
			var new_val = ($scope.range.rmplier+increments)/nu_scope_factor;
			if((1/$scope.ocurr) < 10){
				if(parseFloat(new_val).toFixed(4) == parseFloat(ol_val).toFixed(4)){
					var thefigure = new_val+increments;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4)){
					do {
						thefigure = parseFloat(final_val)+increments;
						final_val = thefigure;
					} while (parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4));
				}
			}
			else{
				if(new_val == ol_val){
					var thefigure = parseInt(new_val)+increments;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val)){
					do {
						thefigure = parseInt(final_val)+increments;
						final_val = thefigure;
					} while (parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val));
				}
			}
			$scope.range.val = final_val;
		}
	}
	$scope.decreaseAmt = function(){
		if($scope.range.mplierreverse == 0){
			var theInt = Math.floor($scope.range.mplier);
			var theDecO = ($scope.range.mplier)%1;
			var theDec = (parseFloat(theDecO).toFixed(4)).toString().split(".")[1];
			if(parseInt(theDec) == 0){
				if(theInt == 0){
					theInt = 1;
				}
				$scope.range.mplier = theInt-$scope.range.ifactor;
				$scope.range.val = (theInt-$scope.range.ifactor)/$scope.range.factor;
			}
			else{
				if($scope.range.mplier != 0){
					if(parseFloat($scope.range.ifactor) < parseFloat(theDecO)){
						if(theInt == 0){
							$scope.range.mplier = theDecO-$scope.range.ifactor;
							$scope.range.val = (theDecO-$scope.range.ifactor)/$scope.range.factor;
						}
						else{
							var theDec1 = $scope.range.ifactor;
							while (parseFloat(theDec1).toFixed(4) <= parseFloat(theDecO).toFixed(4)) {
								theDec1 = theDec1+$scope.range.ifactor;
							}
							if(parseFloat(theDec1).toFixed(4) == parseFloat(theDecO+$scope.range.ifactor).toFixed(4)){
								theDec1 = theDec1-$scope.range.ifactor;
							}
							$scope.range.mplier = (theInt+theDec1)-$scope.range.ifactor;
							$scope.range.val = (theInt+theDec1-$scope.range.ifactor)/$scope.range.factor;
						}
					}
					else{
						var theDec1 = $scope.range.ifactor;
						while (parseFloat(theDec1).toFixed(4) >= parseFloat(theDecO).toFixed(4)) {
							theDec1 = theDec1-$scope.range.ifactor;
						}
						$scope.range.mplier = theInt-theDec1;
						$scope.range.val = (theInt-theDec1)/$scope.range.factor;
					}
				}
			}
		}
		else{
			$scope.buttonPressed = 1;
			var decrements = 0;
			var nu_scope_factor = (1/$scope.ocurr)/50;
			var ol_val = $scope.range.val;
			
			if((1/$scope.ocurr) < 0.25){
				decrements = 0.0025;
			}
			else if((1/$scope.ocurr) < 0.5){
				decrements = 0.005;
			}
			else if((1/$scope.ocurr) < 1){
				decrements = 0.025;
			}
			else if((1/$scope.ocurr) < 2){
				decrements = 0.05;
			}
			else if((1/$scope.ocurr) < 5){
				decrements = 0.25;
			}
			else if((1/$scope.ocurr) < 10){
				decrements = 0.5;
			}
			else if((1/$scope.ocurr) < 500){
				decrements = 1;
			}
			else if((1/$scope.ocurr) < 1000){
				decrements = 10;
			}
			else if((1/$scope.ocurr) < 5000){
				decrements = 100;
			}
			else if((1/$scope.ocurr) < 10000){
				decrements = 1000;
			}
			
			var new_val = ($scope.range.rmplier-decrements)/nu_scope_factor;
			if((1/$scope.ocurr) < 10){
				if(parseFloat(new_val).toFixed(4) == parseFloat(ol_val).toFixed(4)){
					var thefigure = new_val-decrements;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4)){
					do {
						thefigure = parseFloat(final_val)-decrements;
						final_val = thefigure;
					} while (parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4));
				}
			}
			else{
				if(new_val == ol_val){
					var thefigure = parseInt(new_val)-decrements;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val)){
					do {
						thefigure = parseInt(final_val)-decrements;
						final_val = thefigure;
					} while (parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val));
				}
			}
			$scope.range.val = final_val;
		}
	}
	$scope.doConversion = function(){
		$scope.currAction = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/convert",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {__f:$scope.req.fros, __t:$scope.req.tros}
		})
		.then(function(resp) {
			$scope.currAction = 0;
			if(resp.data.rate){
				$scope.seller.tamount = 1;
				$scope.ocurr = resp.data.rate;
				$scope.aocurr = resp.data.rate;
				$scope.range.factor = $scope.ocurr/50;
				$scope.range.mplier = $scope.aocurr;
				$scope.range.val = 50;
				
				if($scope.range.mplier < 1){
					$scope.range.mplierreverse = 1;
					$scope.rocurr = 1/$scope.ocurr;
					$scope.range.rmplier = $scope.reqq.rate;
					var nu_scope_factor = (1/$scope.ocurr)/50;
					$scope.range.val = $scope.range.rmplier/nu_scope_factor;
				}
				else{
					$scope.range.mplier = $scope.reqq.rate;
					$scope.range.val = $scope.range.mplier/$scope.range.factor;
				}
				
				if($scope.aocurr < 0.00005){
					$scope.range.ifactor = 0.000005;
				}
				else if($scope.aocurr < 0.00051){
					$scope.range.ifactor = 0.00005;
				}
				else if($scope.aocurr < 0.0051){
					$scope.range.ifactor = 0.0005;
				}
				else if($scope.aocurr < 0.051){
					$scope.range.ifactor = 0.005;
				}
				else if($scope.aocurr < 0.51){
					$scope.range.ifactor = 0.05;
				}
				else if($scope.aocurr < 2.1){
					$scope.range.ifactor = 0.1;
				}
				else if($scope.aocurr < 5.1){
					$scope.range.ifactor = 0.25;
				}
				else if($scope.aocurr < 6){
					$scope.range.ifactor = 0.5;
				}
				else if($scope.aocurr < 11){
					$scope.range.ifactor = 0.10;
				}
				else if($scope.aocurr < 501){
					$scope.range.ifactor = 1;
				}
				else if($scope.aocurr < 1001){
					$scope.range.ifactor = 10;
				}
				else if($scope.aocurr < 10001){
					$scope.range.ifactor = 100;
				}
				else if($scope.aocurr < 100001){
					$scope.range.ifactor = 1000;
				}
				else{
					$scope.range.ifactor = 10000;
				}
				
				if($scope.seller.amount == ""){
					$scope.seller.amount = 1;
				}
			}
		});
	}
	$scope.updateReq = function (){
		$ionicLoading.show({
			content: '<i class="ion-loading-c"></i>',
			animation: 'fade-in',
			noBackdrop: false
		});
		if(!$scope.seller.amount){
			$scope.seller.amount = 0;
		}
		if($scope.range.mplier < $scope.range.rmplier){
			$scope.aocurr = $scope.range.rmplier;
		}
		else{
			$scope.aocurr = $scope.range.mplier;
		}
		
		$http({
			method: "post",
			url: "http://godalla.com/app/uexchange",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__bfc:$scope.reqq.var_frocurr_id, a__btc:$scope.reqq.var_tocurr_id, a__rate:$scope.aocurr, a__exchange: $scope.reqq.exchangeid}
		})
		.then(function(resp) {
			$ionicLoading.hide();
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
			}
			else if(resp.data.status == 505){
				$ionicPopup.alert({
					title: 'Wrong field entry',
					template: "Only numbers and decimals are allowed in the amount and rate fields."
				});
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Request not found',
						template: "Unable to find your initial request."
					});
				}
				else if(resp.data.status == 3){
					$ionicPopup.alert({
						title: 'Oops!',
						template: "Something seems to have gone wrong. Please try again later."
					});
				}
				else if(resp.data.status == 1){
					//Magic!
					//$scope.sell_form.$setPristine();
					$state.go('exchange.listings.distance',{id:$scope.reqq.exchangeid, fro:$scope.req.frosym, tro:$scope.req.trosym});
				}
			}
		}, function(err) {
			$ionicLoading.hide();
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error posting your ad!',
				template: err.status
			});
		});
	}
	
})
.controller('BDCExchangeCtrl', function($scope, $ionicConfig, $rootScope, $http, $ionicLoading, $localstorage, $ionicPopup, $state, $timeout, $ionicScrollDelegate) {
	var a__li = $localstorage.getObject('a__li');
	$scope.the_loader = 0;
	$scope.location= {};
	$scope.location.geometry = {};
	$scope.currencies = {};
	$scope.seller = {};
	$scope.bdc = {};
	$scope.seller.amount = 0;
	$scope.seller.tamount = 0;
	$scope.ocurr = "0.00";
	$scope.socurr = "0.00";
	$scope.rocurr = 0;
	$scope.rval = 0;
	$scope.abbrev = "";
	$scope.sabbrev = "";
	$scope.asym = "";
	$scope.sym = "";
	$scope.ssym = "";
	$scope.currAction = 0;
	$scope.range = [];
	$scope.range.mplier = $scope.ocurr;
	$scope.range.rmplier = '0';
	$scope.range.val = 50;
	$scope.range.factor = 0;
	$scope.range.ifactor = 0;
	$scope.range.mplierreverse = 0;
	$scope.buttonPressed = 0;
	$scope.showalert = 0;
	$scope.black = [];
	
	$scope.$watch('seller.frocurr', function(newValue, oldValue) {
		$scope.seller.frocurr = newValue;
		if($scope.seller.frocurr == $scope.seller.tocurr && ($scope.seller.frocurr != "")){
			$scope.seller.tocurr = oldValue;
		}
		$scope.updateSymbol();
	});
	
	$scope.$watch('seller.tocurr', function(newValue, oldValue) {
		$scope.seller.tocurr = newValue;
		if($scope.seller.frocurr == $scope.seller.tocurr && ($scope.seller.tocurr != "")){
			$scope.seller.frocurr = oldValue;
		}
		$scope.updateSSymbol();
	});
	
	$scope.sellReq = function (){
		var var_frocurr = $scope.seller.frocurr.split(",",2);
		var var_frocurr_id = var_frocurr[0];
		var var_frocurr_sym = var_frocurr[1];
		
		var var_tocurr = $scope.seller.tocurr.split(",",2);
		var var_tocurr_id = var_tocurr[0];
		var var_tocurr_sym = var_tocurr[1];
		$scope.the_loader = 1;
		if(!$scope.seller.amount){
			$scope.seller.amount = 0;
		}
		var type_of_conversion= "";
		if($scope.range.mplier < $scope.range.rmplier){
			$scope.aocurr = $scope.range.rmplier;
			type_of_conversion = 2;
		}
		else{
			$scope.aocurr = $scope.range.mplier;
			type_of_conversion = 1;
		}
		
		$http({
			method: "post",
			url: "http://godalla.com/app/bdcexchange",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__bfc:var_frocurr_id, a__btc:var_tocurr_id, a__loca:$rootScope.location.formatted_address, a__locll:$scope.location.geometry.location, b__sr: $scope.bdc.sell, b__br: $scope.bdc.buy}
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
			}
			else if(resp.data.status == 66 || resp.data.status == 77){
				$ionicPopup.alert({
					title: 'Invalid Rates',
					template: "Please enter valid rates for your request to be posted."
				});
			}
			else if(resp.data.status == 505){
				$ionicPopup.alert({
					title: 'Wrong field entry',
					template: "Only numbers and decimals are allowed in the amount and rate fields."
				});
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Duplicate request',
						template: "You have already posted this ad."
					});
				}
				else if(resp.data.status == 3){
					$ionicPopup.alert({
						title: 'Oops!',
						template: "Something seems to have gone wrong. Please try again later."
					});
				}
				else if(resp.data.status == 1){
					//Magic!
					//$scope.sell_form.$setPristine();
					$scope.location.length = 0;
					$scope.seller = {};
					$scope.sym = "";
					$scope.ssym = "";
					$scope.bdc = {};
					$scope.seller.amount = 0;
					$scope.seller.tamount = 0;
					$scope.ocurr = "0.00";
					$scope.range.mplier = $scope.ocurr;
					$scope.range.rmplier = '0';
					$scope.range.val = 50;
					$scope.range.factor = 0;
					$scope.range.ifactor = 0;
					$scope.range.mplierreverse = 0;
					$ionicScrollDelegate.scrollTop();
					$scope.showalert = 1;
					$timeout(function() {
						$scope.showalert = 0;
					}, 5000);
				}
			}
		}, function(err) {
			$scope.the_loader = 0;
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error posting your request!',
				template: err.status
			});
		});
	}
	$scope.updateSymbol = function (){
		if($scope.seller.frocurr){
			var spl_afrocurr = $scope.seller.frocurr.split(",",2);
			$scope.asym = spl_afrocurr[1];
		}
		else{
			$scope.asym = "";
		}
		
		if($scope.seller.frocurr){
			var spl_frocurr = $scope.seller.frocurr.split(",",2);
			var spl_frocurr_id = spl_frocurr[0];
			var spl_frocurr_sym = spl_frocurr[1];
			var needle = spl_frocurr_id;
			
			if($scope.seller.tocurr){
				var spl_tocurr = $scope.seller.tocurr.split(",",2);
				var spl_tocurr_id = spl_tocurr[0];
				var spl_tocurr_sym = spl_tocurr[1];
				var needle2 = spl_tocurr_id;
				$scope.currAction = 1;
				
				var haystack = $scope.currencies;
				var length = haystack.length;
				
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle2){
						$scope.sabbrev = haystack[i].abbreviation;
						$scope.ssym = haystack[i].symbol;
					}
				}
				
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle){
						$scope.abbrev = haystack[i].abbreviation;
						$scope.sym = haystack[i].symbol;
					}
				}
				$http({
					method: "post",
					url: "http://godalla.com/app/convert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rate){
						$scope.seller.tamount = 1;
						$scope.ocurr = resp.data.rate;
						$scope.aocurr = resp.data.rate;
						$scope.range.factor = $scope.ocurr/50;
						$scope.range.mplier = $scope.aocurr;
						$scope.range.val = 50;
						
						if($scope.range.mplier < 1){
							$scope.range.mplierreverse = 1;
							$scope.rocurr = 1/$scope.ocurr;
							$scope.range.rmplier = 1/$scope.range.mplier;
						}
						
						if($scope.aocurr < 0.00005){
							$scope.range.ifactor = 0.000005;
						}
						else if($scope.aocurr < 0.00051){
							$scope.range.ifactor = 0.00005;
						}
						else if($scope.aocurr < 0.0051){
							$scope.range.ifactor = 0.0005;
						}
						else if($scope.aocurr < 0.051){
							$scope.range.ifactor = 0.005;
						}
						else if($scope.aocurr < 0.51){
							$scope.range.ifactor = 0.05;
						}
						else if($scope.aocurr < 2.1){
							$scope.range.ifactor = 0.1;
						}
						else if($scope.aocurr < 5.1){
							$scope.range.ifactor = 0.25;
						}
						else if($scope.aocurr < 6){
							$scope.range.ifactor = 0.5;
						}
						else if($scope.aocurr < 11){
							$scope.range.ifactor = 0.10;
						}
						else if($scope.aocurr < 501){
							$scope.range.ifactor = 1;
						}
						else if($scope.aocurr < 1001){
							$scope.range.ifactor = 10;
						}
						else if($scope.aocurr < 10001){
							$scope.range.ifactor = 100;
						}
						else if($scope.aocurr < 100001){
							$scope.range.ifactor = 1000;
						}
						else{
							$scope.range.ifactor = 10000;
						}
						
						if($scope.seller.amount == ""){
							$scope.seller.amount = 1;
						}
					}
				});
				$http({
					method: "post",
					url: "http://godalla.com/app/blackconvert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rates){
						$scope.black.sell = resp.data.sellrate;
						$scope.black.buy = resp.data.buyrate;
					}
					else{
						$scope.black= [];
					}
				});
			}
		}
	}
	$scope.updateSSymbol = function (){
		if($scope.seller.frocurr){
			var spl_frocurr = $scope.seller.frocurr.split(",",2);
			var spl_frocurr_id = spl_frocurr[0];
			var spl_frocurr_sym = spl_frocurr[1];
			var needle = spl_frocurr_id;
			
			var spl_tocurr = $scope.seller.tocurr.split(",",2);
			var spl_tocurr_id = spl_tocurr[0];
			var spl_tocurr_sym = spl_tocurr[1];
			var needle2 = spl_tocurr_id;
			
			var haystack = $scope.currencies;
			var length = haystack.length;
			for(var i = 0; i < length; i++) {
				if(haystack[i].id == needle){
					$scope.abbrev = haystack[i].abbreviation;
					$scope.sym = haystack[i].symbol;
				}
			}
			if($scope.seller.tocurr){
				$scope.currAction = 1;
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle2){
						$scope.sabbrev = haystack[i].abbreviation;
						$scope.ssym = haystack[i].symbol;
					}
				}
				$http({
					method: "post",
					url: "http://godalla.com/app/convert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					$scope.range.mplierreverse = 0;
					if(resp.data.rate){
						$scope.seller.tamount = 1;
						$scope.ocurr = resp.data.rate;
						$scope.aocurr = resp.data.rate;
						$scope.range.factor = $scope.ocurr/50;
						$scope.range.mplier = $scope.aocurr;
						$scope.range.val = 50;
						$scope.rval = 50;
						
						if($scope.range.mplier < 1){
							$scope.range.mplierreverse = 1;
							$scope.rocurr = 1/$scope.ocurr;
							$scope.range.rmplier = 1/$scope.range.mplier;
						}
						
						if($scope.aocurr < 0.00005){
							$scope.range.ifactor = 0.000005;
						}
						else if($scope.aocurr < 0.00051){
							$scope.range.ifactor = 0.00005;
						}
						else if($scope.aocurr < 0.0051){
							$scope.range.ifactor = 0.0005;
						}
						else if($scope.aocurr < 0.051){
							$scope.range.ifactor = 0.005;
						}
						else if($scope.aocurr < 0.51){
							$scope.range.ifactor = 0.05;
						}
						else if($scope.aocurr < 2.1){
							$scope.range.ifactor = 0.1;
						}
						else if($scope.aocurr < 5.1){
							$scope.range.ifactor = 0.25;
						}
						else if($scope.aocurr < 6){
							$scope.range.ifactor = 0.5;
						}
						else if($scope.aocurr < 11){
							$scope.range.ifactor = 0.10;
						}
						else if($scope.aocurr < 501){
							$scope.range.ifactor = 1;
						}
						else if($scope.aocurr < 1001){
							$scope.range.ifactor = 10;
						}
						else if($scope.aocurr < 10001){
							$scope.range.ifactor = 100;
						}
						else if($scope.aocurr < 100001){
							$scope.range.ifactor = 1000;
						}
						else{
							$scope.range.ifactor = 10000;
						}
						
						if($scope.seller.amount == ""){
							$scope.seller.amount = 1;
						}
					}
				});
				$http({
					method: "post",
					url: "http://godalla.com/app/blackconvert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rates){
						$scope.black.sell = resp.data.sellrate;
						$scope.black.buy = resp.data.buyrate;
					}
					else{
						$scope.black= [];
					}
				});
			}
		}
	}
	$scope.getCurrs = function (){
		$scope.the_loader = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/currencies"
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			$scope.currencies = resp.data;
		});
	}
	$scope.getCurrs();
})
.controller('ExchangeCtrl', function($scope, $ionicConfig, $rootScope, $http, $ionicLoading, $localstorage, $ionicPopup, $state) {
	var a__li = $localstorage.getObject('a__li');
	$scope.the_loader= 0;
	$scope.location= {};
	$scope.location.geometry = {};
	$scope.currencies = {};
	$scope.seller = {};
	$scope.seller.amount = 0;
	$scope.seller.tamount = 0;
	$scope.ocurr = "0.00";
	$scope.socurr = "0.00";
	$scope.rocurr = 0;
	$scope.rval = 0;
	$scope.abbrev = "";
	$scope.sabbrev = "";
	$scope.asym = "";
	$scope.sym = "";
	$scope.ssym = "";
	$scope.currAction = 0;
	$scope.range = [];
	$scope.range.mplier = $scope.ocurr;
	$scope.range.rmplier = '0';
	$scope.range.val = 50;
	$scope.range.factor = 0;
	$scope.range.ifactor = 0;
	$scope.range.mplierreverse = 0;
	$scope.buttonPressed = 0;
	$scope.black = [];
	
	$scope.$watch('range.val', function(newValue, oldValue) {
		if($scope.range.mplierreverse == 0){
			$scope.range.mplier = $scope.range.factor*$scope.range.val;
		}
		else{
			var nu_scope_factor = (1/$scope.ocurr)/50;
			$scope.range.mplier = $scope.range.factor*$scope.range.val;
			if($scope.buttonPressed == 1){
				$scope.buttonPressed = 0;
				if((1/$scope.ocurr) < 10){
					var rxrrr = parseFloat(nu_scope_factor*$scope.range.val);
					$scope.range.rmplier = rxrrr;
				}
				else{
					$scope.range.rmplier = parseInt(nu_scope_factor*$scope.range.val);
				}
			}
			else{
				$scope.range.rmplier = nu_scope_factor*$scope.range.val;
			}
		}
		if($scope.range.mplier == 0){
			$scope.seller.tamount = 0;
		}
		else{
			if($scope.range.mplierreverse == 0){
				$scope.seller.tamount = $scope.seller.amount/$scope.range.mplier;
			}
			else{
				$scope.seller.tamount = $scope.seller.amount*$scope.range.rmplier;
			}
		}
	});
	$scope.$watch('seller.amount', function(newValue, oldValue) {
		if($scope.seller){
			if($scope.seller.amount){
				if($scope.seller.amount == 0){
					$scope.seller.amount = 1;
				}
				if($scope.range.mplier == 0){
					$scope.seller.tamount = 0;
				}
				else{
					if($scope.range.mplierreverse == 0){
						$scope.seller.tamount = $scope.seller.amount/$scope.range.mplier;
					}
					else{
						$scope.seller.tamount = $scope.seller.amount*$scope.range.rmplier;
					}
				}
			}
		}
	});
	
	$scope.$watch('seller.frocurr', function(newValue, oldValue) {
		if($scope.seller){
			$scope.seller.frocurr = newValue;
			if($scope.seller.frocurr == $scope.seller.tocurr && ($scope.seller.frocurr != "")){
				$scope.seller.tocurr = oldValue;
			}
			$scope.updateSymbol();
		}
	});
	
	$scope.$watch('seller.tocurr', function(newValue, oldValue) {
		if($scope.seller){
			$scope.seller.tocurr = newValue;
			if($scope.seller.frocurr == $scope.seller.tocurr && ($scope.seller.tocurr != "")){
				$scope.seller.frocurr = oldValue;
			}
			$scope.updateSSymbol();
		}
	});
	
	$scope.scrollAcc = function (){
		document.body.scrollTop = document.getElementById("the_input").offset().top;
	}
	
	$scope.increaseAmt = function(){
		if($scope.range.mplierreverse == 0){
			var theInt = Math.floor($scope.range.mplier);
			var theDecO = ($scope.range.mplier)%1;
			var theDec = (parseFloat(theDecO).toFixed(4)).toString().split(".")[1];
			if(parseInt(theDec) == 0){
				if(theInt == 0){
					theInt = 1;
				}
				$scope.range.mplier = theInt+$scope.range.ifactor;
				$scope.range.val = (theInt+$scope.range.ifactor)/$scope.range.factor;
			}
			else{
				if($scope.range.mplier != 0){
					if(parseFloat($scope.range.ifactor) > parseFloat(theDecO)){
						$scope.range.mplier = theInt+$scope.range.ifactor;
						$scope.range.val = (theInt+$scope.range.ifactor)/$scope.range.factor;
					}
					else{
						var theDec1 = $scope.range.ifactor;
						while (parseFloat(theDec1).toFixed(4) <= parseFloat(theDecO).toFixed(4)) {
							theDec1 = theDec1+$scope.range.ifactor;
						}
						$scope.range.mplier = theInt+theDec1;
						$scope.range.val = (theInt+theDec1)/$scope.range.factor;
					}
				}
			}
		}
		else{
			$scope.buttonPressed = 1;
			var increments = 0;
			var nu_scope_factor = (1/$scope.ocurr)/50;
			var ol_val = $scope.range.val;
			
			if((1/$scope.ocurr) < 0.25){
				increments = 0.0025;
			}
			else if((1/$scope.ocurr) < 0.5){
				increments = 0.005;
			}
			else if((1/$scope.ocurr) < 1){
				increments = 0.025;
			}
			else if((1/$scope.ocurr) < 2){
				increments = 0.05;
			}
			else if((1/$scope.ocurr) < 5){
				increments = 0.25;
			}
			else if((1/$scope.ocurr) < 10){
				increments = 0.5;
			}
			else if((1/$scope.ocurr) < 500){
				increments = 1;
			}
			else if((1/$scope.ocurr) < 1000){
				increments = 10;
			}
			else if((1/$scope.ocurr) < 5000){
				increments = 100;
			}
			else if((1/$scope.ocurr) < 10000){
				increments = 1000;
			}
			
			var new_val = ($scope.range.rmplier+increments)/nu_scope_factor;
			if((1/$scope.ocurr) < 10){
				if(parseFloat(new_val).toFixed(4) == parseFloat(ol_val).toFixed(4)){
					var thefigure = new_val+increments;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4)){
					do {
						thefigure = parseFloat(final_val)+increments;
						final_val = thefigure;
					} while (parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4));
				}
			}
			else{
				if(new_val == ol_val){
					var thefigure = parseInt(new_val)+increments;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val)){
					do {
						thefigure = parseInt(final_val)+increments;
						final_val = thefigure;
					} while (parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val));
				}
			}
			$scope.range.val = final_val;
		}
	}
	$scope.decreaseAmt = function(){
		if($scope.range.mplierreverse == 0){
			var theInt = Math.floor($scope.range.mplier);
			var theDecO = ($scope.range.mplier)%1;
			var theDec = (parseFloat(theDecO).toFixed(4)).toString().split(".")[1];
			if(parseInt(theDec) == 0){
				if(theInt == 0){
					theInt = 1;
				}
				$scope.range.mplier = theInt-$scope.range.ifactor;
				$scope.range.val = (theInt-$scope.range.ifactor)/$scope.range.factor;
			}
			else{
				if($scope.range.mplier != 0){
					if(parseFloat($scope.range.ifactor) < parseFloat(theDecO)){
						if(theInt == 0){
							$scope.range.mplier = theDecO-$scope.range.ifactor;
							$scope.range.val = (theDecO-$scope.range.ifactor)/$scope.range.factor;
						}
						else{
							var theDec1 = $scope.range.ifactor;
							while (parseFloat(theDec1).toFixed(4) <= parseFloat(theDecO).toFixed(4)) {
								theDec1 = theDec1+$scope.range.ifactor;
							}
							if(parseFloat(theDec1).toFixed(4) == parseFloat(theDecO+$scope.range.ifactor).toFixed(4)){
								theDec1 = theDec1-$scope.range.ifactor;
							}
							$scope.range.mplier = (theInt+theDec1)-$scope.range.ifactor;
							$scope.range.val = (theInt+theDec1-$scope.range.ifactor)/$scope.range.factor;
						}
					}
					else{
						var theDec1 = $scope.range.ifactor;
						while (parseFloat(theDec1).toFixed(4) >= parseFloat(theDecO).toFixed(4)) {
							theDec1 = theDec1-$scope.range.ifactor;
						}
						$scope.range.mplier = theInt-theDec1;
						$scope.range.val = (theInt-theDec1)/$scope.range.factor;
					}
				}
			}
		}
		else{
			$scope.buttonPressed = 1;
			var decrements = 0;
			var nu_scope_factor = (1/$scope.ocurr)/50;
			var ol_val = $scope.range.val;
			
			if((1/$scope.ocurr) < 0.25){
				decrements = 0.0025;
			}
			else if((1/$scope.ocurr) < 0.5){
				decrements = 0.005;
			}
			else if((1/$scope.ocurr) < 1){
				decrements = 0.025;
			}
			else if((1/$scope.ocurr) < 2){
				decrements = 0.05;
			}
			else if((1/$scope.ocurr) < 5){
				decrements = 0.25;
			}
			else if((1/$scope.ocurr) < 10){
				decrements = 0.5;
			}
			else if((1/$scope.ocurr) < 500){
				decrements = 1;
			}
			else if((1/$scope.ocurr) < 1000){
				decrements = 10;
			}
			else if((1/$scope.ocurr) < 5000){
				decrements = 100;
			}
			else if((1/$scope.ocurr) < 10000){
				decrements = 1000;
			}
			
			var new_val = ($scope.range.rmplier-decrements)/nu_scope_factor;
			if((1/$scope.ocurr) < 10){
				if(parseFloat(new_val).toFixed(4) == parseFloat(ol_val).toFixed(4)){
					var thefigure = new_val-decrements;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4)){
					do {
						thefigure = parseFloat(final_val)-decrements;
						final_val = thefigure;
					} while (parseFloat($scope.range.rmplier).toFixed(4) == parseFloat(nu_scope_factor*final_val).toFixed(4));
				}
			}
			else{
				if(new_val == ol_val){
					var thefigure = parseInt(new_val)-decrements;
					var final_val = thefigure;
				}
				else{
					var final_val = new_val;
				}
				if(parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val)){
					do {
						thefigure = parseInt(final_val)-decrements;
						final_val = thefigure;
					} while (parseInt($scope.range.rmplier) == parseInt(nu_scope_factor*final_val));
				}
			}
			$scope.range.val = final_val;
		}
	}
	$scope.sellReq = function (){
		var var_frocurr = $scope.seller.frocurr.split(",",2);
		var var_frocurr_id = var_frocurr[0];
		var var_frocurr_sym = var_frocurr[1];
		
		var var_tocurr = $scope.seller.tocurr.split(",",2);
		var var_tocurr_id = var_tocurr[0];
		var var_tocurr_sym = var_tocurr[1];
		$scope.the_loader= 1;
		if(!$scope.seller.amount){
			$scope.seller.amount = 0;
		}
		var type_of_conversion= "";
		if($scope.range.mplier < $scope.range.rmplier){
			$scope.aocurr = $scope.range.rmplier;
			type_of_conversion = 2;
		}
		else{
			$scope.aocurr = $scope.range.mplier;
			type_of_conversion = 1;
		}
		
		$http({
			method: "post",
			url: "http://godalla.com/app/exchange",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__ba:$scope.seller.amount, a__bfc:var_frocurr_id, a__btc:var_tocurr_id, a__loca:$scope.location.formatted_address, a__locll:$scope.location.geometry.location, a__rate:$scope.aocurr, a__typeo:type_of_conversion}
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
			}
			else if(resp.data.status == 505){
				$ionicPopup.alert({
					title: 'Wrong field entry',
					template: "Only numbers and decimals are allowed in the amount and rate fields."
				});
			}
			else{
				if(resp.data.status == 4){
					$ionicPopup.alert({
						title: 'Duplicate request',
						template: "You have already posted this ad."
					});
				}
				else if(resp.data.status == 3){
					$ionicPopup.alert({
						title: 'Oops!',
						template: "Something seems to have gone wrong. Please try again later."
					});
				}
				else if(resp.data.status == 1){
					//Magic!
					//$scope.sell_form.$setPristine();
					$scope.seller = {};
					$scope.seller.amount = 0;
					$scope.seller.tamount = 0;
					$scope.seller.frocurr = "";
					$scope.seller.tocurr = "";
					$scope.ocurr = "0.00";
					$scope.range.mplier = $scope.ocurr;
					$scope.range.rmplier = '0';
					$scope.range.val = 50;
					$scope.range.factor = 0;
					$scope.range.ifactor = 0;
					$scope.range.mplierreverse = 0;
					$scope.buttonPressed = 0;
					$scope.location.length = 0;
					//document.getElementById("the-google-dalla-input-sell").value = "";
					$state.go('exchange.listings',{id:resp.data.request, fro:var_frocurr_sym, tro:var_tocurr_sym});
				}
			}
		}, function(err) {
			$scope.the_loader = 0;
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error posting your ad!',
				template: err.status
			});
		});
	}
	$scope.updateSymbol = function (){
		if($scope.seller.frocurr){
			var spl_afrocurr = $scope.seller.frocurr.split(",",2);
			$scope.asym = spl_afrocurr[1];
		}
		else{
			$scope.asym = "";
		}
		
		if($scope.seller.frocurr){
			var spl_frocurr = $scope.seller.frocurr.split(",",2);
			var spl_frocurr_id = spl_frocurr[0];
			var spl_frocurr_sym = spl_frocurr[1];
			var needle = spl_frocurr_id;
			
			if($scope.seller.tocurr){
				var spl_tocurr = $scope.seller.tocurr.split(",",2);
				var spl_tocurr_id = spl_tocurr[0];
				var spl_tocurr_sym = spl_tocurr[1];
				var needle2 = spl_tocurr_id;
				$scope.currAction = 1;
				
				var haystack = $scope.currencies;
				var length = haystack.length;
				
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle2){
						$scope.sabbrev = haystack[i].abbreviation;
						$scope.ssym = haystack[i].symbol;
					}
				}
				
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle){
						$scope.abbrev = haystack[i].abbreviation;
						$scope.sym = haystack[i].symbol;
					}
				}
				$http({
					method: "post",
					url: "http://godalla.com/app/convert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rate){
						$scope.seller.tamount = 1;
						$scope.ocurr = resp.data.rate;
						$scope.aocurr = resp.data.rate;
						$scope.range.factor = $scope.ocurr/50;
						$scope.range.mplier = $scope.aocurr;
						$scope.range.val = 50;
						
						if($scope.range.mplier < 1){
							$scope.range.mplierreverse = 1;
							$scope.rocurr = 1/$scope.ocurr;
							$scope.range.rmplier = 1/$scope.range.mplier;
						}
						
						if($scope.aocurr < 0.00005){
							$scope.range.ifactor = 0.000005;
						}
						else if($scope.aocurr < 0.00051){
							$scope.range.ifactor = 0.00005;
						}
						else if($scope.aocurr < 0.0051){
							$scope.range.ifactor = 0.0005;
						}
						else if($scope.aocurr < 0.051){
							$scope.range.ifactor = 0.005;
						}
						else if($scope.aocurr < 0.51){
							$scope.range.ifactor = 0.05;
						}
						else if($scope.aocurr < 2.1){
							$scope.range.ifactor = 0.1;
						}
						else if($scope.aocurr < 5.1){
							$scope.range.ifactor = 0.25;
						}
						else if($scope.aocurr < 6){
							$scope.range.ifactor = 0.5;
						}
						else if($scope.aocurr < 11){
							$scope.range.ifactor = 0.10;
						}
						else if($scope.aocurr < 501){
							$scope.range.ifactor = 1;
						}
						else if($scope.aocurr < 1001){
							$scope.range.ifactor = 10;
						}
						else if($scope.aocurr < 10001){
							$scope.range.ifactor = 100;
						}
						else if($scope.aocurr < 100001){
							$scope.range.ifactor = 1000;
						}
						else{
							$scope.range.ifactor = 10000;
						}
						
						if($scope.seller.amount == ""){
							$scope.seller.amount = 1;
						}
					}
				});
				$http({
					method: "post",
					url: "http://godalla.com/app/blackconvert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rates){
						$scope.black.sell = resp.data.sellrate;
						$scope.black.buy = resp.data.buyrate;
					}
					else{
						$scope.black= [];
					}
				});
			}
		}
	}
	$scope.updateSSymbol = function (){
		if($scope.seller.frocurr){
			var spl_frocurr = $scope.seller.frocurr.split(",",2);
			var spl_frocurr_id = spl_frocurr[0];
			var spl_frocurr_sym = spl_frocurr[1];
			var needle = spl_frocurr_id;
			
			var spl_tocurr = $scope.seller.tocurr.split(",",2);
			var spl_tocurr_id = spl_tocurr[0];
			var spl_tocurr_sym = spl_tocurr[1];
			var needle2 = spl_tocurr_id;
			
			var haystack = $scope.currencies;
			var length = haystack.length;
			for(var i = 0; i < length; i++) {
				if(haystack[i].id == needle){
					$scope.abbrev = haystack[i].abbreviation;
					$scope.sym = haystack[i].symbol;
				}
			}
			if($scope.seller.tocurr){
				$scope.currAction = 1;
				for(var i = 0; i < length; i++) {
					if(haystack[i].id == needle2){
						$scope.sabbrev = haystack[i].abbreviation;
						$scope.ssym = haystack[i].symbol;
					}
				}
				$http({
					method: "post",
					url: "http://godalla.com/app/convert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					$scope.range.mplierreverse = 0;
					if(resp.data.rate){
						$scope.seller.tamount = 1;
						$scope.ocurr = resp.data.rate;
						$scope.aocurr = resp.data.rate;
						$scope.range.factor = $scope.ocurr/50;
						$scope.range.mplier = $scope.aocurr;
						$scope.range.val = 50;
						$scope.rval = 50;
						
						if($scope.range.mplier < 1){
							$scope.range.mplierreverse = 1;
							$scope.rocurr = 1/$scope.ocurr;
							$scope.range.rmplier = 1/$scope.range.mplier;
						}
						
						if($scope.aocurr < 0.00005){
							$scope.range.ifactor = 0.000005;
						}
						else if($scope.aocurr < 0.00051){
							$scope.range.ifactor = 0.00005;
						}
						else if($scope.aocurr < 0.0051){
							$scope.range.ifactor = 0.0005;
						}
						else if($scope.aocurr < 0.051){
							$scope.range.ifactor = 0.005;
						}
						else if($scope.aocurr < 0.51){
							$scope.range.ifactor = 0.05;
						}
						else if($scope.aocurr < 2.1){
							$scope.range.ifactor = 0.1;
						}
						else if($scope.aocurr < 5.1){
							$scope.range.ifactor = 0.25;
						}
						else if($scope.aocurr < 6){
							$scope.range.ifactor = 0.5;
						}
						else if($scope.aocurr < 11){
							$scope.range.ifactor = 0.10;
						}
						else if($scope.aocurr < 501){
							$scope.range.ifactor = 1;
						}
						else if($scope.aocurr < 1001){
							$scope.range.ifactor = 10;
						}
						else if($scope.aocurr < 10001){
							$scope.range.ifactor = 100;
						}
						else if($scope.aocurr < 100001){
							$scope.range.ifactor = 1000;
						}
						else{
							$scope.range.ifactor = 10000;
						}
						
						if($scope.seller.amount == ""){
							$scope.seller.amount = 1;
						}
					}
				});
				$http({
					method: "post",
					url: "http://godalla.com/app/blackconvert",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {__f:$scope.sabbrev, __t:$scope.abbrev}
				})
				.then(function(resp) {
					$scope.currAction = 0;
					if(resp.data.rates){
						$scope.black.sell = resp.data.sellrate;
						$scope.black.buy = resp.data.buyrate;
					}
					else{
						$scope.black= [];
					}
				});
			}
		}
	}
	$scope.getCurrs = function (){
		$scope.the_loader = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/currencies"
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			$scope.currencies = resp.data;
		});
	}
	$scope.getCurrs();
})

.controller('SignupCtrl', function($scope,$http, $ionicPopup, $ionicLoading, $state, $localstorage, $templateCache, $q, $rootScope) {
	$scope.user = {};

	$scope.doSignUp = function() {
		if(!$scope.user.uname || !$scope.user.password || !$scope.user.email){
			var alertPopup = $ionicPopup.alert({
				title: 'Sign Up failed!',
				template: 'All fields are required to complete signup'
			});
		}
		else{
			$ionicLoading.show({
				content: '<i class="ion-loading-c"></i>',
				animation: 'fade-in',
				noBackdrop: false
			});
			$http({
				method: "post",
				url: "http://godalla.com/app/signup",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {a__e:$scope.user.email, a__p:$scope.user.password, a__u:$scope.user.uname}
			})
			.then(function(resp) {
				$ionicLoading.hide();
				if(resp.data.status == 5){
					$ionicPopup.alert({
						title: "Sign up failed",
						template: "The signup fields cannot be empty"
					});
				}
				else if(resp.data.status == 0){
					$ionicPopup.alert({
						title: "Oops! Something went wrong",
						template: "Please try again later"
					});
				}
				else if(resp.data.status == 4){
					$ionicPopup.alert({
						title: "Sign up failed",
						template: "Email address already exists in our database"
					});
					$state.go('auth.login');
				}
				else{
					if(resp.data.status == 1){
						$localstorage.setObject('a__li', {
							ua: resp.data.k___yc
						});
						$state.go('app.exchange');
					}
					else{
						$ionicPopup.alert({
							title: "Woah there!",
							template: "You already have a dalla! account. Please sign in or click forgot password if you need help logging in."
						});
					}					
				}				
			}, function(err) {
				$ionicLoading.hide();
				console.error('ERR', err);
				$ionicPopup.alert({
					title: 'Login Error!',
					template: err.status
				});
			});
		}
    };
})

.controller('ForgotPasswordCtrl', function($scope, $ionicConfig, $ionicLoading, $ionicPopup, $http) {
	$scope.user = {};
	$scope.recoverPassword = function() {
		if(!$scope.user.uname){
			var alertPopup = $ionicPopup.alert({
				title: 'Recyover failed!',
				template: 'Please enter your username or email address in the field provided'
			});
		}
		else{
			$ionicLoading.show({
				content: '<i class="ion-loading-c"></i>',
				animation: 'fade-in',
				noBackdrop: false
			});
			$http({
				method: "post",
				url: "http://godalla.com/app/forgot",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {a__e:$scope.user.uname}
			})
			.then(function(resp) {
				$ionicLoading.hide();
				if(resp.data.status == 5){
					$ionicPopup.alert({
						title: "Recovery failed",
						template: "The username/email field cannot be empty"
					});
				}
				else if(resp.data.status == 0){
					$ionicPopup.alert({
						title: "Recovery failed",
						template: "Unable to find a profile matching your username/email"
					});
				}
				else{
					$ionicPopup.alert({
						title: "Recovery successful!",
						template: "Please check your email for details on how to reset your password"
					});
				}				
			}, function(err) {
				$ionicLoading.hide();
				console.error('ERR', err);
				$ionicPopup.alert({
					title: 'Login Error!',
					template: err.status
				});
			});
		}
    };
})
.controller('ChatCtrl', function($scope, $ionicConfig, $http, $ionicLoading, $ionicPopup, $localstorage) {
	//Control notifications here
	var a__li = $localstorage.getObject('a__li');
	$scope.chtters = {};
	$scope.$on('$ionicView.enter', function() {
		$scope.notifications = {};
		$scope.notifications.inbox = 0;
		$scope.notifications.requests = 0;
		$http({
			method: "post",
			url: "http://godalla.com/app/getnotifs",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li}
		})
		.then(function(resp) {
			if(resp.data.status == 1){
				$scope.notifications.inbox = resp.data.inbox;
				//$scope.notifications.requests = resp.data.requests;
			}
		});
	});
	$scope.$on('$ionicView.enter', function() {
		$scope.the_loader = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/chats",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li}
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			if(resp.data.status == 55 || resp.data.status == 5){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
			}
			else{
				if(!resp.data.status){
					$scope.chtters = resp.data;
				}
			}
		}, function(err) {
			$scope.the_loader = 0;
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Error retrieving your conversations',
				template: err.status
			});
		});
	});
})
.controller('ConvoCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $http, $stateParams, $ionicActionSheet, $ionicScrollDelegate, $timeout, $interval, $localstorage, $q) {
	$scope.the_loader = 0;
	var a__li = $localstorage.getObject('a__li');
	var messageCheckTimer;
    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar;
    var scroller;
    var txtInput;
	var me = {};
	var visitortime = new Date();
    var visitortimezone = visitortime.getTimezoneOffset()/60;
	$scope.messages = [];
	$scope.last_message = "";
	$scope.getChatMessage = function() {
		$http({
			method: "post",
			url: "http://godalla.com/app/getmessages",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__u:$scope.chatter.chat, c__lm:$scope.last_message, c__tz: visitortimezone}
		})
		.then(function(resp) {
			var respds = resp.data.status;
			if(resp.data.status != 0){
				$scope.last_message = resp.data[0].last_message;
				//$scope.messages.push(resp.data);
				$scope.messages = $scope.messages.concat(resp.data);
				$timeout(function() {
					$scope.keepKeyboardOpen();
					viewScroll.scrollBottom(true);
				}, 0);
			}
		});	
	}
	$scope.chatter = $stateParams;
    // this could be on $rootScope rather than in $stateParams
    $scope.user = {
      username: 'Me'
    };
	
	moment.locale('en', {
	  relativeTime: {
		future: "in %s",
		past: "%s ago",
		s: "%d sec",
		m: "a minute",
		mm: "%d minutes",
		h: "an hour",
		hh: "%d hours",
		d: "a day",
		dd: "%d days",
		M: "a month",
		MM: "%d months",
		y: "a year",
		yy: "%d years"
	  }
	});
	
	$scope.$on('$ionicView.enter', function() {
		$scope.the_loader = 1;
		$scope.getMessages();
		$timeout(function() {
			footerBar = document.body.querySelector('#userMessagesView .bar-footer');
			scroller = document.body.querySelector('#userMessagesView .scroll-content');
			txtInput = angular.element(footerBar.querySelector('textarea'));
		}, 0);
		messageCheckTimer = $interval(function() {
			// here you could check for new messages if your app doesn't use push notifications or user disabled them
			$scope.getChatMessage();
		}, 10000);
	});
	
	$scope.$on('$ionicView.leave', function() {
		if (angular.isDefined(messageCheckTimer)) {
			$interval.cancel(messageCheckTimer);
			messageCheckTimer = undefined;
		}
	});
	
	/*$scope.$on('$ionicView.beforeLeave', function() {
		if (!$scope.input.message || $scope.input.message === '') {
			//localStorage.removeItem('userMessage-' + $scope.toUser._id);
		}
	});*/
	
	$scope.getMessages = function () {
		$http({
			method: "post",
			url: "http://godalla.com/app/chat",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__u:$scope.chatter.chat, c__tz: visitortimezone}
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			if(resp.data.status == 5){
				$ionicPopup.alert({
					title: "Chat retrieval failed",
					template: "Sorry, your chat with "+$scope.chatter.chat+"could not be retrieved."
				});
			}
			else if(resp.data.status == 55){
				$ionicPopup.alert({
					title: 'Authentication Error!',
					template: "Sorry, your device could not be authenticated. Please logout and login to try again."
				});
			}
			else if(resp.data.status == 555){
				$ionicPopup.alert({
					title: 'Chat Error!',
					template: "Sorry, we could not authenticate the profile you wish to chat with."
				});
			}
			else{
				$scope.doneLoading = true;
				if(!resp.data.status){
					$scope.messages = resp.data;
					$scope.last_message = resp.data[0].last_message;
					//Contd alert($scope.last_message);
					$timeout(function() {
						viewScroll.scrollBottom();
					}, 0);
				}
			}				
		}, function(err) {
			$scope.the_loader = 0;
			console.error('ERR', err);
			$ionicPopup.alert({
				title: 'Chat initialisation error!',
				template: err.status
			});
		});
	}
	
	$scope.$watch('input.message', function(newValue, oldValue) {
		if(!newValue){
			newValue = '';
		}
		//localStorage['userMessage-' + $scope.toUser._id] = newValue;
	});
	
	$scope.sendMessage = function(sendMessageForm) {
		var message = {};
		var messagethread = $scope.messages;
		// if you do a web service call this will be needed as well as before the viewScroll calls
		// you can't see the effect of this in the browser it needs to be used on a real device
		// for some reason the one time blur event is not firing in the browser but does on devices
		$scope.keepKeyboardOpen();
		
		$http({
			method: "post",
			url: "http://godalla.com/app/sendchat",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li, a__u:$scope.chatter.chat, c__m:$scope.input.message}
		})
		.then(function(resp) {
			if(resp.data.status == 555){
				//Chat does not exist
			}
			else if(resp.data.status == 55){
				//Not authorized to perform action
			}
			else if(resp.data.status == 2){
				//Something went wrong
			}
			else{
				if(resp.data.id){
					$scope.last_message = resp.data.id;
					//alert($scope.last_message);
				}
			}				
		},
		function(err) {
			//alert(err);
		});
		
		
		
		
		//Slot this into the message ish somehow
		
		message._id = new Date().getTime();
		message.message = $scope.input.message;
		message.date = new Date();
		message.uoc = "true";

		$scope.input.message = '';
		if(messagethread == "null"){
			$scope.messages = [message];
		}
		else{
			$scope.messages.push(message);
		}
		
		$timeout(function() {
			$scope.keepKeyboardOpen();
			viewScroll.scrollBottom(true);
		}, 0);
		
		$timeout(function() {
			$scope.messages.push($scope.getChatMessage());
			$scope.keepKeyboardOpen();
			viewScroll.scrollBottom(true);
		}, 2000);
		
		//});
    };
	
	// this keeps the keyboard open on a device only after sending a message, it is non obtrusive
	$scope.keepKeyboardOpen = function () {
		txtInput.one('blur', function() {
			txtInput[0].focus();
		});
	}
	
	$scope.onMessageHold = function(e, itemIndex, message) {
		$ionicActionSheet.show({
			buttons: [{
				text: 'Copy Text'
			},
			{
				text: 'Delete Message'
			}],
			buttonClicked: function(index) {
				switch (index) {
				case 0: // Copy Text
				//cordova.plugins.clipboard.copy(message.text);
				
				break;
				case 1: // Delete
				// no server side secrets here :~)
				$scope.messages.splice(itemIndex, 1);
				$timeout(function() {
				viewScroll.resize();
				}, 0);
				
				break;
				}
				
				return true;
			}
		});
	};
	
	$scope.onProfilePicError = function (ele) {
		this.ele.src = 'http://godalla.com/assets/avatar-dalla.png'; // set a fallback
	}
	
	// this prob seems weird here but I have reasons for this in my app, secret!
	/*$scope.viewProfile = function(msg) {
		$state.go('chat.conversation()');
	};*/
	
	// I emit this event from the monospaced.elastic directive, read line 480
	$scope.$on('taResize', function(e, ta) {
		if (!ta) return;
		
		var taHeight = ta[0].offsetHeight;
		
		if (!footerBar) return;
		
		var newFooterHeight = taHeight + 10;
		newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
		
		footerBar.style.height = newFooterHeight + 'px';
		scroller.style.bottom = newFooterHeight + 'px'; 
	});
})
.controller('ExchangeMainCtrl', function($scope, $ionicConfig, $window, $window, $ionicLoading, $state, $localstorage, $http, $ionicHistory) {
	//Control notifications here
	var a__li = $localstorage.getObject('a__li');
	$scope.goBack = function(){
		$ionicHistory.viewHistory().backView;
	}
	$scope.$on('$ionicView.beforeEnter', function (event, viewData) {
		viewData.enableBack = true;
	});
	$scope.$on('$ionicView.enter', function() {
		$scope.notifications = {};
		$scope.notifications.inbox = 0;
		$scope.notifications.requests = 0;
		$http({
			method: "post",
			url: "http://godalla.com/app/getnotifs",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {a__li:a__li}
		})
		.then(function(resp) {
			if(resp.data.status == 1){
				$scope.notifications.inbox = resp.data.inbox;
				//$scope.notifications.requests = resp.data.requests;
			}
		});
	});	
	$scope.changeRequest = function (id, bool){
		$http({
			method: "post",
			url: "http://godalla.com/app/exchangeadstoggle",
			data: {a__li:a__li, a__a: id, a__st: bool}
		})
		.then(function(resp) {
			if(resp.data.status !== 1){
				$scope.buyad.checked = bool;
			}
		});
	}
	$scope.countAds = function (){
		$scope.the_loader = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/countexchangeads",
			data: {a__li:a__li}
		})
		.then(function(resp) {
			$scope.the_loader = 0;
			if(resp.data.status != 0){
				$scope.adcount = resp.data.adcount;
				if($scope.adcount > 0){
					$scope.getBuyAds();
					if($scope.adcount > 10){
						$scope.adpager = 2;
						$scope.MoreItemsAvailable = true;
					}
				}
			}
		});
	}
	$scope.loadMoreRequests = function (pager){
		$scope.loadmoreaction = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/exchangeads",
			data: {a__li:a__li, p__gr: pager}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			if(resp.data.status != 0){
				if(($scope.adpager*10) >= $scope.adcount){
					$scope.MoreItemsAvailable = false;
				}
				else{
					$scope.MoreItemsAvailable = true;
					$scope.adpager = $scope.adpager+1;
				}
				$scope.buyads = $scope.buyads.concat(resp.data);
			}
		});
	}
	$scope.getBuyAds = function (){
		$scope.loadmoreaction = 1;
		$scope.the_loader = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/exchangeads",
			data: {a__li:a__li}
		})
		.then(function(resp) {
			$scope.loadmoreaction = 0;
			$scope.the_loader = 0;
			if(resp.data.status != 0){
				$scope.buyads = resp.data;
			}
		});
	}
	$scope.$on('$ionicView.enter', function() {
		$scope.countAds();
	});
})
.controller('ExhchangeListingsCtrl', function($scope, $ionicConfig, $window, $ionicLoading, $state, $localstorage, $http, $stateParams, $ionicPopup) {
	var a__li = $localstorage.getObject('a__li');
	$scope.req = $stateParams;
})
.controller('ExchangeProfile', function($scope, $stateParams, $localstorage, $http, $ionicLoading, $ionicPopup) {
	$scope.user = $stateParams;
	$scope.ads = {};
	$scope.adscount = 0;
	$scope.pager = 1;
	$scope.the_loader = 1;
	$http({
		method: "post",
		url: "http://godalla.com/app/countuserads",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: {a__u:$scope.user.profilename}
	})
	.then(function(resp) {
		$scope.the_loader = 0;
		$scope.adscount = resp.data;
		if($scope.adscount > 5){
			$scope.adscount = parseInt($scope.adscount) - 5;
			if($scope.adscount == 1){
				$scope.adscount = "+1 more request";
			}
			else{
				$scope.adscount = "+"+$scope.adscount+" more requests";
			}
		}
		else{
			$scope.adscount = 0;
		}
	});
	$http({
		method: "post",
		url: "http://godalla.com/app/userads",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: {a__u:$scope.user.profilename}
	})
	.then(function(resp) {
		$scope.the_loader = 0;
		if(resp.data.status == 0){
			$scope.ads.unfound = true;
		}
		else{
			$scope.ads = resp.data;
		}
	});
})
.controller('SettingsCtrl', function($scope, $http, $ionicLoading, $state, $localstorage, $cordovaCamera, $cordovaFileTransfer, $ionicPopup, $timeout) {
	var a__li = $localstorage.getObject('a__li');
	$scope.mysettings={};
	$scope.onloading = 0;
	
	$scope.getSettings = function(){
		$scope.onloading = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/avatar",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {
				a__li:a__li, a__un: $scope.mysettings.username, a__pn: $scope.mysettings.phone
			}
		})
		.then(function(resp) {
			$scope.onloading = 0;
			if(resp.data.status == 1){
				$scope.mysettings.avatar = resp.data.avatar;
				$scope.mysettings.username = resp.data.username;
				$scope.mysettings.phone = resp.data.phone;
			}
			$scope.onloading = 2;
			$timeout(function() {
				$scope.onloading = 0;
			}, 3000);
		});
	}
	
	$scope.updateSettings = function(){
		$scope.onloading = 1;
		$http({
			method: "post",
			url: "http://godalla.com/app/updatesettings",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {
				a__li:a__li, a__un: $scope.mysettings.username, a__pn: $scope.mysettings.phone
			}
		})
		.then(function(resp) {
			$scope.onloading = 0;
			if(resp.data.status == 1){
				$scope.mysettings.username = resp.data.username;
				$scope.mysettings.phone = resp.data.phone;
			}
			else if(resp.data.status == 0){
				$ionicPopup.alert({
					title: 'Username update failed',
					template: "Sorry, that username is already taken"
				});
			}
			else{
				$ionicPopup.alert({
					title: 'Username not updated',
					template: "Please try again later"
				});
			}
			$scope.onloading = 2;
			$timeout(function() {
				$scope.onloading = 0;
			}, 3000);
		});
	}
	
	$scope.uploadImg = function() {
		var options =   {
			quality: 50,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			encodingType: Camera.EncodingType.JPEG
		}
		
		$cordovaCamera.getPicture(options).then(
			function(fileURL) {
				var uploadOptions = new FileUploadOptions();
				uploadOptions.fileKey = "file";
				uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
				uploadOptions.mimeType = "image/jpeg";
				uploadOptions.chunkedMode = false;
				uploadOptions.params = {
					"a__li": $localstorage.getObject('a__li')
				};
				$ionicLoading.show({
					content: '<i class="ion-loading-c"></i>',
					animation: 'fade-in',
					noBackdrop: false
				});
				//alert(fileURL);
				$cordovaFileTransfer.upload("http://godalla.com/app/avatarx", fileURL, uploadOptions).then(
					function(result){
						//deferred.resolve(result);
						$ionicLoading.hide();
						if (result.response == "0x0"){
							$ionicPopup.alert({
								title: 'Upload failed',
								template: "No files were uploaded"
							});	
						}
						else if (result.response == "0x3"){
							$ionicPopup.alert({
								title: 'Upload failed',
								template: "Only JPEG, PNG and GIF files are allowed"
							});	
						}
						else if (result.response == "55"){
							$ionicPopup.alert({
								title: 'Upload failed',
								template: "Sorry, you are not authorized to do that"
							});	
						}
						else if (result.response == "2"){
							$ionicPopup.alert({
								title: 'Upload failed',
								template: "Something went wrong. Please try again"
							});	
						}
						else {
							var theImgString = result.response;
							var the_string = theImgString.split(',');
							$scope.mysettings.avatar = the_string[0];
							$scope.mysettings.userImageStyle = the_string[1];
						}
					},
					function(err) {
						//deferred.reject(err);
						//alert(JSON.stringify(err));
						$ionicLoading.hide();
						console.error('ERR', err);
						$ionicPopup.alert({
							title: 'Upload Error!',
							template: "Error code: "+err.code
						});
					}
				);
			},
			function(err){
				//deferred.reject(err);
				//$ionicLoading.hide();
				//alert(JSON.stringify(err));
				$ionicLoading.hide();
				console.error('ERR', err);
				$ionicPopup.alert({
					title: 'Upload Error!',
					template: JSON.stringify(err)
				});
			}   
		);
    };
	$scope.getSettings();
})
;

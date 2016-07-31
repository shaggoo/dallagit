angular.module('dallaapp.directives', [])
.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
})
.directive("decimals", function ($filter) {
    return {
        restrict: "A", // Only usable as an attribute of another HTML element
        require: "?ngModel",
        scope: {
            decimals: "@",
            decimalPoint: "@"
        },
        link: function (scope, element, attr, ngModel) {
            var decimalCount = parseInt(scope.decimals) || 2;
            var decimalPoint = scope.decimalPoint || ".";

            // Run when the model is first rendered and when the model is changed from code
            ngModel.$render = function() {
                if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
                    if (typeof decimalCount === "number") {
                        element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(".", ","));
                    } else {
                        element.val(ngModel.$modelValue.toString().replace(".", ","));
                    }
                }
            }

            // Run when the view value changes - after each keypress
            // The returned value is then written to the model
            ngModel.$parsers.unshift(function(newValue) {
                if (typeof decimalCount === "number") {
                    var floatValue = parseFloat(newValue.replace(",", "."));
                    if (decimalCount === 0) {
                        return parseInt(floatValue);
                    }
                    return parseFloat(floatValue.toFixed(decimalCount));
                }
                
                return parseFloat(newValue.replace(",", "."));
            });

            // Formats the displayed value when the input field loses focus
            element.on("change", function(e) {
                var floatValue = parseFloat(element.val().replace(",", "."));
                if (!isNaN(floatValue) && typeof decimalCount === "number") {
                    if (decimalCount === 0) {
                        element.val(parseInt(floatValue));
                    } else {
                        var strValue = floatValue.toFixed(decimalCount);
                        element.val(strValue.replace(".", decimalPoint));
                    }
                }
            });
        }
    }
})
.directive('map', function($rootScope) {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){
			var zValue = scope.$eval(attrs.zoom);
			var lat = scope.$eval(attrs.lat);
			var lng = scope.$eval(attrs.lng);
			var geocoder = new google.maps.Geocoder;
			
			var myLatlng = new google.maps.LatLng(lat,lng),
			mapOptions = {
			  zoom: zValue,
			  center: myLatlng
			},
			map = new google.maps.Map(element[0],mapOptions),
			
			myLocation = new google.maps.Marker({
				position: myLatlng,
				map: map,
				draggable:true
			});
			
			navigator.geolocation.getCurrentPosition(function(pos) {
				myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				map.setCenter(myLatlng);
				myLocation.setPosition(myLatlng);
				geocoder.geocode({'location': myLatlng}, function(results, status) {
					if(status === google.maps.GeocoderStatus.OK){
						if(results[1]){
							scope.$parent.location.formatted_address = results[1].formatted_address;
							scope.$parent.location.geometry.location = myLatlng;
							scope.$apply();
							document.getElementById('the-google-dalla-input').value = results[1].formatted_address;
							map.setCenter(myLatlng);
						}
					}
				});
				google.maps.event.addListener(myLocation, 'dragend', function(evt){
					myLatlng = evt.latLng;
					geocoder.geocode({'location': myLatlng}, function(results, status) {
						if(status === google.maps.GeocoderStatus.OK){
							if(results[1]){
								scope.$parent.location.formatted_address = results[1].formatted_address;
								scope.$parent.location.geometry.location = myLatlng;
								scope.$apply();
								document.getElementById('the-google-dalla-input').value = results[1].formatted_address;
								map.setCenter(myLatlng);
							}
						}
					});
				});
				scope.$watch('location.geometry.location', function() {
					if($rootScope.location){
						scope.$parent.location.geometry.location = $rootScope.location.geometry.location;
					}
					myLocation.setPosition(scope.$parent.location.geometry.location);
					map.setCenter(scope.$parent.location.geometry.location);
				});
			});
			
			geocoder.geocode({'location': myLatlng}, function(results, status) {
				if(status === google.maps.GeocoderStatus.OK){
					if(results[1]){
						//alert(JSON.stringify(scope.$parent.location));
						scope.$parent.location.formatted_address = results[1].formatted_address;
						scope.$parent.location.geometry.location = myLatlng;
						scope.$apply();
						document.getElementById('the-google-dalla-input').value = results[1].formatted_address;
					}
				}
			});
			google.maps.event.addListener(myLocation, 'dragend', function(evt){
				myLatlng = evt.latLng;
				geocoder.geocode({'location': myLatlng}, function(results, status) {
					if(status === google.maps.GeocoderStatus.OK){
						if(results[1]){
							scope.$parent.location.formatted_address = results[1].formatted_address;
							scope.$parent.location.geometry.location = myLatlng;
							scope.$apply();
							document.getElementById('the-google-dalla-input').value = results[1].formatted_address;
						}
					}
				});
			});
			scope.$watch('location.geometry.location', function() {
				if($rootScope.location){
					scope.$parent.location.geometry.location = $rootScope.location.geometry.location;
				}
				myLocation.setPosition(scope.$parent.location.geometry.location);
				map.setCenter(scope.$parent.location.geometry.location);
			});
		}
    };
})
.directive('smap', function($rootScope) {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){
			var zValue = scope.$eval(attrs.zoom);
			var lat = scope.$eval(attrs.lat);
			var lng = scope.$eval(attrs.lng);
			var geocoder = new google.maps.Geocoder;
			
			var myLatlng = new google.maps.LatLng(lat,lng),
			mapOptions = {
			  zoom: zValue,
			  center: myLatlng
			},
			smap = new google.maps.Map(element[0],mapOptions),
			
			myLocation = new google.maps.Marker({
				position: myLatlng,
				map: smap,
				draggable:true
			});
			
			navigator.geolocation.getCurrentPosition(function(pos) {
				myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				smap.setCenter(myLatlng);
				myLocation.setPosition(myLatlng);
				geocoder.geocode({'location': myLatlng}, function(results, status) {
					if(status === google.maps.GeocoderStatus.OK){
						if(results[1]){
							scope.$parent.location.formatted_address = results[1].formatted_address;
							scope.$parent.location.geometry.location = myLatlng;
							scope.$apply();
							document.getElementById('the-google-dalla-input-sell').value = results[1].formatted_address;
							smap.setCenter(myLatlng);
						}
					}
				});
				google.maps.event.addListener(myLocation, 'dragend', function(evt){
					myLatlng = evt.latLng;
					geocoder.geocode({'location': myLatlng}, function(results, status) {
						if(status === google.maps.GeocoderStatus.OK){
							if(results[1]){
								scope.$parent.location.formatted_address = results[1].formatted_address;
								scope.$parent.location.geometry.location = myLatlng;
								scope.$apply();
								document.getElementById('the-google-dalla-input-sell').value = results[1].formatted_address;
								smap.setCenter(myLatlng);
							}
						}
					});
				});
				scope.$watch('location.geometry.location', function() {
					if($rootScope.location){
						scope.$parent.location.geometry.location = $rootScope.location.geometry.location;
					}
					myLocation.setPosition(scope.$parent.location.geometry.location);
					smap.setCenter(scope.$parent.location.geometry.location);
				});
			});
			
			geocoder.geocode({'location': myLatlng}, function(results, status) {
				if(status === google.maps.GeocoderStatus.OK){
					if(results[1]){
						//alert(JSON.stringify(scope.$parent.location));
						scope.$parent.location.formatted_address = results[1].formatted_address;
						scope.$parent.location.geometry.location = myLatlng;
						scope.$apply();
						document.getElementById('the-google-dalla-input-sell').value = results[1].formatted_address;
					}
				}
			});
			google.maps.event.addListener(myLocation, 'dragend', function(evt){
				myLatlng = evt.latLng;
				geocoder.geocode({'location': myLatlng}, function(results, status) {
					if(status === google.maps.GeocoderStatus.OK){
						if(results[1]){
							scope.$parent.location.formatted_address = results[1].formatted_address;
							scope.$parent.location.geometry.location = myLatlng;
							scope.$apply();
							document.getElementById('the-google-dalla-input-sell').value = results[1].formatted_address;
						}
					}
				});
			});
			scope.$watch('location.geometry.location', function() {
				if($rootScope.location){
					scope.$parent.location.formatted_address =$rootScope.location.formatted_address;
					scope.$parent.location.geometry.location = $rootScope.location.geometry.location;
				}
				myLocation.setPosition(scope.$parent.location.geometry.location);
				smap.setCenter(scope.$parent.location.geometry.location);
			});
		}
    };
})
.directive('umap', function($rootScope) {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){
			var zValue = scope.$eval(attrs.zoom);
			var lat = scope.$eval(attrs.lat);
			var lng = scope.$eval(attrs.lng);
			var geocoder = new google.maps.Geocoder;
			
			var myLatlng = new google.maps.LatLng(lat,lng),
			mapOptions = {
			  zoom: zValue,
			  center: myLatlng
			},
			umap = new google.maps.Map(element[0],mapOptions),
			
			myLocation = new google.maps.Marker({
				position: myLatlng,
				map: umap,
				draggable:false
			});
		}
    };
})
.directive('showHideContainer', function(){
	return {
		scope: {
		},
		controller: function($scope, $element, $attrs) {
			$scope.show = false;

			$scope.toggleType = function($event){
				$event.stopPropagation();
				$event.preventDefault();

				$scope.show = !$scope.show;

				// Emit event
				$scope.$broadcast("toggle-type", $scope.show);
			};
		},
		templateUrl: 'views/common/show-hide-password.html',
		restrict: 'A',
		replace: false,
		transclude: true
	};
})

.directive('autolinker', ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          var eleHtml = element.html();

          if (eleHtml === '') {
            return false;
          }

          var text = Autolinker.link(eleHtml, {
            className: 'autolinker',
            newWindow: false
          });

          element.html(text);

          var autolinks = element[0].getElementsByClassName('autolinker');

          for (var i = 0; i < autolinks.length; i++) {
            angular.element(autolinks[i]).bind('click', function(e) {
              var href = e.target.href;
              console.log('autolinkClick, href: ' + href);

              if (href) {
                //window.open(href, '_system');
                window.open(href, '_blank');
              }

              e.preventDefault();
              return false;
            });
          }
        }, 0);
      }
    }
  }
])

.directive('showHideInput', function(){
	return {
		scope: {
		},
		link: function(scope, element, attrs) {
			// listen to event
			scope.$on("toggle-type", function(event, show){
				var password_input = element[0],
						input_type = password_input.getAttribute('type');

				if(!show)
				{
					password_input.setAttribute('type', 'password');
				}

				if(show)
				{
					password_input.setAttribute('type', 'text');
				}
			});
		},
		require: '^showHideContainer',
		restrict: 'A',
		replace: false,
		transclude: false
	};
})


.directive('biggerText', function($ionicGesture) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$ionicGesture.on('touch', function(event){
				event.stopPropagation();
				event.preventDefault();

				var text_element = document.querySelector(attrs.biggerText),
						root_element = document.querySelector(".menu-content"),
						current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
						current_size = parseFloat(current_size_str),
						new_size = Math.min((current_size+2), 24),
						new_size_str = new_size + 'px';

				root_element.classList.remove("post-size-"+current_size_str);
				root_element.classList.add("post-size-"+new_size_str);
			}, element);
		}
	};
})

.directive('smallerText', function($ionicGesture) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$ionicGesture.on('touch', function(event){
				event.stopPropagation();
				event.preventDefault();

				var text_element = document.querySelector(attrs.smallerText),
				root_element = document.querySelector(".menu-content"),
				current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
				current_size = parseFloat(current_size_str),
				new_size = Math.max((current_size-2), 12),
				new_size_str = new_size + 'px';

				root_element.classList.remove("post-size-"+current_size_str);
				root_element.classList.add("post-size-"+new_size_str);
			}, element);
		}
	};
})

//Use this directive to open external links using inAppBrowser cordova plugin
.directive('dynamicAnchorFix', function($ionicGesture, $timeout, $cordovaInAppBrowser) {
	return {
		scope: {},
		link: function(scope, element, attrs) {
			$timeout(function(){
				var anchors = element.find('a');
				if(anchors.length > 0)
				{
					angular.forEach(anchors, function(a) {

						var anchor = angular.element(a);

						anchor.bind('click', function (event) {
							event.preventDefault();
							event.stopPropagation();

							var href = event.currentTarget.href;
							var	options = {};

							//inAppBrowser see documentation here: http://ngcordova.com/docs/plugins/inAppBrowser/

							$cordovaInAppBrowser.open(href, '_blank', options)
								.then(function(e) {
									// success
								})
								.catch(function(e) {
									// error
								});
						});

					});
				}
			}, 10);
		},
		restrict: 'A',
		replace: false,
		transclude: false
	};
})

.directive('multiBg', function(_){
	return {
		scope: {
			multiBg: '=',
			interval: '=',
			helperClass: '@'
		},
		controller: function($scope, $element, $attrs) {
			$scope.loaded = false;
			var utils = this;

			this.animateBg = function(){
				// Think i have to use apply because this function is not called from this controller ($scope)
				$scope.$apply(function () {
					$scope.loaded = true;
					$element.css({'background-image': 'url(' + $scope.bg_img + ')'});
				});
			};

			this.setBackground = function(bg) {
				$scope.bg_img = bg;
			};

			if(!_.isUndefined($scope.multiBg))
			{
				if(_.isArray($scope.multiBg) && ($scope.multiBg.length > 1) && !_.isUndefined($scope.interval) && _.isNumber($scope.interval))
				{
					// Then we need to loop through the bg images
					utils.setBackground($scope.multiBg[0]);
				}
				else
				{
					// Then just set the multiBg image as background image
					utils.setBackground($scope.multiBg[0]);
				}
			}
		},
		templateUrl: 'views/common/multi-bg.html',
		restrict: 'A',
		replace: true,
		transclude: true
	};
})


.directive('bg', function() {
	return {
		restrict: 'A',
		require: '^multiBg',
		scope: {
			ngSrc: '@'
		},
		link: function(scope, element, attr, multiBgController) {
			element.on('load', function() {
				multiBgController.animateBg();
		  });
		}
	};
})

;

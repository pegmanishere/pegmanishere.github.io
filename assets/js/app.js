var PIH = PIH || {};
PIH.Site = (function(){
	'use strict';
	$(document).on('ready', function(){

		var PegmanIsHere = {
			g: {
				jsonData: {},
				template: null,
				$ticks: $('.ticks a')
			},
			init: function () {
				this.getData();
				this.bindUIActions();
				this.progressbarInit();
			},
			getData: function () {
				var _this = this;

				// $.ajax({
				//     type: 'GET',
				//     url: 'http://jsonstub.com/venues',
				//     beforeSend: function (request) {
				//         request.setRequestHeader('JsonStub-User-Key', '1dd1e13d-55c6-4254-bd9b-9cb968890ca7');
				//         request.setRequestHeader('JsonStub-Project-Key', '7a583d7e-ad3d-430e-ba08-f11407dbf3d7');
				//     }
				// }).done(function (data) {
				//     //do something with data
				//     _this.g.jsonData = data;
				//     var source   = $("#entry-template").html();
				// 	_this.g.template = Handlebars.compile(source);
				// });

				$.ajax({
				    type: 'GET',
				    url: '/assets/json/data.json'
				}).done(function (data) {
				    //do something with data
				    _this.g.jsonData = data;
				    var source   = $("#entry-template").html();
					_this.g.template = Handlebars.compile(source);
				});
			},
			renderTemplate: function (id) {
				var _this = this;
				var data = _this.g.jsonData[id-1];
				$('.feed__content').html(_this.g.template(data));
				_this.isotopeContent();
			},
			isotopeContent: function () {
				//Isotope
				var $container = $('.feed__list');
				// initialize
				$container.isotope({
					itemSelector: '.feed__item',
					layoutMode: 'masonryHorizontal'
				});
				// filter items on button click
				$('.filters').on( 'click', '.filter', function() {
					var filterValue = $(this).attr('data-filter');
					$(this).siblings().removeClass('is-active');
					$(this).addClass('is-active');
					$container.isotope({ filter: filterValue });
				});
			},
			bindUIActions: function () {
				var _this = this;

				//Explore Button
				$('.btn-explore').on('click', function () {

					$('.progress').addClass('is-visible');

					_this.timelineGoTo(1);
				});

				//Enter Button
				$('.btn-enter').on('click', function (e) {
					$(this).parents('.ui-timeline__section').addClass('is-open');
					$('.feed').addClass('is-open');
					$('.feed__place, .filters, .feed__item').addClass('is-visible');
					_this.getMap($(this).parents('.ui-timeline__section').index());
					e.preventDefault();
				});

				$('.btn-enter').on('mouseover', function (e) {
					var currentIndex = $(this).parents('.ui-timeline__section').index();
					_this.renderTemplate(currentIndex);
				});

				//Close Feed
				$('.btn-close-feed').on('click', function () {
					$('.feed, .ui-timeline__section').removeClass('is-open');
					$('.feed__place, .filters').removeClass('is-visible');
					$('.filter').removeClass('is-active');
					$('.icon-todo').addClass('is-active');
				});

				//Continue Button
				$('.btn-continue').on('click', function (e) {
					var destination = $(this).parents('.ui-timeline__section').index() + 1;
					_this.timelineGoTo(destination);
					e.preventDefault();
				});

				//Ticks Button
				$('.ticks').on('click', 'a', function (e) {
					var destination = $(this).index() + 1;
					_this.timelineGoTo(destination);
					e.preventDefault();
				});

				//Toggle Button
				$('.toggle-button').on('click', function (e) {
					_this.switchSectionArea();
					$('.logo.is-fixed').fadeToggle(0);
					e.preventDefault();
				});

				//Click on Pop Up links
				$('.popup').on('click', function(e) {
					var src = $(this).attr('href');
					_this.popUpWindow(src);
					e.preventDefault();
				});

				//Modal
				$('.open-modal').on('click', function (e) {
					var modal = $(this).attr('href');
					$('.md-modal, .md-overlay').addClass('md-show');
					$(modal).addClass('md-show');
					e.preventDefault();
				});

				$('.btn-close, .md-overlay').on('click', function () {
					$('.md-modal, .md-overlay, .md-content').removeClass('md-show');
				});

				//Slider
				$('.slider').glide({
					autoplay: false,
					arrowRightText: 'Siguiente',
					arrowLeftText: 'Anterior'
				});

				//GOOGLE ANALYTICS EVENTS
				$('button, a').on('click', function () {
					var title = $(this).text();

					ga('send', {
						'hitType': 'event',          // Required.
						'eventCategory': 'button',   // Required.
						'eventAction': 'click',      // Required.
						'eventLabel': 'Clic en: ' + title
					});
				});
			},
			switchSectionArea: function () {
				var _this = this;
				$('.toggle-button').toggleClass('is-about');
				$('.section-area').eq(0).toggleClass('is-active');
				$('.section-area').eq(1).toggleClass('is-active');
			},
			popUpWindow: function (url) {
				var
				newwindow,
				featuresArray = [],
				featuresString = '',
				windowFeatures = {
			        toolbar: 'no',
			        location: 'no',
			        directories: 'no',
			        left: ($(window).width() - 600) / 2,
			        top: ($(window).height() - 300) / 2,
			        status: 'no',
			        menubar: 'no',
			        scrollbars: 'yes',
			        resizable: 'no',
			        width: 600,
			        height: 300
			    };

			    for(var k in windowFeatures) {
			        featuresArray.push(k+'='+windowFeatures[k]);
			    }

			    featuresString = featuresArray.join(',');

				newwindow = window.open(url, 'name', featuresString);

				if (window.focus) {
					newwindow.focus();
				}
			},
			progressbarInit: function () {
				var
				_this = this,
				totalSteps = _this.g.$ticks.length + 1,
				stepsDistance = 100 / totalSteps,
				ticksWidth = $('.ticks a').outerWidth()/2;

				$.each(_this.g.$ticks, function() {
					var tickIndex = $(this).index() + 1;
					var tickPosition = tickIndex * stepsDistance;
					$(this).css('left', tickPosition + '%');
				});

			},
			timelineReset: function () {
				var _this = this;
				$('.logo.is-fixed').hide();
				$('.ui-timeline__section').removeClass('is-current').removeClass('is-seen');
				$('.lookahead').css('width', '');
				$('.prct').css('width', '0%');
				$('.playhead').css('left', '0%');
				$('.progress').removeClass('is-visible');
				$('.ui-timeline__section:first-child').addClass('is-current');
				$('.ticks a').removeClass('is-current').removeClass('is-seen');
			},
			timelineShowCurrent: function (currentView) {
				var current = currentView + 1;
				var videoStart = document.querySelector('.video-start');
				var videoOne = document.querySelector('.video-one');
				var videoTwo = document.querySelector('.video-two');
				var videoThree = document.querySelector('.video-three');

				$('.ui-timeline__section:nth-child('+current+')').addClass('is-current');

				switch ( $('.ui-timeline__section.is-current').index() ) {
					case 1:
						videoStart.pause();
						videoOne.play();
						videoTwo.pause();
						videoThree.pause();
					break;

					case 2:
						videoStart.pause();
						videoOne.pause();
						videoTwo.play();
						videoThree.pause();
					break;

					case 3:
						videoStart.pause();
						videoOne.pause();
						videoTwo.pause();
						videoThree.play();
					break;

					default:
						videoStart.play();
						videoOne.pause();
						videoTwo.pause();
						videoThree.pause();
					break;
				}
			},
			timelineGoTo: function (destination) {
				var
				_this = this,
				totalSteps = _this.g.$ticks.length + 1,
				stepsDistance = 100 / totalSteps,
				currentTick = $('.ticks .is-current').index() + 1,
				direction = true,
				speed = 500;

				$('.logo.is-fixed').fadeIn('fast');
				$('.ui-timeline__section.is-current').removeClass('is-current');

				var moveTo = function (i, direction) {
					var percentage = i * stepsDistance;

					if(i !== totalSteps) {
						$('.lookahead').animate({
							width: percentage + stepsDistance +'%'
						}, speed/2, 'easeOut', null);
					}

					$('.prct').animate({
						width: percentage + '%'
					}, speed, 'easeOut', null);

					$('.playhead').animate({
						left: percentage + '%'
					}, speed, 'easeOut', function () {
						if (i === destination){
							$(_this.g.$ticks[i-1]).addClass('is-current');
							speed = 200;
							_this.timelineShowCurrent(destination);

							if(i === totalSteps){
								_this.switchSectionArea();
								_this.timelineReset();
							}
						} else {
							if(direction){
								$(_this.g.$ticks[i-1]).removeClass('is-current').addClass('is-seen');
							} else {
								$(_this.g.$ticks[i-1]).removeClass('is-current').removeClass('is-seen');
							}
						}
					});

					speed = speed + 300;

				}

				if(destination > currentTick){
					for (var i = currentTick; i <= destination; i++) {
						direction = true;
						if(i>0){
							moveTo(i, direction);
						}
					};
				} else {
					for (var i = currentTick; i >= destination; i--) {
						direction = false;
						if(i>0){
							moveTo(i, direction);
						}
					};
				}

			},
			getMap: function (current) {
				var infoWindow = new google.maps.InfoWindow({});
				var map = new GMaps({
					el: '#map',
					zoom: 100,
					zoomControl: true,
					panControl: true,
					disableDoubleClickZoom: false,
					mapTypeControl: false,
					scaleControl: false,
					scrollwheel: false,
					streetViewControl: false,
					draggable : true,
					overviewMapControl: false,
					styles: [{
					    "stylers": [{
					        "visibility": "simplified"
					    }, {
					        "saturation": -100
					    }]
					}, {
					    "featureType": "water",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 17
					    }]
					}, {
					    "featureType": "landscape",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 20
					    }]
					}, {
					    "featureType": "road.highway",
					    "elementType": "geometry.fill",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 17
					    }]
					}, {
					    "featureType": "road.highway",
					    "elementType": "geometry.stroke",
					    "stylers": [{
					        "visibility": "off"
					    }]
					}, {
					    "featureType": "road.highway.controlled_access",
					    "elementType": "geometry.stroke",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 20
					    }]
					}, {
					    "featureType": "road.arterial",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 25
					    }]
					}, {
					    "featureType": "road.local",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 25
					    }]
					}, {
					    "featureType": "poi",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 28
					    }]
					}, {
					    "elementType": "labels.text.stroke",
					    "stylers": [{
					        "visibility": "off"
					    }]
					}, {
					    "elementType": "labels.text.fill",
					    "stylers": [{
					        "saturation": 300
					    }, {
					        "color": "#7b94be"
					    }, {
					        "lightness": 10
					    }]
					}, {
					    "elementType": "labels.icon",
					    "stylers": [{
					        "visibility": "off"
					    }]
					}, {
					    "featureType": "transit",
					    "elementType": "geometry",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 19
					    }]
					}, {
					    "featureType": "administrative",
					    "elementType": "geometry.fill",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 20
					    }]
					}, {
					    "featureType": "administrative",
					    "elementType": "geometry.stroke",
					    "stylers": [{
					        "color": "#000000"
					    }, {
					        "lightness": 17
					    }, {
					        "weight": 1.2
					    }]
					}]
				});

				var currentMap = '';

				if (current === 1) {
					currentMap = 'alameda.kmz';
				} else if (current === 2) {
					currentMap = 'fundidora.kml';
				} else if (current === 3) {
					currentMap = 'santalucia.kml';
				}

				map.loadFromKML({
					url: 'http://pegmanishere.com/assets/kmz/' + currentMap,
					suppressInfoWindows: false,
					events: {
						click: function(point){
							infoWindow.setContent(point.featureData.infoWindowHtml);
							infoWindow.setPosition(point.latLng);
							infoWindow.open(map.map);
						}
					}
				});
			}
		};

		PegmanIsHere.init();

	});

}());

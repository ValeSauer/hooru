// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'starter.controllers'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('start', {
                url: '/start',
                templateUrl: 'templates/start.html',
                controller: 'AuthCtrl'
            })

            .state('auth', {
                url: '/auth',
                templateUrl: 'templates/auth.html',
                controller: 'AuthCtrl'
            })

            .state('write', {
                url: '/write',
                templateUrl: 'templates/write.html',
                controller: 'WriteCtrl'
            })

            .state('calc', {
                url: '/calc',
                templateUrl: 'templates/calc.html',
                controller: 'CalcCtrl'
            })

            .state('result', {
                url: '/result',
                templateUrl: 'templates/result.html',
                controller: 'ResultCtrl'
            })

// if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/start');
    })

    .service('dataService', function() {

        // private variable
        var _lasttime = 0;
        var _trainingdata = [];
        var _keydown = 0;
        var _keyduration = {};
        var _network = {};

        // public API
        this.lasttime = _lasttime;
        this.trainingdata = _trainingdata;
        this.keydown = _keydown;
        this.keyduration = _keyduration;
        this.network = _network;
    })
;
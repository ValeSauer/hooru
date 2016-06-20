angular.module('hooru.auth', [])

    .controller('AuthCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        $scope.doIdentify = function () {
            $state.go('identify');
        }

        $scope.doGoToAuth = function () {
            $state.go('auth');
        }

        $scope.doAuth = function (user) {
            if (typeof user === "undefined") {
                $ionicPopup.alert({
                    title: 'Angabe unvollständig',
                    template: 'Bitte gib alle erforderlichen Daten an.'
                });
            } else {
                if (user.username && user.device) {
                    $scope.username = user.username;
                    $scope.device = user.device;
                    window.localStorage.setItem("username", user.username);
                    window.localStorage.setItem("device", user.device);
                    $state.go('write');
                } else {
                    $ionicPopup.alert({
                        title: 'Angabe unvollständig',
                        template: 'Bitte gib alle erforderlichen Daten an.'
                    });
                }
            }
        }

    })



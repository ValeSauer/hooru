angular.module('hooru.result', [])

    .controller('ResultCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        var output = hooru.getOutput();

        var results = [];
        for (key in output) {
            //results.push(Math.round(output[key] * 100000).toFixed(6) / 100000 + ": " + key);
            results.push(key);
        }

        results.sort();

        console.log("The result is:");
        console.log(results);

        $scope.results = results;
    })


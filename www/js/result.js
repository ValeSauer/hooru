angular.module('hooru.result', [])

    .controller('ResultCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        var net = new brain.NeuralNetwork();
        net.fromJSON(hooru.network);

        var alldata = hooru.prepare();

        var output = net.run(alldata[alldata.length - 1]["input"]);

        var results = [];
        for (key in output) {
            results.push(Math.round(output[key] * 100000).toFixed(6) / 100000 + ": " + key);
        }

        results.sort();

        console.log("The result is:");
        console.log(results);

        $scope.results = results;
    })


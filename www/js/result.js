angular.module('hooru.result', [])

    .controller('ResultCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        var output = hooru.getOutput();

        $scope.results = [];

        var sortresults = [];
        var sortrank = []

        for (key in output) {
            sortresults[output[key]] = key;
            sortrank.push(output[key]);
        }

        sortrank.sort(sortNumber);

        for(var i = 0; i < sortrank.length; i++){
            var listitem = Math.round(sortrank[i] * 100000).toFixed(6) / 100000 + " | " + sortresults[sortrank[i]];
            $scope.results.push(listitem);
        }

        function sortNumber(a,b) {
            return b - a;
        }

    })


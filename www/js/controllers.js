angular.module('starter.controllers', [])

    .controller('AuthCtrl', function($scope, $state){

        $scope.doAuthYes = function(){
            $state.go('auth_known');
        }

        $scope.doAuthNo = function(){
            $state.go('auth_new');
        }
        
        $scope.doAuth = function(user){
            $scope.user = user.name;
            $state.go('write');
        }
    })

    .controller('WriteCtrl', function($scope, $state, dataService){

        // var brain = require('brain');
        // var net = new brain.NeuralNetwork();

        var mytext = "Hallo, das ist ein wunderbarer Text, den ich hier nur so schreibe, damit irgendetwas dran steht.";
        $scope.read = mytext;
        $scope.write = "";

        $scope.doWrite = function(write){
            
            var cut = write.length - 10;
            if (cut < 0){
                cut = 0;
            }
            $scope.read = mytext.substr(cut);

            var d = new Date();
            var now = d.getTime();
            if(write.length > 1){
                var span = now - dataService.lasttime;
                last = write.substr(write.length - 2, 1);
                current = write.substr(write.length - 1, 1);
                dataset = [last, current, span];
                console.debug(dataset);
                dataService.trainingdata.push(dataset);
                dataService.keyduration.current = now - dataService.keydown;
                console.debug(current + ": " + dataService.keyduration.current);
            }
            dataService.lasttime = d.getTime();
        }

        $scope.doKeyDown = function(){
            var d = new Date();
            var now = d.getTime();
            dataService.keydown = now;
        }
    })

    .controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [
            {title: 'Reggae', id: 1},
            {title: 'Chill', id: 2},
            {title: 'Dubstep', id: 3},
            {title: 'Indie', id: 4},
            {title: 'Rap', id: 5},
            {title: 'Cowbell', id: 6}
        ];
    })

    .controller('PlaylistCtrl', function ($scope, $stateParams) {
    });

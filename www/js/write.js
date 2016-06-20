angular.module('hooru.write', [])

    .controller('WriteCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        if (!hooru.isAuthenticated()) {
            $state.go('auth');
            return;
        }

        $ionicPopup.alert({
            title: "Anleitung",
            template: 'Hooru wird nun dein Profil aufzeichnen. Bitte tippe dafür die folgenden Texte möglichst genau ab.'
        });


        $scope.step = 0;
        $scope.write = "";
        function preparestep(step){
            // Prepare for next step
            $scope.step = step;
            $scope.title = "Lerne " + (step + 1) + "/3";
            $scope.error = 0;
            $scope.read = hooru.texts[step];
            $scope.incomplete = true;
        }

        preparestep(0);
        
        /*
         When a key is released track all the data
         */
        $scope.doKeyUp = function (write) {
            var part1 = hooru.texts[$scope.step].substr(0, write.length);
            var part2 = hooru.texts[$scope.step].substr(write.length)
            key = write.substr(write.length - 1, 1).toLowerCase();
            hooru.keyUp(key);
            $scope.read = "<span class='textmarker_" + hooru.getError(part1, write) + "'>" + part1 + "</span>" + part2;

            if (write.length == hooru.texts[$scope.step].length && hooru.getError(hooru.texts[$scope.step], write) <= 1) {
                    hooru.upload();
                    if($scope.step == 0){
                        preparestep(1);
                        this.write = "";
                    }else if($scope.step == 1) {
                        preparestep(2);
                        this.write = "";
                    }else if($scope.step == 2){
                        $state.go('calc');
                        this.write = "";
                    }
            }
        }

        /*
         Just track the time of the keydown event
         */
        $scope.doKeyDown = function () {
            hooru.keyDown();
        }


        $scope.doCalc = function () {
            $state.go('calc');
        }

        $scope.doReset = function () {
            this.write = "";
            hooru.resetProfiledata();
        }


    })
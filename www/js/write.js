angular.module('hooru.write', [])

    .controller('WriteCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        if (!hooru.isAuthenticated() && $state.params.mode == 'write') {
            $state.go('auth');
            return;
        }

        if($state.current.name != 'write'){
            $ionicPopup.alert({
                title: "Anleitung",
                template: 'Hooru wird nun versuchen, dich zu identifizieren. Bitte tippe dafür den folgenden Text möglichst genau ab.'
            });
        }else{
            $ionicPopup.alert({
                title: "Anleitung",
                template: 'Hooru wird nun dein Profil aufzeichnen. Dazu wirst du gebeten, <b>drei mal</b> denselben Satz abzuschreiben.'
            });
        }


        function preparestep(step){
            // Prepare for next step
            $scope.step = step;
            hooru.lastkey = 0;
            hooru.lastlength = 0;

            if(step == 'identify'){
                $scope.title = "Erkennen";
                $scope.error = 0;
                $scope.read = hooru.texts[0];
                $scope.step = 0;
            }else{
                $scope.title = "Lerne " + (step + 1) + "/3";
                $scope.error = 0;
                $scope.read = hooru.texts[step];
            }
            $scope.incomplete = true;
        }


        hooru.resetProfiledata();
        this.write = "";

        if($state.current.name == 'write'){
            preparestep(0);
        }else{
            preparestep('identify');
        }
        
        /*
         When a key is released track all the data
         */
        $scope.doKeyUp = function (write) {

            var key = write.substr(write.length - 1, 1).toLowerCase();

            var part1 = hooru.texts[$scope.step].substr(0, write.length);
            var part2 = hooru.texts[$scope.step].substr(write.length)

            var lverror = hooru.getError(part1, write);

            if(lverror == 0 && write.length > hooru.lastlength){
                hooru.keyUp(key);
            }
            hooru.lastlength = write.length;

            $scope.read = "<span class='textmarker_" + lverror + "'>" + part1 + "</span>" + part2;

            if (write.length == hooru.texts[$scope.step].length && hooru.getError(hooru.texts[$scope.step], write) <= 1) {
                if($state.params.mode == 'write'){
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
                }else{

                    var trainingpopup = $ionicPopup.alert({
                        title: "Arbeite.",
                        template: '<p>Hooru versucht dich nun anhand des trainierten neuronalen Netzes zu identifizieren...</p><div class="center"><ion-spinner icon="spiral"></ion-spinner></div>',
                        buttons: []
                    });

                    var req = {
                        method: 'GET',
                        url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=getnet&token=' + hooru.token,
                        headers: {
                            'Content-Type': undefined
                        }
                    }

                    $http(req).then(function (response) {
                        // success
                        if (response.data) {
                            var net = new brain.NeuralNetwork();
                            net.fromJSON(JSON.parse(response.data));
                            var mydata = hooru.getNormalizedProfileData();
                            var output = false;
                            var output = net.run(mydata);
                            hooru.setOutput(output);
                            trainingpopup.close();
                            $state.go('result');
                        }
                    }, function () {
                        console.log("Download error");
                    });
                }
            }
        }


        $scope.doCalc = function () {
            $state.go('calc');
        }

        $scope.doReset = function () {
            hooru.resetProfiledata();
            this.write = "";
            if($state.current.name == 'identify'){
                preparestep('identify');
            }else{
                preparestep(0);
            }
        }


    })
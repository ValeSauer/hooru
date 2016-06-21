angular.module('hooru.write', [])

    .controller('WriteCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        if (!hooru.isAuthenticated() && $state.params.mode == 'write') {
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
            hooru.lastkey = 0;

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

        if($state.params.mode == 'write'){
            preparestep(0);
        }else{
            preparestep('identify');
        }
        
        /*
         When a key is released track all the data
         */
        $scope.doKeyUp = function (e, write) {

            var key = e.charCode || e.keyCode || 0;
            console.log(key);

            var part1 = hooru.texts[$scope.step].substr(0, write.length);
            var part2 = hooru.texts[$scope.step].substr(write.length)
            key = write.substr(write.length - 1, 1).toLowerCase();
            hooru.keyUp(key);
            $scope.read = "<span class='textmarker_" + hooru.getError(part1, write) + "'>" + part1 + "</span>" + part2;

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

                    hooru.setOutput();

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
                            console.log("Trained Network downloaded");
                            var net = new brain.NeuralNetwork();
                            net.fromJSON(JSON.parse(response.data));
                            var mydata = hooru.getNormalizedProfileData();
                            var output = net.run(mydata);
                            console.log(output);
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
angular.module('hooru.write', [])

    .controller('WriteCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        if (!hooru.isAuthenticated() && $state.params.mode == 'write') {
            $state.go('auth');
            return;
        }

        if ($state.current.name != 'write') {
            $ionicPopup.alert({
                title: "Anleitung",
                template: 'Hooru wird nun versuchen, dich zu identifizieren. Bitte tippe dafür den folgenden Text möglichst genau ab. Nutze dabei weder Swipen noch andere alternative Eingabemethoden.'
            });
        } else {
            $ionicPopup.alert({
                title: "Anleitung",
                template: 'Hooru wird nun dein Profil aufzeichnen. Dazu wirst du gebeten, <b>drei mal</b> denselben Satz abzutippen. Nutze dabei weder Swipen noch andere alternative Eingabemethoden.'
            });
        }

        $scope.write = {};
        $scope.write.text = "Test";
        $scope.step = 0;

        $scope.preparestep = function(step){

            // Prepare for next step
            hooru.resetProfiledata();
            $scope.step = step;
            hooru.lastkey = 0;
            hooru.lastlength = 0;

            if (step == 'identify') {
                $scope.title = "Erkennen";
                $scope.error = 0;
                $scope.read = hooru.texts[0];
                $scope.step = 0;
            } else {
                $scope.title = "Lerne " + (step + 1) + "/3";
                $scope.error = 0;
                $scope.read = hooru.texts[step];
            }
            $scope.incomplete = true;
            $scope.write.text = "";
        }

        if ($state.current.name == 'write') {
            $scope.preparestep(0);
        } else {
            $scope.preparestep('identify');
        }

        /*
         When a key is released track all the data
         */
        $scope.doKeyUp = function (write) {

            var key = write.substr(write.length - 1, 1).toLowerCase();

            var part1 = hooru.texts[$scope.step].substr(0, write.length);
            var part2 = hooru.texts[$scope.step].substr(write.length)

            var lverror = hooru.getError(part1, write);

            if (lverror == 0 && write.length > hooru.lastlength) {
                hooru.keyUp(key);
            }
            hooru.lastlength = write.length;

            $scope.read = "<span class='textmarker_" + lverror + "'>" + part1 + "</span>" + part2;

            if (write.length == hooru.texts[$scope.step].length && hooru.getError(hooru.texts[$scope.step], write) == 0) {
                if ($state.params.mode == 'write') {
                    hooru.upload();
                    if ($scope.step == 0) {
                        $scope.preparestep(1);
                    } else if ($scope.step == 1) {
                        $scope.preparestep(2);
                    } else if ($scope.step == 2) {
                        $state.go('calc');
                        hooru.resetProfiledata();
                        $scope.write.text = "";
                    }
                } else {
                    $scope.write.text = "";
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
                            $scope.preparestep('identify');
                            $state.go('result');
                        }
                    }, function () {
                        console.log("Download error");
                    });
                }

            } else if (write.length == hooru.texts[$scope.step].length && hooru.getError(hooru.texts[$scope.step], write) > 0) {
                $ionicPopup.alert({
                    title: "Fehlerhafte Eingabe",
                    template: 'Du hast bei der Eingabe zu viele Rechtschreibfehler gemacht. Bitte wiederhole die Eingabe.',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-positive',
                            onTap: function () {
                                $scope.preparestep($scope.step);
                            }
                        }
                    ]
                });
            }

        }


        $scope.doCalc = function () {
            $state.go('calc');
        }

        $scope.doReset = function () {
            if ($state.current.name == 'identify') {
                $scope.preparestep('identify');
            } else {
                $scope.preparestep(0);
            }
        }


    })
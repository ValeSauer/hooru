angular.module('hooru.calc', [])

    .controller('CalcCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        $scope.doCalc = function () {

            var d = new Date();
            var starttime = d.getTime();

            var trainingpopup = $ionicPopup.alert({
                title: "Training...",
                template: '<p>Hooru trainiert das neuronale Netzwerk...</p><div class="center"><ion-spinner icon="spiral"></ion-spinner></div>',
                buttons: []
            });

            var req = {
                method: 'GET',
                url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=get&token=' + hooru.token,
                headers: {
                    'Content-Type': undefined
                },
            }

            $http(req).then(function (response) {
                // success
                var trainingdata = response.data;
                if (trainingdata && trainingdata.length > 0) {
                    hooru.setTrainingdata(trainingdata);
                    var prepsets = [];
                    for (var i = 0; i < trainingdata.length; i++) {
                        outputname = trainingdata[i].username + "_" + trainingdata[i].device;
                        var prepset = {
                            input: JSON.parse(trainingdata[i].dataset),
                            output: {[outputname]: 1}
                        }
                        prepsets.push(prepset)
                    }

                    var net = new brain.NeuralNetwork();
                    var result = net.train(prepsets);
                    if(result.error < 0.005){
                        hooru.setNetwork(net.toJSON());
                    }
                    trainingpopup.close();

                    var d = new Date();
                    var now = d.getTime();
                    var difftime = (now - starttime) / 1000;

                    if(result.error < 0.005) {
                        var resulttitle = "Training beendet.";
                        var resultmessage = '<p>Das neuronale Netzwerk wurde in ' + difftime + ' Sekunden trainiert und kann dich jetzt erkennen.</p><p>Fehler: ' + result.error + '<br>Iterationen: ' + result.iterations;
                    }else{
                        var resulttitle = "Training fehlgeschlagen.";
                        var resultmessage = '<p>Das neuronale Netzwerk konnte anhand der Trainingdaten nicht erfolgreich trainiert werden.</p><p>Fehler: ' + result.error + '<br>Iterationen: ' + result.iterations;
                    }

                    var resultpopop = $ionicPopup.alert({
                        title: resulttitle,
                        template: resultmessage,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    $state.go('start');
                                    return true;
                                }
                            }
                        ]
                    });
                    return prepsets;
                }
            }, function () {
                // error
            });
        }

        $scope.doStart = function () {
            $state.go('start');
        }

    })

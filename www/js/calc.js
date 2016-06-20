angular.module('hooru.calc', [])

    .controller('CalcCtrl', function ($scope, $state, $http, $ionicPopup, hooru) {

        if(hooru.getTrainingdata().length < 1){
            hooru.download();
            console.log("downloading");
        }

        $scope.doCalc = function () {

            var d = new Date();
            var starttime = d.getTime();

            var trainingpopup = $ionicPopup.alert({
                title: "Training...",
                template: '<p>Hooru trainiert das neuronale Netzwerk...</p><div class="center"><ion-spinner icon="spiral"></ion-spinner></div>',
                buttons: []
            });

            var alldata = hooru.prepare();

            var net = new brain.NeuralNetwork();
            net.train(alldata);
            hooru.network = net.toJSON();
            console.log(hooru.network);

            var output = net.run(alldata[alldata.length - 1]["input"]);
            console.log(output);

            trainingpopup.close();

            var d = new Date();
            var now = d.getTime();
            var difftime = (now - starttime) / 100;

            var resultpopop = $ionicPopup.alert({
                title: "Training beendet.",
                template: '<p>Das neuronale Netzwerk wurde in ' + difftime + ' Sekunden trainiert und kann dich jetzt erkennen.',
                buttons: [
                    {
                        text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            $state.go('result');
                            return true;
                        }
                    }
                ]
            });

        }

    })

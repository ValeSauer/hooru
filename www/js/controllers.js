angular.module('starter.controllers', [])

    .controller('AuthCtrl', function ($scope, $state, $http, dataService, $ionicPopup, Hooru) {

        var req = {
            method: 'GET',
            url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=get'
        }

        $http(req).then(function (response) {
            // success
            dataService.trainingdata = response.data;
            $scope.datacount = dataService.trainingdata.length;
        }, function () {
            // error
        });

        $scope.doIdentify = function () {
            $state.go('identify');
        }

        $scope.doGoToAuth = function () {
            $state.go('auth');
        }

        $scope.doAuth = function (user) {
            if (typeof user === "undefined") {
                $ionicPopup.alert({
                    title: 'Angabe unvollständig',
                    template: 'Bitte gib alle erforderlichen Daten an.'
                });
            } else {
                if (user.username && user.device) {
                    $scope.username = user.username;
                    $scope.device = user.device;
                    window.localStorage.setItem("username", user.username);
                    window.localStorage.setItem("device", user.device);
                    $state.go('write');
                } else {
                    $ionicPopup.alert({
                        title: 'Angabe unvollständig',
                        template: 'Bitte gib alle erforderlichen Daten an.'
                    });
                }
            }
        }

    })

    .controller('WriteCtrl', function ($scope, $state, $http, dataService, $ionicPopup) {

        // $ionicPopup.alert({
        //     title: "Anleitung",
        //     template: 'Hooru wird nun dein Profil aufzeichnen. Bitte tippe dafür den folgenden Text möglichst genau ab.'
        // });

        if (window.localStorage.getItem("username") && window.localStorage.getItem("device")) {
            // Everything okay
        } else {
            $state.go('auth');
        }

        var mytext = "Falsches Üben von Xylophonmusik quält jeden größeren Zwerg, auch den Größten. Franz jagt im komplett verwahrlosten, heruntergekommenen Taxi quer durch Bayern. Zwölf große Boxkämpfer jagen Viktor quer über den Sylter Deich.";
        $scope.read = mytext;
        $scope.write = "";
        $scope.incomplete = true;

        $scope.doCalc = function () {

            var mydata = {
                username: window.localStorage.getItem("username"),
                device: window.localStorage.getItem("device"),
                dataset: JSON.stringify(hooruNormalize(dataService.keyduration))
            };

            var req = {
                method: 'POST',
                url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=add',
                data: mydata
            }

            $http(req).then(function (response) {
                // success
                if (response.data.length > 0) {
                    dataService.trainingdata = response.data;
                    $state.go('calc');
                }
            }, function () {
                // error
            });
        }

        $scope.doReset = function () {
            $scope.write = "Falsches Üben von Xylophonmusik quält jeden größeren Zwerg, auch den Größten. Franz jagt im komplett verwahrlosten, heruntergekommenen Taxi quer durch Bayern. Zwölf große Boxkämpfer jagen Viktor quer über den Sylter Deich.";
            $scope.stat_count = 0;
            $scope.stat_avg = "";
            $scope.stat_dist = 0;
            $scope.incomplete = true;
            dataService.keyduration = [];
        }


        $scope.doKeyUp = function (write) {

            var part1 = mytext.substr(0, write.length);
            var part2 = mytext.substr(write.length)

            $scope.read = "<span class='textmarker'>" + part1 + "</span>" + part2;

            var d = new Date();
            var now = d.getTime();
            if (write.length >= 1) {
                // var span = now - dataService.lasttime;
                // last = write.substr(write.length - 2, 1);
                current = write.substr(write.length - 1, 1).toLowerCase();
                // dataset = [last, current, span];
                // console.debug(dataset);
                // dataService.trainingdata.push(dataset);
                if (dataService.keyduration[current] == null || dataService.keyduration[current] == undefined) {
                    dataService.keyduration[current] = [];
                }
                dataService.keyduration[current].push(now - dataService.keydown);

                // get Levenshtein-Distance
                var distArray = levenshteinenator(part1, write);
                var dist = distArray[distArray.length - 1][distArray[distArray.length - 1].length - 1];

                if (part1.length == mytext.length && dist < 5 && dist != "-") {
                    $scope.incomplete = false;
                } else {
                    $scope.incomplete = true;
                }

                if (dist < 1) dist = "-";
                $scope.stat_count = getCount(dataService.keyduration);
                $scope.stat_avg = Math.round(getAveragetime(dataService.keyduration)) + " ms";
                $scope.stat_dist = dist;

            }
            // dataService.lasttime = d.getTime();
        }

        $scope.doKeyDown = function () {
            var d = new Date();
            var now = d.getTime();
            dataService.keydown = now;
        }
    })

    .controller('CalcCtrl', function ($scope, $state, $http, dataService, $ionicPopup) {

        if (dataService.trainingdata.length == 0) {
            var req = {
                method: 'GET',
                url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=get'
            }

            $http(req).then(function (response) {
                // success
                dataService.trainingdata = response.data;
                $scope.datacount = dataService.trainingdata.length;
            }, function () {
                // error
            });
        } else {
            $scope.datacount = dataService.trainingdata.length;
        }

        $scope.doCalc = function () {

            var d = new Date();
            var starttime = d.getTime();

            var trainingpopup = $ionicPopup.alert({
                title: "Training...",
                template: '<p>Hooru trainiert das neuronale Netzwerk...</p><div class="center"><ion-spinner icon="spiral"></ion-spinner></div>',
                buttons: []
            });

            var alldata = hooruPrepare(dataService.trainingdata);

            var net = new brain.NeuralNetwork();
            net.train(alldata);
            dataService.network = net.toJSON();
            console.log(dataService.network);

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

    .controller('ResultCtrl', function ($scope, $state, $http, dataService, $ionicPopup) {

        var net = new brain.NeuralNetwork();
        console.log(dataService.network);
        net.fromJSON(dataService.network);

        var alldata = hooruPrepare(dataService.trainingdata);

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


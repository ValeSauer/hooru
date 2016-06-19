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

        $scope.doCalc = function(){

            console.log(hooruNormalize(dataService.keyduration));

            var net = new brain.NeuralNetwork();

            net.train([{input: [0, 0], output: [0]},
                {input: [0, 1], output: [1]},
                {input: [1, 0], output: [1]},
                {input: [1, 1], output: [0]}]);

            var output = net.run([1, 0]);  // [0.987]
            console.log("NN-Output: " + output);
        }

        var mytext = "Falsches Üben von Xylophonmusik quält jeden größeren Zwerg, auch den Größten. Franz jagt im komplett verwahrlosten, heruntergekommenen Taxi quer durch Bayern. Zwölf große Boxkämpfer jagen Viktor quer über den Sylter Deich.";
        $scope.read = mytext;
        $scope.write = "";

        $scope.doWrite = function(write){

            var part1 = mytext.substr(0, write.length);
            var part2 = mytext.substr(write.length)

            $scope.read = "<span class='textmarker'>" + part1 + "</span>" + part2;

            var d = new Date();
            var now = d.getTime();
            if(write.length >= 1){
                // var span = now - dataService.lasttime;
                // last = write.substr(write.length - 2, 1);
                current = write.substr(write.length - 1, 1).toLowerCase();
                // dataset = [last, current, span];
                // console.debug(dataset);
                // dataService.trainingdata.push(dataset);
                if(dataService.keyduration[current] == null || dataService.keyduration[current] == undefined){
                    dataService.keyduration[current] = [];
                }
                dataService.keyduration[current].push(now - dataService.keydown);

                // get Levenshtein-Distance
                var distArray = levenshteinenator(part1, write);
                var dist = distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];
                if(dist < 1) dist = "-";

                $scope.stat_count = getCount(dataService.keyduration);
                $scope.stat_avg = Math.round(getAveragetime(dataService.keyduration)) + " ms";
                $scope.stat_dist = dist;

            }
            // dataService.lasttime = d.getTime();
        }

        $scope.doKeyDown = function(){
            var d = new Date();
            var now = d.getTime();
            dataService.keydown = now;
        }
    })


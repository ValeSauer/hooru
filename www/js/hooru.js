// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in result.js


angular.module('hooru.hooru', [])

    .service('hooru', function ($http) {

        // private variable
        var _token = hooru_config.token;            // Das Token für die API-Calls
        var _lastkey = 0;                           // Zeitpunkt des letzten Keydown
        var _lastlength = 0;                        // Die Länge des Write-Strings nach dem letzten Write
        var _profiledata = [];                      // Die eigenen Lerndaten
        var _trainingdata = [];                     // Der gesamte Datensatz -> kommt aus der API
        var _output = {}                            // Der Output des net-Results

        // public API
        this.token = _token;
        this.lastkey = _lastkey;
        this.lastlength = _lastlength;
        this.profiledata = _profiledata;
        this.trainingdata = _trainingdata;
        this.output = _output;

        var self = this;

        this.texts = [
            "Das 1 ist 2 nur 3 ein 4 kleiner 5 Test.",
            "Das 1 ist 2 nur 3 ein 4 kleiner 5 Test.",
            "Das 1 ist 2 nur 3 ein 4 kleiner 5 Test."
            // "Ganze zwölf große Boxkämpfer jagen Viktor quer über den Sylter Deich, d0ch er kann s1ch r3tten.",
            // "Fast jeder wackere Bayer vertilgt sich bequem zwei Pfund Kalbshaxen, d0ch auch er kann n1cht an Knöd3ln sparen.",
            // "Auch Stanleys Expeditionszug quer durchs schöne Afrika w1rd von jedermann bewundert, d0ch n1cht von sich s3lbst."
        ];

        this.setTrainingdata = function (trainingdata) {
            window.localStorage.setItem("trainingdata", JSON.stringify(trainingdata));
        }

        this.getTrainingdata = function () {
            return JSON.parse(window.localStorage.getItem("trainingdata"));
        }

        this.setOutput = function (output) {
            this.output = output;
        }

        this.getOutput = function () {
            return this.output;
        }

        this.setNetwork = function (network) {
            var jsonnet = JSON.stringify(network);
            var mydata = {
                username: window.localStorage.getItem("username"),
                device: window.localStorage.getItem("device"),
                dataset: jsonnet
            };

            var req = {
                method: 'POST',
                url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=setnet&token=' + this.token,
                headers: {
                    'Content-Type': undefined
                },
                data: mydata
            }

            $http(req).then(function (response) {
                // success
                if (response.data) {
                    console.log("Trained Network uploaded");
                }
            }, function () {
                console.log("Upload error");
            });
        }

        this.isAuthenticated = function () {
            if (window.localStorage.getItem("username") && window.localStorage.getItem("device")) {
                return true;
            } else {
                return false;
            }
        }

        this.keyUp = function (key) {
            var d = new Date();
            var now = d.getTime();
            if (this.profiledata[key]) {
                var data = this.profiledata[key];
                if(this.lastkey > 0){
                    data.latency += (now - this.lastkey);
                }
                data.count += 1;
                this.profiledata[key] = data;
                this.lastkey = now;
            }
        }

        this.getError = function (a, b) {
            var distArray = levenshteinenator(a, b);
            var dist = distArray[distArray.length - 1][distArray[distArray.length - 1].length - 1];
            if (dist > 1) {
                dist = 1;
            }
            return dist;
        }

        function hd() {
            this.latency = 0;
            this.count = 0;
        }

/*        function HooruData() {
            this["0"] = new hd();
            this["1"] = new hd();
            this["3"] = new hd();
            this["a"] = new hd();
            this["b"] = new hd();
            this["c"] = new hd();
            this["d"] = new hd();
            this["e"] = new hd();
            this["f"] = new hd();
            this["g"] = new hd();
            this["h"] = new hd();
            this["i"] = new hd();
            this["j"] = new hd();
            this["k"] = new hd();
            this["l"] = new hd();
            this["m"] = new hd();
            this["n"] = new hd();
            this["o"] = new hd();
            this["p"] = new hd();
            this["q"] = new hd();
            this["r"] = new hd();
            this["s"] = new hd();
            this["t"] = new hd();
            this["u"] = new hd();
            this["v"] = new hd();
            this["w"] = new hd();
            this["x"] = new hd();
            this["y"] = new hd();
            this["z"] = new hd();
            this["dot"] = new hd();
            this["comma"] = new hd();
            this["space"] = new hd();
        }*/

        function HooruData() {
            this["0"] = new hd();
            this["1"] = new hd();
            this["2"] = new hd();
            this["3"] = new hd();
            this["4"] = new hd();
            this["5"] = new hd();
            this["a"] = new hd();
            this["d"] = new hd();
            this["e"] = new hd();
            this["i"] = new hd();
            this["k"] = new hd();
            this["l"] = new hd();
            this["n"] = new hd();
            this["r"] = new hd();
            this["s"] = new hd();
            this["t"] = new hd();
            this["u"] = new hd();
            this[" "] = new hd();
            this["."] = new hd();
        }

        this.profiledata = new HooruData();


        this.upload = function () {
            var mydata = {
                username: window.localStorage.getItem("username"),
                device: window.localStorage.getItem("device"),
                dataset: JSON.stringify(this.getNormalizedProfileData())
            };
            var req = {
                method: 'POST',
                url: 'http://hooru.sauer-medientechnik.de/server/index.php?method=add&token=' + this.token,
                headers: {
                    'Content-Type': undefined
                },
                data: mydata
            }

            $http(req).then(function (response) {
                // success
                if (response.data) {
                    self.setTrainingdata(response.data);
                    self.profiledata = new HooruData();
                }
            }, function () {
                console.log("Upload error");
            });
        }

        this.resetProfiledata = function () {
            this.profiledata = null;
            this.profiledata = new HooruData();
        }

        this.getNormalizedProfileData = function () {

            var lat_avg = 0;
            var count = 0;

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    lat_avg += this.profiledata[key].latency;
                    count += 1;
                }
            }

            lat_avg = lat_avg / count;

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    this.profiledata[key].latency = this.profiledata[key].latency / this.profiledata[key].count;

                    if(this.profiledata[key].latency > lat_avg * 2){
                        this.profiledata[key].latency = 1;
                    }else{
                        this.profiledata[key].latency = 1 / (lat_avg * 2) * this.profiledata[key].latency;
                    }
                }
            }

            var normset = {};

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    normset[key] = Math.round(this.profiledata[key].latency * 1000) / 1000;
                }
            }

            return normset;
        }

    })
;

var levenshteinenator = (function () {

    /**
     * @param String a
     * @param String b
     * @return Array
     */
    function levenshteinenator(a, b) {
        var cost;
        var m = a.length;
        var n = b.length;

        // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
        if (m < n) {
            var c = a;
            a = b;
            b = c;
            var o = m;
            m = n;
            n = o;
        }

        var r = [];
        r[0] = [];
        for (var c = 0; c < n + 1; ++c) {
            r[0][c] = c;
        }

        for (var i = 1; i < m + 1; ++i) {
            r[i] = [];
            r[i][0] = i;
            for (var j = 1; j < n + 1; ++j) {
                cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                r[i][j] = minimator(r[i - 1][j] + 1, r[i][j - 1] + 1, r[i - 1][j - 1] + cost);
            }
        }

        return r;
    }

    /**
     * Return the smallest of the three numbers passed in
     * @param Number x
     * @param Number y
     * @param Number z
     * @return Number
     */
    function minimator(x, y, z) {
        if (x <= y && x <= z) return x;
        if (y <= x && y <= z) return y;
        return z;
    }

    return levenshteinenator;

}());
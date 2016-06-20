// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


angular.module('starter.hooru', [])

    .service('Hooru', function () {

        var HooruData = {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            f: 0,
            g: 0,
            h: 0,
            i: 0,
            j: 0,
            k: 0,
            l: 0,
            m: 0,
            n: 0,
            o: 0,
            p: 0,
            q: 0,
            r: 0,
            s: 0,
            t: 0,
            u: 0,
            v: 0,
            w: 0,
            x: 0,
            y: 0,
            z: 0,
            dot: 0,
            comma: 0,
            space: 0
        }

        // private variable
        var _lasttime = 0;
        var _trainingdata = [];
        var _keydown = 0;
        var _keyduration = {};
        var _network = {};

        // public API
        this.lasttime = _lasttime;
        this.trainingdata = _trainingdata;
        this.keydown = _keydown;
        this.keyduration = _keyduration;
        this.network = _network;

        this.hooruNormalize = function (dataset) {
            var normset = HooruData;
            for (key in normset) {
                if (dataset[key]) {
                    normset[key] = getCharAveragetime(dataset[key]);
                } else {
                    if (key == "space") {
                        normset[key] = getCharAveragetime(dataset[" "]);
                    } else if (key == "comma") {
                        normset[key] = getCharAveragetime(dataset[","]);
                    } else if (key == "dot") {
                        normset[key] = getCharAveragetime(dataset["."]);
                    }
                }
            }
            return normset;
        }

        this.hooruPrepare = function (datasets) {
            var prepsets = [];
            if (datasets && datasets.length > 0) {
                for (var i = 0; i < datasets.length; i++) {
                    outputname = datasets[i].username + "_" + datasets[i].device;
                    var prepset = {
                        input: JSON.parse(datasets[i].dataset),
                        output: { [outputname] : 1}
                    }
                    prepsets.push(prepset)
                }
                return prepsets;
            }
        }


        this.getCount = function (dataset) {
            var size = 0, key;
            for (key in dataset) {
                if (dataset.hasOwnProperty(key)) size++;
            }
            return size;
        };

        this.getAveragetime = function (dataset) {
            var count = getCount(dataset);
            var sum = 0;

            if (dataset && count > 0) {
                for (key in dataset) {
                    if (dataset.hasOwnProperty(key)) {
                        sum += getCharAveragetime(dataset[key]);
                    }
                }
                return sum / count;
            } else {
                return 0;
            }

        }

        this.getCharAveragetime = function (dataset) {
            var count = getCount(dataset);
            if (dataset && count > 0) {
                var sum = 0;
                for (var i = 0; i < count; i++) {
                    sum += dataset[i];
                }
                return sum / count / 100;
            } else {
                return 0;
            }
        }

    });


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
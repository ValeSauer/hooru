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
        var _keydown = 0;                           // Zeitpunkt des aktuellen Keydown
        var _profiledata = [];                      // Die eigenen Lerndaten
        var _trainingdata = [];                     // Der gesamte Datensatz -> kommt aus der API

        // public API
        this.token = _token;
        this.lastkey = _lastkey;
        this.keydown = _keydown;
        this.profiledata = _profiledata;
        this.trainingdata = _trainingdata;

        var self = this;

        this.texts = [
            "test013",
            "test013",
            "test013"
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
            window.localStorage.setItem("output", JSON.stringify(output));
        }

        this.getOutput = function () {
            return JSON.parse(window.localStorage.getItem("output"));
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
                data.duration += (now - this.keydown);
                if(this.lastkey > 0){
                    data.latency += (now - this.lastkey);
                }
                data.count += 1;
                this.profiledata[key] = data;
                this.lastkey = now;
            }
        }

        this.keyDown = function () {
            var d = new Date();
            var now = d.getTime();
            this.keydown = now;
        }

        this.getError = function (a, b) {
            var distArray = levenshteinenator(a, b);
            var dist = distArray[distArray.length - 1][distArray[distArray.length - 1].length - 1];
            if (dist > 2) {
                dist = 2;
            }
            return dist;
        }

        function hd() {
            this.duration = 0;
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
            this["48"] = new hd();
            this["49"] = new hd();
            this["51"] = new hd();
            this["69"] = new hd();
            this["83"] = new hd();
            this["84"] = new hd();
        }

        this.profiledata = new HooruData();


        this.upload = function () {
            var mydata = {
                username: window.localStorage.getItem("username"),
                device: window.localStorage.getItem("device"),
                dataset: this.getNormalizedProfileData()
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
            var dur_avg = 0;
            var count = 0;

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    lat_avg += this.profiledata[key].latency;
                    dur_avg += this.profiledata[key].duration;
                    count += 1;
                }
            }

            lat_avg = lat_avg / count;
            dur_avg = dur_avg / count;

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    this.profiledata[key].latency = this.profiledata[key].latency / this.profiledata[key].count;
                    this.profiledata[key].duration = this.profiledata[key].duration / this.profiledata[key].count;

                    if(this.profiledata[key].latency > lat_avg * 2){
                        this.profiledata[key].latency = 1;
                    }else{
                        this.profiledata[key].latency = 1 / (lat_avg * 2) * this.profiledata[key].latency;
                    }

                    if(this.profiledata[key].duration > dur_avg * 2){
                        this.profiledata[key].duration = 1;
                    }else{
                        this.profiledata[key].duration = 1 / (dur_avg * 2) * this.profiledata[key].duration;
                    }
                }
            }

            var normset = {};

            console.log(this.profiledata);

            for (key in this.profiledata) {
                if (this.profiledata[key]) {
                    normset["*" + key] = this.profiledata[key].latency;
                    normset[key] = this.profiledata[key].duration;
                }
            }
            return JSON.stringify(normset);
        }

    })
;

var keyCodes = {
    3 : "break",
    8 : "backspace / delete",
    9 : "tab",
    12 : 'clear',
    13 : "enter",
    16 : "shift",
    17 : "ctrl ",
    18 : "alt",
    19 : "pause/break",
    20 : "caps lock",
    27 : "escape",
    32 : "spacebar",
    33 : "page up",
    34 : "page down",
    35 : "end",
    36 : "home ",
    37 : "left arrow ",
    38 : "up arrow ",
    39 : "right arrow",
    40 : "down arrow ",
    41 : "select",
    42 : "print",
    43 : "execute",
    44 : "Print Screen",
    45 : "insert ",
    46 : "delete",
    48 : "0",
    49 : "1",
    50 : "2",
    51 : "3",
    52 : "4",
    53 : "5",
    54 : "6",
    55 : "7",
    56 : "8",
    57 : "9",
    58 : ":",
    59 : "semicolon (firefox), equals",
    60 : "<",
    61 : "equals (firefox)",
    63 : "ß",
    64 : "@ (firefox)",
    65 : "a",
    66 : "b",
    67 : "c",
    68 : "d",
    69 : "e",
    70 : "f",
    71 : "g",
    72 : "h",
    73 : "i",
    74 : "j",
    75 : "k",
    76 : "l",
    77 : "m",
    78 : "n",
    79 : "o",
    80 : "p",
    81 : "q",
    82 : "r",
    83 : "s",
    84 : "t",
    85 : "u",
    86 : "v",
    87 : "w",
    88 : "x",
    89 : "y",
    90 : "z",
    91 : "Windows Key / Left ⌘ / Chromebook Search key",
    92 : "right window key ",
    93 : "Windows Menu / Right ⌘",
    96 : "numpad 0 ",
    97 : "numpad 1 ",
    98 : "numpad 2 ",
    99 : "numpad 3 ",
    100 : "numpad 4 ",
    101 : "numpad 5 ",
    102 : "numpad 6 ",
    103 : "numpad 7 ",
    104 : "numpad 8 ",
    105 : "numpad 9 ",
    106 : "multiply ",
    107 : "add",
    108 : "numpad period (firefox)",
    109 : "subtract ",
    110 : "decimal point",
    111 : "divide ",
    112 : "f1 ",
    113 : "f2 ",
    114 : "f3 ",
    115 : "f4 ",
    116 : "f5 ",
    117 : "f6 ",
    118 : "f7 ",
    119 : "f8 ",
    120 : "f9 ",
    121 : "f10",
    122 : "f11",
    123 : "f12",
    124 : "f13",
    125 : "f14",
    126 : "f15",
    127 : "f16",
    128 : "f17",
    129 : "f18",
    130 : "f19",
    131 : "f20",
    132 : "f21",
    133 : "f22",
    134 : "f23",
    135 : "f24",
    144 : "num lock ",
    145 : "scroll lock",
    160 : "^",
    161: '!',
    163 : "#",
    164: '$',
    165: 'ù',
    166 : "page backward",
    167 : "page forward",
    169 : "closing paren (AZERTY)",
    170: '*',
    171 : "~ + * key",
    173 : "minus (firefox), mute/unmute",
    174 : "decrease volume level",
    175 : "increase volume level",
    176 : "next",
    177 : "previous",
    178 : "stop",
    179 : "play/pause",
    180 : "e-mail",
    181 : "mute/unmute (firefox)",
    182 : "decrease volume level (firefox)",
    183 : "increase volume level (firefox)",
    186 : "semi-colon / ñ",
    187 : "equal sign ",
    188 : "comma",
    189 : "dash ",
    190 : "period ",
    191 : "forward slash / ç",
    192 : "grave accent / ñ",
    193 : "?, / or °",
    194 : "numpad period (chrome)",
    219 : "open bracket ",
    220 : "back slash ",
    221 : "close bracket ",
    222 : "single quote ",
    223 : "`",
    224 : "left or right ⌘ key (firefox)",
    225 : "altgr",
    226 : "< /git >",
    230 : "GNOME Compose Key",
    233 : "XF86Forward",
    234 : "XF86Back",
    255 : "toggle touchpad"
};

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
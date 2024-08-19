Vue.component('member', {
    template: '#member-template',
    methods: {
        deleteMember(linkid) {
            app.deleteLink(linkid).then(() => {
                app.get(app.sessionData.teamid);
            });
        },
        displayDelete() {
            if (app.ishost) {
                if (app.sessionData.data) {
                    return !app.sessionData.data.play;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        bomb() {
            return app.sessionData.data.player === this.member.memberid;
        }
    },
    props: {
        member: {
            type: Object,
        }
    },
    computed: {
        score: function () {
            var i = app.getIndexById(this.member.memberid);
            if (i != -1) {
                return app.links[i].score;
            } else {
                return -1
            }
        },

    },
});
var app = new Vue({
    el: '#page-wrapper',
    data: {
        device: '',
        sessionData: {
            teamid: '',
            id: '',
            pass: '',
            data: {
                hostid: '',
                play: false,
                timeStart: null,
                timeEnd: null,
                rounds: [],
                player: null,
            },
        },
        incorrect: false,
        registered: false,
        registration: false,
        login: false,
        member: {
            memberid: '',
            id: '',
            pass: '',
        },
        links: [],
        words: ["да",
            "не", "ка", "ду", "акт", "ан", "ал", "вар", "ад", "бол", "вик", "ум", "ост", "на", "тор", "ма", "род", "то", "фон", "тел", "ом", "ром", "уз", "суда", "ук", "мас", "лог", "за", "раб", "мат", "ит", "пит", "мет", "ик", "уб", "ок", "ле", "сам", "ди", "коп", "лю", "во", "ласт", "га", "от", "ам", "бу", "инт", "жу", "тик", "со", "му", "ев", "фа", "та", "ор", "аз", "ру"
        ]
    },
    methods: {
        getSession: function (id, pass) {
            return axios.post('get.php', {
                table: 'tt_sessions',
                query: {
                    id: id,
                    pass: pass
                }
            }).then((response) => {
                if (response.data.length > 0) {
                    return response.data;
                } else {
                    return false;
                }
            });
        },
        getMember: function (id, pass) {
            return axios.post('get.php', {
                table: 'tt_members',
                query: {
                    id: id,
                    pass: pass
                }
            }).then((response) => {
                if (response.data.length > 0) {
                    return response.data;
                } else {
                    return false;
                }
            });
        },
        getLinks: function () {
            return axios.post('get.php', {
                table: 'tt_link',
                query: {
                    id: this.sessionData.id,
                    pass: this.sessionData.pass
                }
            }).then((response) => {
                if (response.data.length > 0) {
                    return response.data;
                } else {
                    return false;
                }
            });
        },
        createSession: function () {
            return axios.post('create.php', {
                table: 'tt_sessions',
                query: {
                    'id': 'DEFAULT',
                    'pass': generateRandomString(6),
                    'data': JSON.stringify(this.sessionData.data),
                },
            }).then((response) => {
                return response.data;
            });
        },
        createMember: function () {
            return axios.post('create.php', {
                table: 'tt_members',
                query: {
                    'id': 'DEFAULT',
                    'pass': generateRandomString(6),
                    'email': this.member.email,
                    'phone': this.member.phone,
                    'first_name': this.member.first_name,
                    'last_name': this.member.last_name,
                },
            }).then((response) => {
                return response.data;
            });
        },
        createLink: function () {
            return axios.post('create.php', {
                table: 'tt_link',
                query: {
                    'id': this.sessionData.id,
                    'pass': this.sessionData.pass,
                    'memberid': this.member.id,
                    'linkid': 'DEFAULT',
                    'name': this.member.first_name,
                    'score': "0",
                },
            }).then((response) => {
                return response.data;
            });
        },
        saveSession() {
            axios.post('update.php', {
                table: 'tt_sessions',
                query: {
                    'id': this.sessionData.id,
                    'pass': this.sessionData.pass,
                    'data': JSON.stringify(this.sessionData.data)
                },
            }).then((response) => {
                if (response.data.response) {
                    this.saveSessionlocal();
                }
            });
        },
        saveMember() {
            axios.post('update.php', {
                table: 'tt_members',
                query: {
                    'id': this.member.id,
                    'pass': this.member.pass,
                    'email': this.member.email,
                    'phone': this.member.phone,
                    'first_name': this.member.first_name,
                    'last_name': this.member.last_name,
                },
            }).then((response) => {
                if (response.data.response) {
                    if (this.memberinlink !== false) {
                        this.deleteLink(this.links[this.memberinlink].linkid);
                        this.join();
                    }
                    this.saveMemberlocal();
                    this.registration = false;
                }
            });
        },
        saveMyLink(memberid) {
            var i = this.getIndexById(memberid);
            axios.post('update.php', {
                table: 'tt_link',
                query: {
                    'id': this.sessionData.id,
                    'pass': this.sessionData.pass,
                    'memberid': this.member.id,
                    'name': this.member.first_name,
                    'score': this.links[i].score == 0 ? "0" : this.links[i].score
                },
            }).then((response) => {
                if (response.data.response) {
                    this.get(this.sessionData.teamid);
                    return true;
                } else {
                    return false;
                }
            });
        },
        saveSessionlocal() {
            localStorage.setItem('device', this.device);
            const parsed = JSON.stringify(this.sessionData);
            localStorage.setItem('tt_sessionData', parsed);
        },
        saveMemberlocal: function () {
            const parsed = JSON.stringify(this.member);
            localStorage.setItem('tt_member', parsed);
        },
        deleteLink(linkid) {
            return axios.post('delete.php', {
                table: 'tt_link',
                query: {
                    id: this.sessionData.id,
                    pass: this.sessionData.pass,
                    linkid: linkid
                }
            }).then((response) => {
                return response.data.response;
            });
        },
        create: function () {
            this.sessionData.data.hostid = this.device;
            this.sessionData.data.play = false;
            this.sessionData.data.timeStart = null;
            this.sessionData.data.rounds = [];
            this.sessionData.data.timeEnd = null;
            this.sessionData.data.player = null;
            this.createSession().then((data) => {
                if (data.response == true) {
                    this.sessionData.id = data.id;
                    this.sessionData.pass = data.pass;
                    this.sessionData.teamid = data.id + data.pass;
                    this.login = true;
                    this.incorrect = false;
                    this.saveSessionlocal();
                }
            });
        },
        get: function (teamid) {
            this.getSession(teamid.slice(0, -6), teamid.slice(-6)).then((data) => {
                if (data != false) {
                    this.sessionData.id = data[0].id;
                    this.sessionData.pass = data[0].pass;
                    this.sessionData.data = JSON.parse(data[0].data);
                    this.login = true;
                    this.incorrect = false;
                    this.saveSessionlocal();
                    this.getLinks().then((links) => {
                        this.links = links;
                        if (this.memberinlink !== false) {

                        }
                    });
                } else {
                    this.login = false;
                    this.incorrect = true;
                }
            });
        },
        createM: function () {
            return this.createMember().then((data) => {
                if (data.response == true) {
                    this.member.id = data.id;
                    this.member.pass = data.pass;
                    this.member.memberid = data.id + data.pass;
                    this.saveMemberlocal();
                    this.registration = false;
                }
            })
        },
        getM: function (memberid) {
            this.getSession(memberid.slice(0, -6), memberid.slice(-6)).then((data) => {
                if (data != false) {
                    this.member.id = data[0].id;
                    this.member.pass = data[0].pass;
                    this.member.email = data[0].email;
                    this.member.phone = data[0].phone;
                    this.member.first_name = data[0].first_name;
                    this.member.last_name = data[0].last_name;
                    this.saveSessionlocal();
                } else {

                }
            });
        },
        saveM: function () {
            if (this.registration) {
                if (this.member.memberid != '') {
                    this.saveMember();
                } else {
                    this.createM().then(() => {
                        if (this.member.memberid != '') {
                            this.join(this.memberid);
                        }
                    });
                }
            }
        },
        join: function (memberid) {
            if (memberid != '') {
                this.createLink().then(() => {
                    this.get(this.sessionData.teamid);
                });
            } else {
                this.registration = true;
            }
        },

        start: function () {
            this.startRound();

        },
        startRound: function () {
            if (this.sessionData.data.player == null) {
                this.sessionData.data.player = this.links[0].memberid;
            } else {
                this.sessionData.data.player = this.links[this.getIndexById(this.sessionData.data.player) < (this.links.length - 1) ? (this.getIndexById(this.sessionData.data.player) + 1) : 0].memberid;
            }
            this.sessionData.data.play = true;
            this.sessionData.data.rounds.push(this.getWord());
            this.sessionData.data.timeStart = Date.now();
            this.sessionData.data.timeEnd = this.sessionData.data.timeStart + Math.max(Math.round10(Math.max(Math.random(), 0.3) * 3 * this.links.length), 15) * 1000;
            this.saveSession();
            this.get(this.sessionData.teamid);
        },
        give: function () {
            this.sessionData.data.player = this.links[(this.getIndexById(this.sessionData.data.player) + 1) < this.links.length ? (this.getIndexById(this.sessionData.data.player) + 1) : 0].memberid;
            this.saveSession();
            this.get(this.sessionData.teamid);
        },
        getWord: function () {
            var ok = false;
            var rand = Math.round10(Math.random() * (this.words.length - 1));
            var word = this.words[rand];
            if (this.sessionData.data.rounds.length == this.words.length - 1) {
                this.sessionData.data.rounds = [];
            }
            while (!ok) {
                ok = true;
                for (var i = 0; i < this.sessionData.data.rounds.length && ok; i++) {
                    ok = this.sessionData.data.rounds[i] != word;
                }
                if (!ok) {
                    rand = Math.round10(Math.random() * (this.words.length - 1));
                    word = this.words[rand];
                }
            }
            return word;
        },
        dead: function (memberid) {
            var i = this.getIndexById(memberid);
            this.sessionData.data.play = false;
            this.links[i].score++;
            this.saveMyLink(memberid);
            this.sessionData.data.play = false;
            this.saveSession();
            this.get(this.sessionData.teamid);
        },
        getIndexById: function (id) {
            var i = 0;
            var res = -1;
            if (this.links == null || this.links == [] || this.links.length == 0 || this.links == false) { } else {
                this.links.forEach(el => {
                    if (el.memberid == id)
                        res = i;
                    i++;
                });
            }
            return res;
        },

        cur_frame: function () {
            var now = Date.now();
            var end = this.sessionData.data.timeEnd;
            var start = this.sessionData.data.timeStart;
            var cf;
            if (now < (end + 2000)) {
                if (now <= end) {
                    var temp = Math.ceil10((now - start) / (end - start) * 11);
                    temp += Math.floor10(now / 130) % 2;
                    cf = Math.floor10(temp);
                }
                else if (now <= (end + 2000)) {
                    var temp = (now - end) / 2000 * 12;
                    cf = Math.floor10(temp) + 12;
                }
                return "boom/boom_00" + ((30 - cf) >= 10 ? "" : "0") + (30 - cf) + "_Слой-" + cf + ".png";
            } else {
                return -1;
            }
        },
        time_left: function () {
            var now = Date.now();
            var end = this.sessionData.data.timeEnd;
            if (now < end) {
                var min = Math.floor10((end - now) / 60000);
                var sec = Math.floor10((end - now) / 1000 % 60);
                var ms = Math.floor10((end - now) % 1000);
                return min + ":" + sec + ":" + ms;
            } else {
                return -1;
            }
        }
    },
    mounted() {
        if (localStorage.getItem('tt_sessionData')) {
            try {
                this.sessionData = JSON.parse(localStorage.getItem('tt_sessionData'));
            } catch (e) {
                localStorage.removeItem('tt_sessionData');
            }
        }
        this.device = generateRandomString(6);
        if (localStorage.getItem('device')) {
            try {
                this.device = localStorage.getItem('device');
            } catch (e) {
                localStorage.removeItem('device');
            }
        }
        if (localStorage.getItem('tt_member')) {
            try {
                this.member = JSON.parse(localStorage.getItem('tt_member'));
            } catch (e) {
                localStorage.removeItem('tt_member');
            }
        }
        setTimeout(() => {
            let timerId = setInterval(() => {
                if (this.login) {
                    this.get(this.sessionData.teamid);
                }
            }, 100)
        }, 100);
        setTimeout(() => {

            let timerId = setInterval(() => {
                if (this.login && this.sessionData.data.play) {
                    var boomgif = document.getElementById("boom");
                    /*var boomtime = document.getElementById("time");*/
                    boomgif.src = this.cur_frame() != -1 ? this.cur_frame() : "boom/boom_0000_Слой-30.png";
                    /*boomtime.innerHTML = this.time_left() != -1 ? this.time_left() : "00:00:00";*/
                    if (this.time_left() == -1 && this.sessionData.data.player == this.member.id && this.sessionData.data.play) {
                        this.dead(this.member.id);
                    }
                }
            }, 110)
        }, 100);
        var params = getParams();
        if (params.teamid != null) {
            this.sessionData = {
                teamid: params.teamid,
            }
            this.get(this.sessionData.teamid);
        }
        if (params.memberid != null) {
            this.member = {
                memberid: params.memberid,
            }
            this.getM(this.member.memberid);
        }
        /*for(var i = 0; i < this.words.length; i++){
            var count = 0;
            for(var j = 0; j < this.words.length; j++){
                count += this.words[i] == this.words[j] ? 1 : 0; 
                if(count > 1)
                console.log(this.words[i])
            }
        }*/
    },
    computed: {
        link: function () {
            return 'https://apps.arxalex.com/tic-tac-boom?teamid=' + this.sessionData.teamid;
        },
        qrsrc: function () {
            return "https://api.qrserver.com/v1/create-qr-code/?data=" + this.link + "&amp;size=100x100";
        },
        ishost: function () {
            if (this.sessionData.data) {
                return this.device == this.sessionData.data.hostid;
            } else {
                return false;
            }
        },
        memberinlink: function () {
            if (this.links.length != null && this.member.id != null) {
                var isit = false;
                var i = 0;
                for (i = 0; i < this.links.length && !isit; i++) {
                    isit = this.links[i].memberid == this.member.id;
                }
                if (isit) {
                    return i - 1;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        disableShowing: function () {
            return this.links.length == null || this.links.length < 0;
        },
        myscore: function(){
            var i = this.getIndexById(this.member.id);
            if(i != -1){return this.links[i].score;} else{
                return 0;
            }
        }
    },
    watch: {

    },
    created: function () {
        this.registered = this.member.memberid != '';
    }
});
function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function getParams() {
    queryString = window.location.search;
    urlParams = new URLSearchParams(queryString);
    return {
        teamid: urlParams.get('teamid'),
        memberid: urlParams.get('memberid')
    }
}
(function () {
    /**
     * Корректировка округления десятичных дробей.
     *
     * @param {String}  type  Тип корректировки.
     * @param {Number}  value Число.
     * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
     * @returns {Number} Скорректированное значение.
     */
    function decimalAdjust(type, value, exp) {
        // Если степень не определена, либо равна нулю...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // Если значение не является числом, либо степень не является целым числом...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Сдвиг разрядов
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Обратный сдвиг
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Десятичное округление к ближайшему
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Десятичное округление вниз
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Десятичное округление вверх
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();


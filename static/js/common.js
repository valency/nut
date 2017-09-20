var None = null;

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};

String.prototype.overlap = function (s) {
    return this.toString().indexOf(s) > -1 || s.indexOf(this.toString()) > -1;
};

String.prototype.djangoFields = function (s) {
    var fields = this.toString().split("__");
    for (var i = 0; i < fields.length; i++) {
        if (is_empty(s)) return s;
        else s = s[fields[i]];
    }
    return s;
};

String.prototype.escape = function () {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

String.prototype.toTitleCase = function () {
    var i, j, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    // Certain minor words should be left lowercase unless they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), function (txt) {
            return txt.toLowerCase();
        });
    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0, j = uppers.length; i < j; i++) {
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), uppers[i].toUpperCase());
    }
    return str;
};

Array.prototype.contains = function (needle) {
    var find_nan = needle !== needle;
    var index_of;
    if (!find_nan && typeof Array.prototype.indexOf === "function") {
        index_of = Array.prototype.indexOf;
    } else {
        index_of = function (needle) {
            var index = -1;
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                if ((find_nan && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }
    return index_of.call(this, needle) > -1;
};

Array.prototype.locateByKeyValue = function (key, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][key] === value) return i;
    }
    return -1;
};

Array.prototype.randomItem = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.hashItem = function (s) {
    return this[Math.abs(s.hashCode()) % this.length];
};

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

$.fn.enter = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            if ((ev.keyCode ? ev.keyCode : ev.which) === 13) {
                fnc.call(this, ev);
            }
        })
    })
};

$.fn.fileUpload = function (file_picker, callback_loading, callback_success, callback_error) {
    $(this).click(function () {
        file_picker.click();
    });
    file_picker.on('change', function () {
        var form = new FormData();
        var f = $(this).get(0).files;
        if (f.length > 0) {
            f = f[0];
            form.append('', f, f.name);
            if (callback_loading) callback_loading(file_picker);
            $.ajax({
                url: IMG_SERVER,
                type: 'POST',
                data: form,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (callback_success) callback_success(file_picker, data);
                }, error: function () {
                    bootbox.alert(error_message("上传失败！"));
                    if (callback_error) callback_error(file_picker);
                }
            });
        }
    });
};

function is_numeric(s) {
    return !isNaN(parseFloat(s)) && isFinite(s);
}

function is_empty(s) {
    return s === undefined || s === "undefined" || s === null || s === "null" || s === "";
}

function is_object(s) {
    return (s && typeof s === 'object' && !Array.isArray(s));
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function random_color() {
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}

function replace_empty(s, es) {
    if (is_empty(s)) return es;
    else return s;
}

function dict_get_key_by_value(dict, value) {
    for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) {
            if (dict[prop] === value) return prop;
        }
    }
}

function dict_flatten_by_key(dict, key) {
    var d = {};
    for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) {
            d[prop] = dict[prop][key];
        }
    }
    return d;
}

function dict_merge(target, source) {
    if (is_object(target) && is_object(source)) {
        for (const key in source) {
            if (source.hasOwnProperty(key) && is_object(source[key])) {
                if (!target[key]) {
                    var u = {};
                    u[key] = {};
                    Object.assign(target, u);
                }
                target[key] = dict_merge(target[key], source[key]);
            } else {
                u = {};
                u[key] = source[key];
                Object.assign(target, u);
            }
        }
    }
    return target;
}

function convert_django_time(t) {
    if (is_empty(t)) return "无";
    else return moment.tz(t, "GMT").clone().tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss");
}

function convert_django_time_reverse(t) {
    if (is_empty(t)) return null;
    else return moment.tz(t, "Asia/Shanghai").clone().tz("GMT").format("YYYY-MM-DD HH:mm:ss");
}

function convert_django_date(t) {
    if (is_empty(t)) return "无";
    else return moment.tz(t, "GMT").clone().tz("Asia/Shanghai").format("YYYY-MM-DD");
}

function convert_django_time_range(t) {
    if (is_empty(t)) return "无";
    else return moment.tz(t, "GMT").clone().tz("Asia/Shanghai").fromNow();
}

function url_page() {
    return window.location.pathname.split("/").pop();
}

function url_parameter(p) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === p) {
            return sParameterName[1];
        }
    }
}

function url_redirect(args) {
    var l = window.location;
    var params = {};
    var x = /(?:\??)([^=&?]+)=?([^&?]*)/g;
    var s = l.search;
    for (var r = x.exec(s); r; r = x.exec(s)) {
        r[1] = decodeURIComponent(r[1]);
        if (!r[2]) r[2] = '%%';
        params[r[1]] = r[2];
    }
    for (var i in args) {
        if (args.hasOwnProperty(i)) params[i] = encodeURIComponent(args[i]);
    }
    var search = [];
    for (var j in params) {
        var p = encodeURIComponent(j);
        var v = params[j];
        if (v !== '%%') p += '=' + v;
        search.push(p);
    }
    search = search.join('&');
    l.search = search;
}


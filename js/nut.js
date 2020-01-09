function api(type, url, data, callback) {
    $.ajax({
        headers: {"Authorization": "Token " + Cookies.get('deepfox_token')},
        type: type,
        dataType: "json",
        url: url,
        data: data,
        complete: function (xhr) {
            var data = xhr["responseJSON"];
            if (is_empty(data)) data = xhr["responseText"];
            if (xhr.status >= 200 && xhr.status < 300) {
                if (callback && callback["success"]) callback["success"](data);
            } else {
                if (callback && callback["error"]) callback["error"](data);
            }
        }
    });
}

function message(msg, type) {
    if (is_empty(msg)) msg = "载入中...";
    if (is_empty(type)) type = 'loading';
    var icons = {
        success: "check-circle",
        danger: "times-circle",
        warning: "exclamation-circle",
        info: "info-circle",
        loading: "spin fa-spinner"
    };
    return "<span class='text-" + type + "'><i class='fa fa-" + icons[type] + "'></i> " + msg + "</span>";
}

function dialog_confirm(msg, type, callback, cancel) {
    bootbox.hideAll();
    bootbox.confirm({
        message: message(msg, type),
        closeButton: false,
        callback: function (result) {
            if (result) {
                if (callback) callback();
            } else if (cancel) cancel();
        }
    });
}

function dialog_alert(msg, type, callback) {
    bootbox.hideAll();
    bootbox.alert({
        message: message(msg, type),
        closeButton: false,
        callback: function () {
            if (callback) callback();
        }
    });
}

function dialog_error(msg, resp, callback) {
    bootbox.hideAll();
    bootbox.alert({
        message: message(msg, 'danger') + '<p><pre>' + (typeof resp === "object" ? JSON.stringify(resp, null, 2) : resp) + '</pre></p>',
        closeButton: false,
        callback: function () {
            if (callback) callback();
        }
    });
}

function dialog_loading(msg) {
    bootbox.hideAll();
    bootbox.dialog({
        message: message(msg, 'loading'),
        closeButton: false
    });
}

function dialog_ajax(type, url, data, msg, callback) {
    dialog_loading();
    api(type, url, data, {
        success: function (resp) {
            if (msg && msg["success"]) {
                dialog_alert(msg["success"], "success", function () {
                    if (callback && callback["success"]) callback["success"](resp);
                });
            } else {
                if (callback && callback["success"]) callback["success"](resp);
            }
        }, error: function (resp) {
            if (msg && msg["error"]) {
                dialog_error(msg["error"], resp, function () {
                    if (callback && callback["error"]) callback["error"](resp);
                });
            } else {
                if (callback && callback["error"]) callback["error"](resp);
            }
        }
    });
}

function init_widget() {
    $(".wrapper").remove();
    $(".main-content").removeClass("hidden");
}

function init_editor(selector, mode, readonly) {
    var editor = ace.edit(selector);
    editor.setOptions({
        mode: "ace/mode/" + mode
    });
    if (readonly) {
        editor.setOptions({
            readOnly: true,
            maxLines: 20
        });
    } else {
        editor.setOptions({
            minLines: 20,
            maxLines: 20
        });
    }
    return editor;
}

function init_error(resp) {
    $('.wrapper').html('<div class="center"><pre class="exception">' + (typeof resp === "object" ? JSON.stringify(resp, null, 2) : resp) + '</pre></div>');
}
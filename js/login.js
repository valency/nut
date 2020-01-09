$(function () {
    $('#navbar-main .navbar-right').remove();
    init_widget();
});

function login() {
    var username = $("#username").val();
    var password = CryptoJS.MD5($("#password").val()).toString();
    dialog_ajax("GET", API_SERVER + "auth/login/", {
        certification: username,
        password: password
    }, {
        error: "登录失败！"
    }, {
        success: function (resp) {
            Cookies.set('deepfox_token', resp['token']);
            var r = url_parameter("callback");
            if (is_empty(r)) r = ".";
            location.href = r;
        }
    });
}


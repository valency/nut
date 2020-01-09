var USER = null;

function check_login(callback) {
    var current_page = url_page();
    if (is_empty(Cookies.get('deepfox_token'))) {
        location.href = "login.html?callback=" + current_page;
    } else {
        api("GET", API_SERVER + "auth/detail/", null, {
            success: function (data) {
                USER = data;
                if (!data["is_staff"]) {
                    $(".username").html("<i class='fa fa-user'></i> " + data["first_name"]);
                } else {
                    $(".username").html("<i class='fa fa-ra'></i> " + data["first_name"]);
                }
                if (callback) callback(data);
            }, error: function () {
                location.href = "login.html?callback=" + current_page;
            }
        });
    }
}

function logout() {
    Cookies.remove("deepfox_token");
    location.href = ".";
}

function change_password() {
    var html = "<div class='form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>当前密码</span>";
    html += "<input type='password' id='change_password_old' class='form-control'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>新密码</span>";
    html += "<input type='password' id='change_password_new' class='form-control'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>再输入一次新密码</span>";
    html += "<input type='password' id='change_password_new_repeat' class='form-control'/>";
    html += "</div>";
    html += "</div>";
    bootbox.dialog({
        title: "修改密码",
        message: html,
        buttons: {
            ok: {
                label: "<i class='fa fa-check'></i> 确定",
                callback: function () {
                    dialog_ajax("PUT", API_SERVER + "auth/password/", {
                        password_old: CryptoJS.MD5($("#change_password_old").val()).toString(),
                        password_new: CryptoJS.MD5($("#change_password_new").val()).toString(),
                        password_confirm: CryptoJS.MD5($("#change_password_new_repeat").val()).toString()
                    }, {
                        success: "密码修改成功！",
                        error: "修改密码失败！"
                    }, {
                        success: function () {
                            logout();
                        }, error: function () {
                            change_password();
                        }
                    });
                }
            }
        }
    });
}
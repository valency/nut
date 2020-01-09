// TODO: both table and insertion dialog are too long, should shorten

$(document).ready(function () {
    check_login();
    $("#menu-data").addClass("active open");
    $("#menu-data>a>.arrow").addClass("open");
    $("#menu-data>a").append("<span class='selected'></span>");
    $("#menu-data-src").addClass("active");
    api("GET", API_SERVER + "data/src/list/", null, {
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var src = data[i];
                var html = "<tr class='hand' onclick=\"src_detail('" + src["id"] + "');\">";
                html += "<td><code>" + src["id"] + "</code>" + (src["public"] ? "<span class='badge badge-primary pull-right'>公开</span>" : "") + "</td>";
                html += "<td>" + convert_django_time(src["t"]) + "</td>";
                html += "<td>" + src["name"] + "</td>";
                html += "<td>" + SRC_ENGINES[src["engine"]] + "</td>";
                html += "<td>" + src["ip"] + ":" + src["port"] + "</td>";
                html += "</tr>";
                $("#table-src tbody").append(html);
            }
            $("#table-src").DataTable(DT_CONF_LITE);
            init_widget();
        }, error: function () {
            show_dialog("error", "数据源列表加载失败", null, function () {
                location.reload();
            });
        }
    });
});

function src_detail(id) {
    api("GET", API_SERVER + "data/src/list/", {
        id: id
    }, {
        success: function (data) {
            var html = "<div><span class='badge badge-primary'>" + SRC_ENGINES[data["engine"]] + "</span> " + data["ip"] + ":" + data["port"] + "</div><hr/>";
            html += "<div><b>添加时间：</b> " + convert_django_time(data["t"]) + "</div>";
            html += "<div><b>访问凭证：</b> " + data["username"] + " / " + replace_empty(data["password"], EMPTY_LABEL) + "</div>";
            html += "<div><b>默认数据库 / Schema：</b> " + data["database"] + " / " + replace_empty(data["schema"], EMPTY_LABEL) + "</div>";
            bootbox.dialog({
                title: "<code>" + data["id"] + "</code> " + data["name"] + (data["public"] ? " <span class='badge badge-primary'>公开</span>" : ""),
                message: html,
                buttons: {
                    edit: {
                        label: "<i class='fa fa-edit'></i> 修改",
                        className: "btn-warning",
                        callback: function () {
                            src_edit(id);
                        }
                    }, delete: {
                        label: "<i class='fa fa-trash'></i> 删除",
                        className: "btn-danger",
                        callback: function () {
                            src_delete(id);
                        }
                    }
                }
            });
        }, error: function () {
            show_dialog("error", "数据源列表加载失败", null, function () {
                location.reload();
            });
        }
    });
}

function src_input(mode, conf, callback) {
    var mode_title = ['添加', '修改'];
    conf = Object.assign({
        id: '',
        name: '',
        engine: 4,
        ip: '',
        port: '',
        database: '',
        schema: '',
        username: '',
        password: '',
        public: false
    }, conf);
    var html = "<div class='row'>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>代号</span>";
    html += "<input id='src-create-id' class='form-control' value='" + replace_empty(conf['id'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>名称</span>";
    html += "<input id='src-create-name' class='form-control' value='" + replace_empty(conf['name'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>引擎</span>";
    html += "<select id='src-create-engine' class='form-control' " + (mode === 1 ? "disabled" : "") + ">";
    for (var i in SRC_ENGINES) {
        if (SRC_ENGINES.hasOwnProperty(i)) {
            html += "<option value='" + i + "'>" + SRC_ENGINES[i] + "</option>";
        }
    }
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问权限</span>";
    html += "<select id='src-create-public' class='form-control'>";
    html += "<option value='False'>私密</option>";
    html += "<option value='True'>公开</option>";
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问地址</span>";
    html += "<input id='src-create-ip' class='form-control' value='" + replace_empty(conf['ip'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问端口</span>";
    html += "<input id='src-create-port' class='form-control' value='" + replace_empty(conf['port'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问用户名</span>";
    html += "<input id='src-create-username' class='form-control' value='" + replace_empty(conf['username'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问密码</span>";
    html += "<input id='src-create-password' class='form-control' value='" + replace_empty(conf['password'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>默认数据库</span>";
    html += "<input id='src-create-database' class='form-control' value='" + replace_empty(conf['database'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='col-md-6 form-group'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>默认 Schema</span>";
    html += "<input id='src-create-schema' class='form-control' value='" + replace_empty(conf['schema'], '') + "'/>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    bootbox.dialog({
        title: mode_title[mode] + "数据源",
        message: html,
        buttons: {
            ok: {
                label: "<i class='fa fa-check'></i> 确定",
                callback: function () {
                    if (callback) callback({
                        id: $("#src-create-id").val(),
                        name: $("#src-create-name").val(),
                        engine: $("#src-create-engine").val(),
                        ip: $("#src-create-ip").val(),
                        port: $("#src-create-port").val(),
                        database: $("#src-create-database").val(),
                        schema: $("#src-create-schema").val(),
                        username: $("#src-create-username").val(),
                        password: $("#src-create-password").val(),
                        public: $("#src-create-public").val()
                    });
                }
            }
        }
    }).on("shown.bs.modal", function () {
        $("#src-create-engine").val(conf['engine']);
        $("#src-create-public").val(conf['public'].toString().toTitleCase());
        init_widget();
    });
}

function src_create(conf) {
    src_input(0, conf, function (data) {
        ajax_dialog("POST", API_SERVER + "data/list/", data, {
            success: "数据源添加成功",
            error: "数据源添加失败"
        }, null, {
            error: function () {
                src_create(data);
            }
        });
    });
}

function src_delete(sid) {
    confirm_dialog({
        msg: {
            title: "确定删除该数据源？",
            success: "数据源删除成功",
            error: "数据源删除失败"
        }, ajax: {
            type: "DELETE",
            url: API_SERVER + "data/list/",
            data: {
                id: sid
            }
        }
    });
}

function src_edit(sid) {
    loading_dialog();
    api("GET", API_SERVER + "data/list/", {
        id: sid
    }, {
        success: function (conf) {
            bootbox.hideAll();
            src_input(1, conf, function (data) {
                var field = [];
                var value = [];
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        if (data[i] !== conf[i].toString()) {
                            field.push(i);
                            value.push(data[i]);
                        }
                    }
                }
                ajax_dialog("PUT", API_SERVER + "data/list/", {
                    id: data['id'],
                    field: field.join(','),
                    value: value.join(',')
                }, {
                    success: "数据源修改成功",
                    error: "数据源修改失败"
                }, null, {
                    success: function () {
                        location.reload();
                    }, error: function () {
                        src_edit(sid);
                    }
                });
            });
        }, error: function (resp) {
            error_dialog("数据源加载失败", resp);
        }
    });
}
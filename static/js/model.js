var model_query_editor = null;
var model_filter = null;

$(document).ready(function () {
    check_login();
    model_filter = url_parameter('f');
    $("#navbar-" + model_filter).addClass("active");
    api("GET", API_SERVER + "model/list/", null, {
        success: function (resp) {
            for (var i = 0; i < resp.length; i++) {
                var model = resp[i];
                if (model['id'].indexOf(model_filter) === 0) {
                    var html = "<tr class='hand' onclick=\"show_model('" + model["id"] + "');\">";
                    html += "<td><code>" + model["id"] + "</code>" + (model["public"] ? "<span class='badge badge-primary pull-right'>公开</span>" : "") + "</td>";
                    html += "<td>" + model["name"] + "</td>";
                    html += "<td>" + convert_django_time(model["t"]) + "</td>";
                    html += "<td>" + MODEL_TYPE[model["type"]] + "</td>";
                    html += "</tr>";
                    $("#table-models tbody").append(html);
                }
            }
            $("#table-models").DataTable(DT_CONF_LITE);
            init_widget();
            var model_id = decodeURIComponent(url_parameter("id"));
            if (!is_empty(model_id)) show_model(model_id);
        }, error: function (resp) {
            init_error(resp);
        }
    });
});

function show_model(id) {
    dialog_loading();
    api("GET", API_SERVER + "model/list/", {
        id: id
    }, {
        success: function (model) {
            var html = "<pre id='model-query-detail'>" + model["code"] + "</pre><hr/>";
            html += "<div id='model_detail_results' class='table-wrapper-limited'>" + message(null, 'loading') + "</div>";
            bootbox.hideAll();
            bootbox.dialog({
                size: 'large',
                title: "<code>" + model["id"] + "</code> " + model["name"],
                message: html,
                buttons: {
                    exec: {
                        label: "<i class='fa fa-play'></i> 运行",
                        className: "btn-primary",
                        callback: function () {
                            if (model["type"] === 1 || model["type"] === 2) {
                                dialog_loading("正在查询数据源...");
                                api("GET", API_SERVER + "data/list/", null, {
                                    success: function (data) {
                                        var html = "<div class='form-group'>";
                                        html += "<div class='input-group'>";
                                        html += "<span class='input-group-addon'>数据源</span>";
                                        html += "<select id='model-exe-src' class='form-control'>";
                                        for (var i = 0; i < data.length; i++) {
                                            var src = data[i];
                                            html += "<option value='" + src["id"] + "'>" + src["name"] + "</option>";
                                        }
                                        html += "</select>";
                                        html += "</div>";
                                        html += "</div>";
                                        html += "<hr/><div class='form-group'>模型将在上述数据源上运行，并使用如下参数：</div><hr/>";
                                        if (!is_empty(model["argument"])) {
                                            for (i = 0; i < model["argument"].length; i++) {
                                                var arg = model["argument"][i];
                                                html += "<div class='form-group'>";
                                                html += "<div class='input-group'>";
                                                html += "<span class='input-group-addon'>" + arg + "</span>";
                                                html += "<input id='model-exe-argument-" + arg + "' class='form-control' placeholder='请勿输入双引号（\"），如有需要请转义'/>";
                                                html += "</div>";
                                                html += "</div>";
                                            }
                                        } else {
                                            html += "<div class='form-group'>" + message("本模型无需提供参数。", 'success') + "</div>";
                                        }
                                        bootbox.hideAll();
                                        bootbox.dialog({
                                            title: "模型参数设置",
                                            message: html,
                                            buttons: {
                                                exec: {
                                                    label: "<i class='fa fa-play'></i> 运行",
                                                    className: "btn-primary",
                                                    callback: function () {
                                                        var arguments = null;
                                                        if (!is_empty(model["argument"])) {
                                                            arguments = "";
                                                            for (var i = 0; i < model["argument"].length; i++) {
                                                                var arg = model["argument"][i];
                                                                arguments += arg + " = \"" + $("#model-exe-argument-" + arg).val() + "\"\n";
                                                            }
                                                        }
                                                        var src = $("#model-exe-src").val();
                                                        model_exe(model["id"], arguments, src, null);
                                                    }
                                                }
                                            }
                                        }).on("shown.bs.modal", function () {
                                            init_widget();
                                        });
                                    }, error: function (resp) {
                                        dialog_error("数据源列表加载失败", resp, function () {
                                            show_model(id);
                                        });
                                    }
                                });
                            } else if (model['type'] === 3) {
                                dialog_loading("正在查询运行环境...");
                                api("GET", API_SERVER + "runtime/list/", null, {
                                    success: function (data) {
                                        var html = "<div class='form-group'>";
                                        html += "<div class='input-group'>";
                                        html += "<span class='input-group-addon'>运行环境</span>";
                                        html += "<select id='model-exe-src' class='form-control'>";
                                        for (var i = 0; i < data.length; i++) {
                                            var src = data[i];
                                            html += "<option value='" + src["id"] + "'>" + src["name"] + "</option>";
                                        }
                                        html += "</select>";
                                        html += "</div>";
                                        html += "</div>";
                                        bootbox.hideAll();
                                        bootbox.dialog({
                                            title: "模型参数设置",
                                            message: html,
                                            buttons: {
                                                exec: {
                                                    label: "<i class='fa fa-play'></i> 运行",
                                                    className: "btn-primary",
                                                    callback: function () {
                                                        var rte = $("#model-exe-src").val();
                                                        model_exe(model["id"], null, null, rte);
                                                    }
                                                }
                                            }
                                        }).on("shown.bs.modal", function () {
                                            init_widget();
                                        });
                                    }, error: function (resp) {
                                        dialog_error("数据源列表加载失败", resp, function () {
                                            show_model(id);
                                        });
                                    }
                                });
                            } else {
                                dialog_error('无法运行此类型的模型', null, function () {
                                    show_model(id);
                                });
                            }
                        }
                    }, edit: {
                        label: "<i class='fa fa-edit'></i> 修改",
                        className: "btn-warning",
                        callback: function () {
                            model_modify(model);
                        }
                    }, debug: {
                        label: "<i class='fa fa-sun-o'></i> 调试",
                        className: "btn-warning",
                        callback: function () {
                            location.href = 'editor?f=' + model_filter + '&id=' + id;
                        }
                    }, delete: {
                        label: "<i class='fa fa-trash'></i> 删除",
                        className: "btn-danger",
                        callback: function () {
                            model_del(model["id"]);
                        }
                    }
                }
            }).on("shown.bs.modal", function () {
                init_editor("model-query-detail", model["syntax"], true);
                api("GET", API_SERVER + "model/history/", {
                    model: id,
                    limit: 5
                }, {
                    success: function (resp) {
                        var html = "<table class='table table-bordered table-condensed table-hover'>";
                        html += "<thead><tr><th>ID</th><th>运行账户</th><th>运行时间</th></tr></thead><tbody>";
                        for (var i = 0; i < resp.length; i++) {
                            var history = resp[i];
                            html += "<tr class='hand'>";
                            html += "<td>" + history["id"] + "</td>";
                            html += "<td>" + history["account"] + "</td>";
                            html += "<td>" + convert_django_time(history["t"]) + "</td>";
                            html += "</tr>";
                        }
                        html += "</tbody></table><p class='model-result-limit'>仅显示最近 5 条运行结果，<a href='" + ADMIN_SERVER + "result?id=" + id + "' target='_blank'>查看全部</a></p>";
                        $("#model_detail_results").html(html);
                        $("#model_detail_results tbody tr").click(function () {
                            show_result($($(this).children()[0]).html(), model["type"], model["figure"], model["figure_label"], function () {
                                show_model(id);
                            });
                        });
                    }, error: function (resp) {
                        show_dialog("error", "分析结果加载失败", "<pre>" + JSON.stringify(resp, null, 2) + "</pre>", function () {
                            location.reload();
                        });
                    }
                });
            });
        }, error: function (resp) {
            show_dialog("error", "模型加载失败", "<pre>" + JSON.stringify(resp, null, 2) + "</pre>");
        }
    });
}

function model_input(mode, conf, callback) {
    var mode_title = ['创建', '修改'];
    var html = "<div class='row'>";
    html += "<div class='form-group col-md-12'>";
    html += "<select id='model-query-syntax' class='form-control'>";
    html += "<option value='plain_text'>N/A</option>";
    var mode_list = ace.require('ace/ext/modelist').modesByName;
    for (var i in mode_list) {
        if (mode_list.hasOwnProperty(i)) {
            html += "<option value='" + i + "'>" + mode_list[i]['caption'] + "</option>";
        }
    }
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "<div class='row'>";
    html += "<div class='form-group col-md-12'>";
    html += "<textarea id='model-query-input' class='form-control' rows='10'></textarea>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class='row'>";
    html += "<div class='form-group col-md-6'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>模型名称</span>";
    html += "<input id='model-title-input' class='form-control'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group col-md-6'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>模型代号</span>";
    html += "<input id='model-id-input' class='form-control' placeholder='仅限英文、数字及下划线' " + (mode === 1 ? "disabled" : "") + "/>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class='row'>";
    html += "<div class='form-group col-md-6'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>运行环境</span>";
    html += "<select id='model-type-input' class='form-control'>";
    for (i = 1; i < MODEL_TYPE.length; i++) {
        html += "<option value='" + i + "'>" + MODEL_TYPE[i] + "</option>";
    }
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group col-md-6'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>访问权限</span>";
    html += "<select id='model-public-input' class='form-control'>";
    html += "<option value='False'>私密</option>";
    html += "<option value='True'>公开</option>";
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class='row'>";
    html += "<div class='form-group col-md-12'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>参数列表</span>";
    html += "<input id='model-argument-input' class='form-control' placeholder='逗号分隔'/>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "<div class='row hidden'>";
    html += "<div class='form-group col-md-4'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>图表标题</span>";
    html += "<input id='model-figure-title-input' class='form-control'/>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group col-md-4'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>图表类型</span>";
    html += "<select id='model-figure-type-input' class='form-control'>";
    for (i = 0; i < MODEL_FIGURE.length; i++) {
        html += "<option value='" + i + "'>" + MODEL_FIGURE[i] + "</option>";
    }
    html += "</select>";
    html += "</div>";
    html += "</div>";
    html += "<div class='form-group col-md-4'>";
    html += "<div class='input-group'>";
    html += "<span class='input-group-addon'>图表表头</span>";
    html += "<input id='model-figure-label-input' class='form-control' placeholder='逗号分隔'/>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    bootbox.dialog({
        title: mode_title[mode] + "模型" + (mode === 1 ? ' <a href="editor?f=' + model_filter + '&id=' + conf['id'] + '"><i class="fa fa-share"></i></a>' : ''),
        size: 'large',
        message: html,
        buttons: {
            ok: {
                label: "<i class='fa fa-check'></i> 确定",
                callback: function () {
                    if (callback) callback({
                        id: $("#model-id-input").val(),
                        name: $("#model-title-input").val(),
                        type: $("#model-type-input").val(),
                        code: model_query_editor.getValue(),
                        argument: $("#model-argument-input").val(),
                        figure: $("#model-figure-type-input").val(),
                        figure_title: $("#model-figure-title-input").val(),
                        figure_label: $("#model-figure-label-input").val(),
                        public: $("#model-public-input").val(),
                        syntax: $('#model-query-syntax').val()
                    });
                }
            }
        }
    }).on("shown.bs.modal", function () {
        var model_type_input = $("#model-type-input");
        var model_query_syntax = $('#model-query-syntax');
        if (conf) {
            $("#model-id-input").val(conf["id"]);
            $("#model-title-input").val(conf["name"]);
            model_type_input.val(conf["type"]);
            $("#model-query-input").html(conf["code"]);
            $("#model-argument-input").val(conf["argument"]);
            $("#model-figure-type-input").val(conf["figure"]);
            $("#model-figure-title-input").val(conf["figure_title"]);
            $("#model-figure-label-input").val(conf["figure_label"]);
            $("#model-public-input").val(conf["public"].toString().toTitleCase());
            model_query_syntax.val(conf["syntax"]);
        } else {
            model_query_syntax.val(MODEL_RENDER_TYPE[model_type_input.val()]);
        }
        init_widget();
        model_query_editor = init_editor("model-query-input", model_query_syntax.val());
        model_query_syntax.on("change", function () {
            model_query_editor.setOptions({
                mode: "ace/mode/" + $(this).val()
            });
        });
        model_type_input.on("change", function () {
            var code_syntax = MODEL_RENDER_TYPE[$(this).val()];
            if (code_syntax !== MODEL_RENDER_TYPE[0]) model_query_syntax.val(code_syntax).trigger('change');
        });
    });
}

function model_add(conf) {
    model_input(0, conf, function (data) {
        dialog_ajax("POST", API_SERVER + "model/list/", data, {
            success: "模型创建成功！",
            error: "模型创建失败！"
        }, {
            success: function () {
                url_redirect({
                    id: data["id"]
                });
            }, error: function () {
                model_add(data);
            }
        });
    });
}

function model_modify(conf) {
    var distinct_fields = ['code', 'argument', 'figure_label'];
    model_input(1, conf, function (data) {
        var d = {
            id: data['id']
        };
        var field = [];
        var value = [];
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (is_empty(conf[i]) || data[i] !== conf[i].toString()) {
                    if (distinct_fields.indexOf(i) < 0) {
                        field.push(i);
                        value.push(data[i]);
                    } else {
                        d[i] = replace_empty(data[i], 'null');
                    }
                }
            }
        }
        d['field'] = field.join(',');
        d['value'] = value.join(',');
        dialog_ajax("PUT", API_SERVER + "model/list/", d, {
            success: "模型修改成功！",
            error: "模型修改失败！"
        }, {
            success: function () {
                url_redirect({
                    id: data["id"]
                });
            }, error: function () {
                model_modify(data);
            }
        });
    });
}

function model_del(id) {
    dialog_confirm("确定删除该模型？", 'warning', function () {
        dialog_ajax("DELETE", API_SERVER + "model/list/", {
            id: id
        }, {
            success: "模型删除成功！",
            error: "模型删除失败！"
        }, {
            success: function () {
                url_redirect({
                    id: ''
                });
            }
        });
    });
}

function model_exe(id, args, src, rte) {
    dialog_loading("正在查询模型运行历史...");
    api("GET", API_SERVER + "model/history/", {
        model: id,
        conf: args,
        limit: 1
    }, {
        success: function (resp) {
            if (resp.length > 0) {
                bootbox.hideAll();
                bootbox.confirm({
                    message: '<p>' + message("是否确认重复运行模型？该模型已使用此参数在下列时间运行过：", 'warning') + '</p><span class=\'label label-info\'>' + convert_django_time(resp[0]["t"]) + '</span>',
                    closeButton: false,
                    callback: function (result) {
                        if (result) model_exe_confirm(id, args, src, rte);
                    }
                });
            } else {
                model_exe_confirm(id, args, src, rte);
            }
        }, error: function (resp) {
            dialog_error("模型运行历史加载失败", resp, function () {
                show_model(id);
            });
        }
    });
}

function model_exe_confirm(id, args, src, rte) {
    var data = {
        model: id,
        conf: args
    };
    if (!is_empty(src)) data['data'] = src;
    if (!is_empty(rte)) data['runtime'] = rte;
    dialog_ajax("POST", API_SERVER + "model/exec/", data, {
        success: "模型运行成功！",
        error: "模型运行失败！"
    }, {
        success: function () {
            show_model(id);
        }, error: function () {
            show_model(id);
        }
    });
}


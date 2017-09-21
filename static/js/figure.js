function show_result(id, src_type, figure_type, figure_label, callback) {
    dialog_loading();
    api("GET", API_SERVER + "model/history/", {
        id: id
    }, {
        success: function (resp) {
            resp["conf"] = replace_empty(resp["conf"], null);
            var html = is_empty(resp["conf"]) ? message("没有提供参数。", 'info') : "<pre class='table-wrapper-limited'>" + resp["conf"] + "</pre>";
            html += "<hr/><div id='figure-" + id + "'>" + message() + "</div>";
            bootbox.hideAll();
            bootbox.alert({
                size: 'large',
                title: "<code>" + id + "</code> 分析结果 <a id='result-dialog-btn-refresh'><i class='fa fa-refresh'></i></a>",
                message: html,
                callback: function () {
                    if (callback) callback();
                }
            }).on("shown.bs.modal", function () {
                render_figure(resp, figure_type, figure_label);
                $("#result-dialog-btn-refresh").click(function () {
                    dialog_confirm("是否确认重复运行模型？", 'warning', function () {
                        dialog_ajax("POST", API_SERVER + "model/exec/", {
                            model: resp["model"],
                            data: resp["data"],
                            conf: resp["conf"]
                        }, {
                            success: "模型运行成功！",
                            error: "模型运行失败！"
                        }, {
                            success: function (resp) {
                                show_result(resp["id"], src_type, figure_type, figure_label, callback);
                            }, error: function (resp) {
                                show_result(resp["id"], src_type, figure_type, figure_label, callback);
                            }
                        });
                    }, function () {
                        show_result(id, src_type, figure_type, figure_label, callback);
                    });
                });
            });
        }, error: function (resp) {
            dialog_error("分析结果加载失败", resp);
        }
    });
}

function render_figure(data, figure_type, figure_label) {
    var container = $("#figure-" + data["id"]);
    if (is_empty(data["result"])) {
        container.html(message("运行结果为空。", 'info'));
    } else if (figure_type === 0) {
        container.html("<pre class='table-wrapper-limited'>" + data["result"] + "</pre>");
    } else {
        try {
            var result = eval(data["result"]);
            if (result.length > 0) {
                var html = "<div class='table-wrapper-limited'>";
                html += "<table class='table table-bordered table-hover table-condensed'>";
                html += "<thead><tr>";
                for (var i in result[0]) {
                    if (result[0].hasOwnProperty(i)) {
                        html += "<th>" + i + "</th>";
                    }
                }
                html += "</tr></thead><tbody>";
                for (i = 0; i < result.length; i++) {
                    html += "<tr>";
                    for (var j in result[i]) {
                        if (result[i].hasOwnProperty(j)) {
                            html += "<td>" + result[i][j] + "</td>";
                        }
                    }
                    html += "</tr>";
                }
                html += "</tbody></table>";
                html += "</div>";
                container.html(html);
            } else {
                container.html(message("运行结果为空。", 'info'));
            }
        } catch (err) {
            container.height("auto");
            container.html("<p style='margin-top:0;'>" + message("数据格式错误，无法显示！", 'danger') + "</p>");
            container.append("<pre class='table-wrapper-limited'>" + data["result"].escape() + "</pre>");
            container.append("<pre class='exception table-wrapper-limited'>" + err + "</pre>");
        }
    }
    if (!is_empty(data["exception"])) {
        container.append("<hr/><pre class='exception table-wrapper-limited'>" + data["exception"] + "</pre>");
    }
}

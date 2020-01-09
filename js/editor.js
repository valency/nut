var model_query_editor = null;
var model_last_save = null;
var model_filter = null;

$(document).ready(function () {
    check_login();
    model_filter = url_parameter('f');
    $("#navbar-" + model_filter).addClass("active");
    // Init editor
    var mode_list = ace.require('ace/ext/modelist').modesByName;
    for (var i in mode_list) {
        if (mode_list.hasOwnProperty(i)) {
            $('#model-query-syntax').append("<option value='" + i + "'>" + mode_list[i]['caption'] + "</option>");
        }
    }
    for (i = 1; i < MODEL_TYPE.length; i++) {
        $('#model-type-input').append("<option value='" + i + "'>" + MODEL_TYPE[i] + "</option>");
    }
    for (i = 0; i < MODEL_FIGURE.length; i++) {
        $('#model-figure-type-input').append("<option value='" + i + "'>" + MODEL_FIGURE[i] + "</option>");
    }
    api("GET", API_SERVER + "data/list/", null, {
        success: function (resp) {
            for (var i = 0; i < resp.length; i++) {
                var src = resp[i];
                $('#model-exe-src').append("<option value='" + src["id"] + "'>" + src["name"] + "</option>");
            }
        }, error: function (resp) {
            init_error(resp);
        }
    });
    api("GET", API_SERVER + "runtime/list/", null, {
        success: function (resp) {
            for (var i = 0; i < resp.length; i++) {
                var src = resp[i];
                if (src['id'].indexOf(model_filter) === 0) $('#model-exe-rte').append("<option value='" + src["id"] + "'>" + src["name"] + "</option>");
            }
        }, error: function (resp) {
            init_error(resp);
        }
    });
    // Load data
    var mid = decodeURIComponent(url_parameter("id"));
    if (!is_empty(mid)) {
        api("GET", API_SERVER + "model/list/", {
            id: mid
        }, {
            success: function (resp) {
                model_last_save = resp;
                var model_type_input = $("#model-type-input");
                var model_query_syntax = $('#model-query-syntax');
                var model_argument_input = $("#model-argument-input");
                $("#model-id-input").val(model_last_save["id"]);
                $("#model-title-input").val(model_last_save["name"]);
                model_type_input.val(model_last_save["type"]);
                $("#model-query-input").html(model_last_save["code"]);
                model_argument_input.val(model_last_save["argument"]);
                $("#model-figure-type-input").val(model_last_save["figure"]);
                $("#model-figure-title-input").val(model_last_save["figure_title"]);
                $("#model-figure-label-input").val(model_last_save["figure_label"]);
                $("#model-public-input").val(model_last_save["public"].toString().toTitleCase());
                $('#model-last-update').html('最后保存：' + convert_django_time(model_last_save['t']));
                model_query_syntax.val(model_last_save["syntax"]);
                model_query_editor = init_editor("model-query-input", model_query_syntax.val());
                model_query_syntax.on("change", function () {
                    model_query_editor.setOptions({
                        mode: "ace/mode/" + $(this).val()
                    });
                });
                model_type_input.on("change", function () {
                    var code_syntax = MODEL_RENDER_TYPE[$(this).val()];
                    if (code_syntax !== MODEL_RENDER_TYPE[0]) model_query_syntax.val(code_syntax).trigger('change');
                    init_parameters();
                });
                model_argument_input.on("change", function () {
                    init_parameters();
                });
                init_parameters();
                init_widget();
            }, error: function (resp) {
                init_error(resp);
            }
        });
    } else {
        init_widget();
    }
});

function init_parameters() {
    var model_type = parseInt($("#model-type-input").val());
    if (model_type === 1 || model_type === 2) {
        $('#model-type-1-2').removeClass('hidden');
        $('#model-type-3').addClass('hidden');
    } else if (model_type === 3) {
        $('#model-type-1-2').addClass('hidden');
        $('#model-type-3').removeClass('hidden');
    } else {
        $('#model-type-1-2').addClass('hidden');
        $('#model-type-3').addClass('hidden');
        $('#model-exe-argument').html(message('无法运行此类型的模型。', 'warning'));
        return false;
    }
    var model_argument = $("#model-argument-input").val();
    if (!is_empty(model_argument)) {
        var html = '';
        model_argument = model_argument.split(',');
        for (var i = 0; i < model_argument.length; i++) {
            var arg = model_argument[i];
            html += "<div class='form-group col-md-6'>";
            html += "<div class='input-group'>";
            html += "<span class='input-group-addon'>" + arg + "</span>";
            html += "<input id='model-exe-argument-" + arg + "' class='form-control'/>";
            html += "</div>";
            html += "</div>";
        }
    } else {
        html = '<div class="col-md-12">' + message("没有提供参数。", 'info') + '</div>';
    }
    $('#model-exe-argument').html(html);
}

function model_input() {
    return {
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
    };
}

function model_parameters() {
    var model_type = parseInt($("#model-type-input").val());
    var model_args = $("#model-argument-input").val();
    if (model_type === 1 || model_type === 2) {
        var arguments = "";
        if (!is_empty(model_args)) {
            model_args = model_args.split(',');
            for (var i = 0; i < model_args.length; i++) {
                var arg = model_args[i];
                arguments += arg + " = \"" + $("#model-exe-argument-" + arg).val() + "\"\n";
            }
        }
        return arguments;
    } else {
        return null;
    }
}

function model_modify() {
    dialog_loading();
    var data = model_input();
    var distinct_fields = ['code', 'argument', 'figure_label'];
    var d = {
        id: data['id']
    };
    var field = [];
    var value = [];
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            if (is_empty(model_last_save[i]) || data[i] !== model_last_save[i].toString()) {
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
    api("PUT", API_SERVER + "model/list/", d, {
        success: function (resp) {
            $('#model-last-update').html('最后保存：' + convert_django_time(resp['t']));
            bootbox.hideAll();
        }, error: function (resp) {
            dialog_error("模型保存失败", resp);
        }
    });
}

function model_exec() {
    var result_panel = $('#model-exe-result');
    result_panel.parent().removeClass('hidden');
    result_panel.html(message('模型运行中，请耐心等候...', 'loading'));
    model_modify();
    var id = $("#model-id-input").val();
    var data = {
        model: id,
        conf: model_parameters()
    };
    var type = parseInt($("#model-type-input").val());
    if (type === 1 || type === 2) {
        data['data'] = $("#model-exe-src").val();
    } else if (type === 3) {
        data['runtime'] = $("#model-exe-rte").val();
    }
    api("POST", API_SERVER + "model/exec/", data, {
        success: function (resp) {
            resp["conf"] = replace_empty(resp["conf"], null);
            var html = is_empty(resp["conf"]) ? message("没有提供参数。", 'info') : "<pre>" + resp["conf"] + "</pre>";
            html += "<hr/><div id='figure-" + resp['id'] + "'>" + message() + "</div>";
            result_panel.html(html);
            render_figure(resp, parseInt($("#model-figure-type-input").val()), $("#model-figure-label-input").val());
        }, error: function (resp) {
            result_panel.html(message('模型运行失败！', 'error'));
            dialog_error("模型运行失败", resp);
        }
    });
}


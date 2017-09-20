var models = [];

$(document).ready(function () {
    check_login();
    $("#menu-analysis").addClass("active open");
    $("#menu-analysis>a>.arrow").addClass("open");
    $("#menu-analysis>a").append("<span class='selected'></span>");
    $("#menu-analysis-result").addClass("active");
    api("GET", API_SERVER + "model/list/", null, {
        success: function (data) {
            models = data;
            var id = url_parameter("id");
            for (var i = 0; i < models.length; i++) {
                var html = "<option value='" + models[i]["id"] + "' ";
                if (!is_empty(id) && id === models[i]["id"]) html += "selected";
                html += ">" + models[i]["name"] + "</option>";
                $("#model-list").append(html);
            }
            init_widget();
            if (!is_empty(id)) load_table();
        }, error: function (resp) {
            show_dialog("error", "模型列表加载失败", "<pre>" + JSON.stringify(resp, null, 2) + "</pre>", function () {
                location.reload();
            });
        }
    });
});

function load_table() {
    console.log($("#model-list").val());
    var model = models[models.locateByKeyValue("id", $("#model-list").val())];
    api("GET", API_SERVER + "model/history/", {
        model: model["id"]
    }, {
        success: function (data) {
            var html = "<table id='table-result' class='table table-hover table-condensed'>";
            html += "<thead><tr><th>ID</th><th>运行账户</th><th>运行时间</th></tr></thead><tbody>";
            for (var i = 0; i < data.length; i++) {
                var history = data[i];
                var labels = "";
                if (!is_empty(model["figure_label"])) {
                    labels = "'" + model["figure_label"].join("','") + "'";
                }
                html += "<tr class='hand' onclick=\"show_result(" + history["id"] + "," + model["type"] + "," + model["figure"] + ",[" + labels + "]);\">";
                html += "<td>" + history["id"] + "</td>";
                html += "<td>" + history["account"] + "</td>";
                html += "<td>" + convert_django_time(history["t"]) + "</td>";
                html += "</tr>";
            }
            html += "</tbody></table>";
            $("#table-result-div").html(html);
            $("#table-result").DataTable(DT_CONF_LITE);
            init_widget("#table-result-div");
        }, error: function (resp) {
            show_dialog("error", "分析结果加载失败", "<pre>" + JSON.stringify(resp, null, 2) + "</pre>", function () {
                location.reload();
            });
        }
    });
    // var html = "<table id='table-result' class='table table-hover table-condensed'>";
    // html += "<thead><tr><th>ID</th><th>运行账户</th><th>运行时间</th></tr></thead><tbody>";
    // html += "</tbody></table>";
    // $("#table-result-div").html(html);
    // var table_result = $("#table-result").DataTable({
    //     processing: true,
    //     serverSide: true,
    //     stateSave: true,
    //     deferRender: true,
    //     searching: false,
    //     columns: [{
    //         data: "id",
    //         name: "id"
    //     }, {
    //         data: "account",
    //         name: "account"
    //     }, {
    //         data: "t",
    //         name: "t",
    //         render: function (data) {
    //             return convert_django_time(data);
    //         }
    //     }],
    //     language: DT_LANG,
    //     ajax: {
    //         url: API_SERVER + "data/history/",
    //         type: "POST",
    //         data: {report: report["id"]}
    //     }
    // });
    // $("#table-result tbody").addClass("hand");
    // $("#table-result tbody").on("click", "tr", function () {
    //     show_result(table_result.row(this).data()["id"], report["type"], report["figure"], report["figure_label"]);
    // });
}

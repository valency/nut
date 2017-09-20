var API_SERVER = "/api/deepfox/";
var IMG_SERVER = "/api/img/";
var ADMIN_SERVER = '/deepfox/';
var ALLUXIO_SERVER = '/api/nut/alluxio/';

var DT_LANG = {
    "sProcessing": "处理中...",
    "sLengthMenu": "显示 _MENU_ 项结果",
    "sZeroRecords": "没有匹配结果",
    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
    "sInfoPostFix": "",
    "sSearch": "搜索:",
    "sUrl": "",
    "sEmptyTable": "表中数据为空",
    "sLoadingRecords": "载入中...",
    "sInfoThousands": ",",
    "oPaginate": {
        "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
    },
    "oAria": {
        "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
    }
};

var DT_CONF_LITE = {
    language: DT_LANG
};

var DT_CONF_AJAX = {
    language: DT_LANG,
    searching: false,
    processing: true,
    serverSide: true
};

var SRC_ENGINES = {
    // 0: "Not Specified",
    // 1: "Hive",
    // 2: "SQLite",
    // 3: "MySQL",
    4: "PostgreSQL"
};

var EMPTY_LABEL = "<span class='badge badge-default'>N/A</span>";
var MODEL_TYPE = ["N/A", "SQL", "Python", "自定义"];
var MODEL_FIGURE = ["无", "表格", "饼状图", "柱状图", "曲线图"];
var MODEL_RENDER_TYPE = ["plain_text", "sql", "python", "plain_text"];
var PROJECT_COLOR = ["red", "green", "blue", "yellow", "purple"];
var CONTENT_ARGS_TYPE = ["无", "下拉选择框", "输入框", "选择开关", "确认按钮"];
var REPORT_CONTENT_TYPE = ["纯文字", "HTML 代码", "图表", "参数表"];
// var CONTENT_ARGS_TYPE_ICON = ["cog", "list", "pencil-square-o", "check-square-o", "youtube-play"];
// var USER_GROUP = ["普通用户", "管理员", "开发人员"];

// # Configuration notes:
//     # 0: Should be null
//     # 1: html: string
//     #    css: string
//     #    script: string
//     # 2: Should follow the configuration of src field (could be string rather than json)
// # 3: label: string
//     #    type: int chosen from: 0 (N/A), 1 (select), 2 (input), 3 (checkbox), 4 (confirm button)
// #    key: string
//     #    value: json formatted as: type 0: null; type 1: [{key, value},...]; type 2: string (placeholder); type 3: null; type 4: null

if (typeof moment !== 'undefined') moment.locale("zh-cn");

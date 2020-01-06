var API_SERVER = "/api/deepfox/";
var IMG_SERVER = "/api/img/";
var ADMIN_SERVER = 'http://avatarsys.org/deepfox/';
var ALLUXIO_SERVER = '/api/nut/alluxio/';
var SPARK_SERVER = '/api/nut/spark/';
var YARN_SERVER = '/api/nut/yarn/';

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
    4: "PostgreSQL"
};

var EMPTY_LABEL = "<span class='badge badge-default'>N/A</span>";
var MODEL_TYPE = ["N/A", "SQL", "Python", "自定义"];
var MODEL_FIGURE = ["无", "表格", "饼状图", "柱状图", "曲线图"];
var MODEL_RENDER_TYPE = ["plain_text", "sql", "python", "plain_text"];

if (typeof moment !== 'undefined') moment.locale("zh-cn");

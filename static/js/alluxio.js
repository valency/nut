var path = null;

$(document).ready(function () {
    check_login();
    $("#navbar-alluxio").addClass("active");
    path = decodeURIComponent(url_parameter('path'));
    var u = 'browser';
    if (is_empty(path)) {
        path = '/';
        u = 'alluxio';
    }
    $('#' + u + '-panels').addClass('active in');
    $('#' + u + '-li').addClass('active');
    $.get(ALLUXIO_SERVER + 'home', function (resp) {
        $(resp).find('.accordion-group').each(function () {
            var p = $(this);
            p.find('.bar').removeClass('bar').addClass('progress-bar');
            p.find('.bar-success').removeClass('bar-success').addClass('progress-bar-success');
            p.find('.bar-danger').removeClass('bar-danger').addClass('progress-bar-danger');
            var html = '<div class="panel panel-primary">';
            html += '<div class="panel-heading">';
            html += '<h3 class="panel-title">' + p.find('h4').html() + '</h3>';
            html += '</div>';
            html += '<div class="panel-body">';
            var q = p.find('.accordion-inner');
            q.find('tbody tr').each(function () {
                $(this).find('th:last').css('font-weight', 'normal');
            });
            q.find('.table-hover').removeClass('table-hover table-condensed').find('tbody th').each(function () {
                $(this).css('font-weight', 'normal');
            });
            html += q.html();
            html += '</div>';
            html += '</div>';
            $('#alluxio-panels').append(html);
        });
        if (!is_empty($('#browser-panels').html())) init_widget();
    });
    $.get(ALLUXIO_SERVER + 'browse?path=' + path + '&offset=0', function (resp) {
        try {
            var count = /nTotalFile = (\d+)/g.exec(resp)[1];
        } catch (exp) {
            count = 1;
        }
        $.get(ALLUXIO_SERVER + 'browse?path=' + path + '&offset=0&limit=' + count, function (resp) {
            var p = $(resp).find('.file-content');
            if (p.length > 0) {
                var q = p.prev();
                var html = '<div class="panel panel-primary">';
                html += '<div class="panel-heading">';
                html += '<h3 class="panel-title">' + q.html() + '</h3>';
                html += '</div>';
                html += '<div class="panel-body"><p>';
                html += p.html();
                html += '</p></div>';
                html += '</div>';
            } else {
                p = $(resp).find('table');
                p.find('tbody th a').each(function () {
                    $(this).attr('href', $(this).attr('href').replace('./browse', 'alluxio'));
                });
                html = p.prop('outerHTML');
            }
            $('#browser-panels').append(html);
            if (!is_empty($('#alluxio-panels').html())) init_widget();
        });
    });
});
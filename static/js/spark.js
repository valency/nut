$(document).ready(function () {
    check_login();
    $("#navbar-yarn").addClass("active");
    $.get(SPARK_SERVER, function (resp) {
        $(resp).find('.row-fluid').each(function () {
            var p = $(this);
            var html = '<div class="panel panel-primary">';
            html += '<div class="panel-heading">';
            html += '<h3 class="panel-title">';
            var q = p.find('h4');
            if (!q.length) {
                q = p.find('h3');
                q.find('img').remove();
            }
            if (!q.length) {
                $('#spark-panels .panel-body').html(p.html());
                return null;
            }
            html += q.html();
            html += '</h3>';
            html += '</div>';
            html += '<div class="panel-body">';
            q = p.find('table');
            html += q.prop('outerHTML');
            html += '</div>';
            html += '</div>';
            $('#spark-panels').append(html);
        });
        if (!is_empty($('#yarn-panels').html())) init_widget();
    });
    $.get(YARN_SERVER + 'cluster/nodes', function (resp) {
        $(resp).find('table').each(function () {
            var p = $(this);
            p.addClass('table');
            p.find('br').remove();
            var html = '<div class="panel panel-primary">';
            html += '<div class="panel-heading">';
            html += '<h3 class="panel-title">';
            if (p.attr('id') === 'nodes') html += 'Nodes';
            else html += p.prev().html();
            html += '</h3>';
            html += '</div>';
            html += '<div class="panel-body">';
            html += p.prop('outerHTML');
            html += '</div>';
            html += '</div>';
            $('#yarn-panels').append(html);
        });
        if (!is_empty($('#spark-panels').html())) init_widget();
    });
});
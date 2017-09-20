$(document).ready(function () {
    check_login();
    $("#navbar-alluxio").addClass("active");
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
        init_widget();
    });
});
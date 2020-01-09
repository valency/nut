var path = null;

$(document).ready(function () {
    check_login();
    $("#navbar-alluxio").addClass("active");
    $('#alluxio-container').attr('src', ALLUXIO_SERVER);
    $('#alluxio-container').css('height', $('.page-content').height() - $('.navbar').height() - $('.footer').height());
    init_widget();
});
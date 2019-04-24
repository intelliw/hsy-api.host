$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });
});

$(".select-list a").click(function () {
    var selText = $(this).text();
    $(this).parents('.select-parent').find('.select-value').html(selText);
});

$("#btnDone").click(function () {
    let apiUrl = "http://api.endpoints.sundaya.cloud.goog" 
        + "/energy/" + $("#navEnergy").html() 
        + "/period/" + $("#navPeriod").html()
        + "/" + $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html()
        + "/" + $("#navDuration").html()

    window.location = apiUrl;
    //alert(apiUrl);
});


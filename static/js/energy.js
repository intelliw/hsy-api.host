
// activate tooltips
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });
});

// put the selected item into the 'select-value' control (without child element's text);
$(".select-justtext a").click(function () {
    var selText = $(this).justtext();
    $(this).parents('.select-parent').find('.select-value').html(selText);
});

// put the selected child element into the 'select-value' control;
$(".select-text a").click(function () {
    var selText = $(this).text();
    $(this).parents('.select-parent').find('.select-value').html(selText);
});

// 'done' button  click 
$("#btnDone").click(function () {
    let apiUrl = "http://api.endpoints.sundaya.cloud.goog"
        + "/energy/" + $("#navEnergy").html()
        + "/period/" + $("#navPeriod").html()
        + "/" + $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html()
        + "T" + $("#navEpochHour").html() + $("#navEpochMinute").html()
        + "/" + $("#navDuration").html()

    // alert(apiUrl);
    window.location = apiUrl;

});

// 'today' button  click 
$("#btnToday").click(function () {
    let apiUrl = "http://api.endpoints.sundaya.cloud.goog"
        + "/energy/" + $("#navEnergy").html()
        + "/period/" + $("#navPeriod").html()
    // alert(apiUrl);
    window.location = apiUrl;
});

$("#btnAPI").click(function () {
    if ($("#btnHamburger").is(":visible")) {
        $("#navbarMain").collapse('show');
    }
});

$("#btnHamburger").click(function () {
    $("#navbarAPI").collapse('show');
});


/** 
 * functions
 */
// get just the text without child element's text  
jQuery.fn.justtext = function () {
    return $(this)
        .clone()
        .children()
        .remove()
        .end()
        .text();
};


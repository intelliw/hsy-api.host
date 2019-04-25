
// activate tooltips
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });
});

// put the selected 'select-list' item into the 'select-value' control;
$(".select-list a").click(function () {
    var selText = $(this).justtext();
    $(this).parents('.select-parent').find('.select-value').html(selText);
});

// click event for 'done' button   
$("#btnDone").click(function () {
    let apiUrl = "http://api.endpoints.sundaya.cloud.goog" 
        + "/energy/" + $("#navEnergy").html() 
        + "/period/" + $("#navPeriod").html()
        + "/" + $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html() 
        + "T" + $("#navEpochHour").html() + $("#navEpochMinute").html()
        + "/" + $("#navDuration").html()

    //window.location = apiUrl;
    alert(apiUrl);
});

/** 
 * functions
 */
// get just the text without child element's text  
jQuery.fn.justtext = function() {
    let txt = $(this)	
            .clone()
			.children()
			.remove()
			.end()
            .text();
    
    // if no text get text by the default method (e.g if <a> has no text and contains a badge with text)
    return jQuery.trim(txt) ? txt : $(this).text();
};


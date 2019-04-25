
// activate tooltips
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });
});

// display the selected 'select-list' item in the 'select-value' control;
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
// get just the text without child element text  
jQuery.fn.justtext = function() {
  
	return $(this)	.clone()
			.children()
			.remove()
			.end()
			.text();

};


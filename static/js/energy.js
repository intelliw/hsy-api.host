

$(document).ready(function () {

    // activate bs tooltips
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });

    // put the selected item into the 'select-value' control (without child element's text);
    $(".select-justtext a").click(function () {
        var selText = $(this).justtext();
        $(this).parents('.select-parent').find('.select-value').html(selText);
    });

    // put the selected navbar child element into the 'select-value' control;
    $(".select-text a").click(function () {
        var selText = $(this).text();
        $(this).parents('.select-parent').find('.select-value').html(selText);
    });

    // toggle the child/grandchild card 
    $(".select-toggle-grandchild").click(function () {
        let isActive = $(this).find('.btn-toggle').hasClass('active');

        let ch = $(this).parents('.card').find('.panel-child');
        let gch = $(this).parents('.card').find('.panel-grandchild');

        (isActive ? gch : ch).collapse('hide');  // (isActive ? gch : ch).hide();
        (isActive ? ch : gch).collapse('show');  // (isActive ? ch : gch).show();
    });

    // toggle the panel for each collection 
    $(".select-toggle-collection").click(function () {
        let panel = $(this).parents('.card').find('.select-collection-panel');
        let isActive = panel.hasClass('show');

        panel.collapse(isActive ? 'hide' : 'show');  
    });

    // reset the filter buttons
    $(".select-filter-reset").click(function () {

        let resetState;
        
        $(this).parents('.card-body').find('.select-filter-btn').each(function() {
            
            isActive = $(this).hasClass('active');
            resetState = resetState == undefined ? !isActive : resetState;      // decide resetState for all buttons from the state fo the first button 
                
            if (!resetState == isActive) {
                isActive ? $(this).removeClass("active") : $(this).addClass("active");
            }
            
        });

    });


    // 'done' button calls the API. Strip colon and space from the hour with regex
    $("#btnDone").click(function () {
        let apiUrl = "http://api.endpoints.sundaya.cloud.goog"
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "/" + $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html()
            + "T" + $("#navEpochHour").html().replace(/\s: /g, '')
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


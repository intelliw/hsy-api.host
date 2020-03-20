
$(document).ready(function () {

    // activate bs tooltips
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });

    // navbar dropdown ITEM click
    $(".select-justtext a").click(function () {

        // put the selected item into the 'select-value' control (without child element's text);
        let selText = $(this).justtext();
        $(this).parents('.select-parent').find('.select-value').html(selText);

    });

    // navbar dropdown SELECT click
    $(".select-parent").click(function () {

        // select the active item    
        let selText = $(this).find('.select-value').justtext();

        $(this).find('.dropdown-item').each(function () {

            let badge = $(this).find('.badge');
            let item = badge.text() ? badge : $(this);

            let isActive = $(this).justtext() == selText;
            isActive ? item.addClass("active") : item.removeClass("active");

        });

    });


    // navbar energy dropdown item click
    $(".select-text a").click(function () {

        // put the selected navbar child element into the 'select-value' control;
        var selText = $(this).text();
        $(this).parents('.select-parent').find('.select-value').html(selText);

    });

    // child / grandchild button toggle 
    $(".select-toggle-grandchild").click(function () {

        // toggle the child / grandchild card visiblity 
        let toggleOn = $(this).find('.btn-toggle').hasClass('active');

        let card = $(this).parents('.card')
        let ch = card.find('.panel-child');
        let gch = card.find('.panel-grandchild');

        (toggleOn ? gch : ch).collapse('hide');
        (toggleOn ? ch : gch).collapse('show');

        // toggle the child / grandchild name header visibility
        let chLbl = card.find('.name-toggle-child');
        let gchLbl = card.find('.name-toggle-grandchild');

        (toggleOn ? gchLbl : chLbl).hide();
        (toggleOn ? chLbl : gchLbl).show();

    });

    // collection panel click
    $(".select-toggle-collection").click(function () {

        // toggle the panel for each collection 
        let panel = $(this).parents('.card').find('.select-collection-panel');
        let isActive = panel.hasClass('show');

        panel.collapse(isActive ? 'hide' : 'show');
    });

    //  filter buttons reset 
    $(".select-filter-reset").click(function () {

        let resetState;

        $(this).parents('.card-body').find('.select-filter-btn').each(function () {

            isActive = $(this).hasClass('active');
            resetState = resetState == undefined ? !isActive : resetState;      // decide resetState for all buttons from the state fo the first button 

            if (!resetState == isActive) {
                isActive ? $(this).removeClass("active") : $(this).addClass("active");
            }

        });
        
    });
    //  filter buttons panel visibility
    $(".select-filter-visibility").click(function () {

        let panel = $(this).parents('.card-body').find('.select-filter-btn-panel'); 
        panel.collapse('toggle');
    });

    // 'done' button click - calls the API. Strip colon and space from the hour with regex
    $("#btnDone").click(function () {
        let apiUrl = API_BASE_URL
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "/" + $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html()
            + "T" + $("#navEpochHour").html().replace(/\s: /g, '')
            + "/" + $("#navDuration").html()
            + "?site=" + $("#navSite").html()

        // alert(apiUrl);
        window.location.href = apiUrl;
    });

    // 'today' button click 
    $("#btnToday").click(function () {

        let apiUrl = API_BASE_URL
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "?site=" + $("#navSite").html()
        // alert(apiUrl);
        window.location.href = apiUrl;
    });

    // TEMP / TEST -----------------------------------------------------
    $(".dropdown-item").click(function () {
        // alert($(this).text());

        ("#childChartWrapper_1").setView({
            columns: [0, 3, 4, 6]
        });
        ("#childChartWrapper_1").draw(document.getElementById('childChartDiv_1'));
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


$(document).ready(function () {

    // activate bs tooltips
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });

    // navbar API unbadged (justtext) dropdown item click
    $(".select-justtext a").click(function () {

        // put the selected item into the 'select-value' control (without child element's text);
        let selText = $(this).justtext();
        $(this).parents('.select-parent').find('.select-value').html(selText);

    });

    // navbar API badged (text) dropdown item click
    $(".select-text a").click(function () {

        // put the selected navbar child element into the 'select-value' control;
        var selText = $(this).text();

        $(this).parents('.select-parent').find('.select-value').html(selText);  

    });
    
    // navbar API parent click, flags the ACTIVE dropdown item 
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

    // child / grandchild toggle button click 
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

        card.find('.select-collection-panel').collapse('show'); // always make visible

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
    //  filter buttons visibility
    $(".select-filter-visibility").click(function () {

        let panel = $(this).parents('.card').find('.select-filter-btn-panel');
        let reset = $(this).parents('.card').find('.select-filter-reset');

        wasActive = panel.hasClass('show');

        wasActive ? reset.hide() : reset.show();
        panel.collapse(wasActive ? 'hide' : 'show');

    });

    // navbar API 'done' button click - calls the API... Strip colon and space from the hour with regex
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

    // navbar API 'today' item click 
    $("#btnToday").click(function () {

        let apiUrl = API_BASE_URL
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "?site=" + $("#navSite").html()
        // alert(apiUrl);
        window.location.href = apiUrl;
    });
    
    // title period badge click - cpllapse all panes
    $("#titlePeriod").click(function () {
        
        $('.accordion').find('.card').find('.select-collection-panel').each(function () {
            let isOpen = $(this).hasClass('show');
            if (isOpen) $(this).removeClass("show");
        });
    });

    // hide / show the title period badge 
    $('#navbarAPI').on('show.bs.collapse', function () {
        $('#titlePeriod').hide();
    });
    $('#navbarAPI').on('hide.bs.collapse', function () {
        $('#titlePeriod').show();
    });


    // TEMP / TEST -----------------------------------------------------
    $(".testButton").click(function () {
        // alert($(this).text());
        
        //chart_1.setSelection([{"row":2,"column":1}]);
        // chart_1.setSelection([{"column":1}]);
        //("#childChartWrapper_1").setView({
        //    columns: [0, 3, 4, 6]
        //});
        //("#childChartWrapper_1").draw(document.getElementById('childChartDiv_1'));
        
        // /*
        let btnId = $(this).justtext().trim();
        //alert(btnId);
        if (btnId == 'Store') {
            // childChart_1.setSelection();
            
            alert(getAggregationOption());

        } else if (btnId == 'Enjoy') {
            //alert(getFilterValues(0, 'child'));
            //let x = $('.accordion').find('.card').find('.select-collection-panel')[panelIndex].text
            //let x = $('.accordion').find('.card').find('.card-body, panel-grandchild').attr('class');
            //let x = $('.accordion').find('.card').eq(0).find('.panel-grandchild').find('.btn-block').eq(2);
            //let y = x.find('.btn').hasClass('active');
            //let y = x.find('.btn').hasClass('active');
            alert(getFilterValues(2, 'grandchild'));

            //grandchildChart_1.setSelection();
            //selected = childChart_1.getSelection();
            //{"row":0,"column":5}
            /*
            childChart_1.setSelection([
                {"row":0,"column":5},
                {"row":1,"column":5},
                {"row":2,"column":5},
                {"row":3,"column":5},
                {"row":4,"column":5},
                {"row":5,"column":5},
            ]);
            */
        }
        // */
    });

});


/** 
 * functions
 */

// returns whether sum or avg has been selected
function getAggregationOption() {

    let isAvg = $('body').find('#btnSumAvg').hasClass('active');
    return (isAvg ? 'Avg' : 'Sum');

}

// returns an array of selected filter button indexes for the panel and pane (child / grandchild)
function getFilterValues(panelIndex, pane) {
    // each button index represents the datatable value which is to be displayed 
    
    let filterVals = [];
    let btnNdx = 0;
    let paneClassName = (pane == 'child' ?  'panel-child' : 'panel-grandchild');

    $('.accordion').find('.card').eq(panelIndex).find('.' + paneClassName).find('.btn-block').each (function () {
        if ($(this).find('.btn').hasClass('active')) {
            filterVals.push(btnNdx);
        }
        ++btnNdx;
    });
    return filterVals;
}

// just get the text without child element's text  
jQuery.fn.justtext = function () {
    return $(this)
        .clone()
        .children()
        .remove()
        .end()
        .text();
};

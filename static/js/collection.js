
$(document).ready(function () {

    // activate bs tooltips
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });




    // navbar dropdown item click       ...justtext without badges
    $(".select-justtext a").click(function () {

        // put the selected item into the 'select-value' control (without child element's text);
        let selText = $(this).justtext();
        $(this).parents('.select-parent').find('.select-value').html(selText);

    });

    // navbar dropdown item click       ...badges
    $(".select-text a").click(function () {

        // put the selected navbar child element into the 'select-value' control;
        var selText = $(this).text();

        $(this).parents('.select-parent').find('.select-value').html(selText);

    });

    // navbar parent click              ...selects the ACTIVE dropdown item before showing the list
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

    // navbar 'done' button click   ...calls the API... Strip colon and space from the hour with regex
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

    // navbar 'today' item click 
    $("#btnToday").click(function () {

        let apiUrl = API_BASE_URL
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "?site=" + $("#navSite").html()
        // alert(apiUrl);
        window.location.href = apiUrl;
    });

    // navbar title period click - copllapses all panes
    $("#titlePeriod").click(function () {

        $('.accordion').find('.card').find('.select-collection-panel').each(function () {
            let isOpen = $(this).hasClass('show');
            if (isOpen) $(this).removeClass("show");
        });
    });

    // navbar show             ...shows the title period badge 
    $('#navbarAPI').on('show.bs.collapse', function () {
        $('#titlePeriod').hide();
    });
    $('#navbarAPI').on('hide.bs.collapse', function () {
        $('#titlePeriod').show();
    });





    // collection panel header click
    $(".select-toggle-collection").click(function () {

        // toggle the panel for each collection 
        let panel = $(this).parents('.card').find('.select-collection-panel');
        let isActive = panel.hasClass('show');

        panel.collapse(isActive ? 'hide' : 'show');
    });

    // collection panel shown           ...calls reDrawPanels
    $('.select-collection-panel').on('shown.bs.collapse', function () {

        reDrawPanels();

    });

    // child / grandchild pane toggle button click 
    $(".select-toggle-grandchild").click(function () {

        // toggle the child / grandchild card visiblity 
        let toggleOn = $(this).find('.btn-toggle').hasClass('active');

        let card = $(this).parents('.card')
        let ch = card.find('.pane-child');
        let gch = card.find('.pane-grandchild');

        (toggleOn ? gch : ch).collapse('hide');
        (toggleOn ? ch : gch).collapse('show');

        // toggle the child / grandchild name header visibility
        let chLbl = card.find('.name-toggle-child');
        let gchLbl = card.find('.name-toggle-grandchild');

        (toggleOn ? gchLbl : chLbl).hide();
        (toggleOn ? chLbl : gchLbl).show();

        card.find('.select-collection-panel').collapse('show');    // make charts visible when toggling

    });

    // filter button click              ...calls reDrawPanels
    $('.select-filter-btn').click(function () {

        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        let panel = $(this).parents('.select-collection-panel');
        if (!panel.hasClass('redraw')) panel.addClass('redraw');
        
        reDrawPanels();

    });

    // filter buttons reset click       ...calls reDrawPanels
    $(".select-filter-reset").click(function () {

        let resetState;
        
        $(this).parents('.card-body').find('.select-filter-btn').each(function () {

            isActive = $(this).hasClass('active');
            resetState = (resetState == undefined) ? !isActive : resetState;      // decide resetState for all buttons from the state fo the first button 

            if (!resetState == isActive) {
                isActive ? $(this).removeClass("active") : $(this).addClass("active");
            }

        });
        
        let panel = $(this).parents('.select-collection-panel');
        if (!panel.hasClass('redraw')) panel.addClass('redraw');

        reDrawPanels();

    });

    // filter buttons visibility click      ... calls reDrawPanels (needed only for fitler reset hide)
    $(".select-filter-visibility").click(function () {

        let btnPanel = $(this).parents('.card').find('.select-filter-btn-panel');

        let wasActive = btnPanel.hasClass('show');

        btnPanel.collapse(wasActive ? 'hide' : 'show');
        
        reDrawPanels();

    });

    // sum/avg button click             ...calls reDrawPanels
    $('#btnSumAvg').click(function () {

        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        $('.accordion').find('.card').find('.select-collection-panel').each(function () {

            if (!$(this).hasClass('redraw')) {
                $(this).addClass('redraw');
            }
        });

        reDrawPanels();
    });


});


/** 
 * functions
 */
// redraws flagged panels and hides the filter reset button 
function reDrawPanels() {

    let sumAvg = getGroupOption();

    $('.accordion').find('.card').find('.select-collection-panel').each(function () {

        let panelIndex = $(this).attr('index');
        if ($(this).hasClass('show')) {

            let childPane = $(this).find('.pane-child');
            let grandchildPane = $(this).find('.pane-grandchild');

            // redraw charts ----
            if ($(this).hasClass('redraw')) {

                let childFilterVals = getFilterShowButtons(childPane);
                let grandchildFilterVals = getFilterShowButtons(grandchildPane);

                // 2DO call dreawChart and.. let chartObj = collection_panels['chart_' + panelIndex]
                //redrawChart(panelIndex);

                $(this).removeClass('redraw');      // clear the 'redraw' flag 

            };

            // hide filter reset button ---- if filter btn panel hidden and no filters active 
            let activePane = (childPane.hasClass('show') ? childPane : grandchildPane);
            let btnPanelVisible = $(this).find('.select-filter-btn-panel').hasClass('show');

            $(this).find('.select-filter-reset').collapse(isFiltered(activePane) || btnPanelVisible ? 'show' : 'hide');
        }

    });

    // let debugStr = [];
    //debugStr.push('panel ' + panelIndex + ' ' + sumAvg + ' , filters ' + childFilterVals + ' | ' + grandchildFilterVals + ' |');
    // if (debugStr.length > 0) alert(debugStr);

}
 
// returns whether sum or avg has been selected
function getGroupOption() {

    let isAvg = $('body').find('#btnSumAvg').hasClass('active');
    return (isAvg ? 'Avg' : 'Sum');

}

// returns an array of unselected ('show') filter button indexes for the (child/grandchild) pane 
function getFilterShowButtons(pane) {
    
    let showButtons = [];
    let btnNdx = 0;

    pane.find('.btn-block').each(function () {
        if ($(this).find('.btn').hasClass('active')) {
            showButtons.push(btnNdx);
        }
        ++btnNdx;
    });
    return showButtons;
}

// returns true if at least one filter is unselected ('hide') and *all* filters are NOT unselected ('hide') as this is also taken to mean that there is no filter active
function isFiltered(pane) {
    
    let totalButtons = 0; 
    let showButtons = 0;

    pane.find('.btn-block').each(function () {
        if ($(this).find('.btn').hasClass('active')) {          // 'hide' has been selected
            ++showButtons;  
        }
        ++totalButtons;
    });
    
    return (showButtons < totalButtons) && (showButtons > 0);
    
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


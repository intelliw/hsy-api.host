
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

    // navbar title period click - collapses all panes
    $("#titlePeriod").click(function () {

        $('.accordion').find('.card').find('.select-collection-panel').each(function () {
            if ($(this).hasClass('show')) $(this).removeClass("show");
        });
    });

    // navbar show                          ...shows the title period badge 
    $('#navbarAPI').on('show.bs.collapse', function () {
        $('#titlePeriod').hide();
    });
    $('#navbarAPI').on('hide.bs.collapse', function () {
        $('#titlePeriod').show();
    });





    // collection panel header click
    $(".select-toggle-collection").click(function () {

        // toggle collection panel visibility 
        let panel = $(this).parents('.card').find('.select-collection-panel');
        
        panel.collapse(panel.hasClass('show') ? 'hide' : 'show');

    });

    // collection panel after shown           ...calls redrawPanels
    $('.select-collection-panel').on('shown.bs.collapse', function () {

        redrawPanels();

    });

    // child / grandchild pane toggle button click 
    $(".select-toggle-grandchild").click(function () {

        let toggleOn = $(this).find('.btn-toggle').hasClass('active');

        // toggle card visiblity 
        let card = $(this).parents('.card')
        let ch = card.find('.pane-child');
        let gch = card.find('.pane-grandchild');

        (toggleOn ? gch : ch).collapse('hide');
        (toggleOn ? ch : gch).collapse('show');

        // toggle name header visibility
        let chLbl = card.find('.name-toggle-child');
        let gchLbl = card.find('.name-toggle-grandchild');

        (toggleOn ? gchLbl : chLbl).hide();
        (toggleOn ? chLbl : gchLbl).show();

        card.find('.select-collection-panel').collapse('show');    // make panel visible when toggling

    });
    
    // child/grandchil pane after shown
    $('.pane-child, .pane-grandchild').on('shown.bs.collapse', function () {
        
         revealFilterResetButtons($(this));     

    });

    // filter button click              ...calls redrawPanels
    $('.select-filter-btn').click(function () {

        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        let panel = $(this).parents('.select-collection-panel');
        if (!panel.hasClass('redraw')) panel.addClass('redraw');

        redrawPanels();

    });

    // filter buttons reset click       ...calls redrawPanels
    $(".select-filter-reset").click(function () {

        let resetState;
        
        $(this).parents('.card-body').find('.select-filter-btn').each(function () {

            isActive = $(this).hasClass('active');
            resetState = (resetState == undefined) ? !isActive : resetState;      // decide resetState for all buttons from the state of the first button 

            if (!resetState == isActive) {
                isActive ? $(this).removeClass("active") : $(this).addClass("active");
            }

        });
        
        $(this).parents('.card').find('.select-filter-btn-panel').collapse('show');    // make buttons visible when resetting

        let panel = $(this).parents('.select-collection-panel');
        if (!panel.hasClass('redraw')) panel.addClass('redraw');

        redrawPanels();

    });

    // filter button panel visibility click      
    $(".select-filter-visibility").click(function () {

        let btnPanel = $(this).parents('.card').find('.select-filter-btn-panel');

        let wasActive = btnPanel.hasClass('show');

        btnPanel.collapse(wasActive ? 'hide' : 'show');

    });
    // filter button panel after shown/hidden
    $('.select-filter-btn-panel').on('shown.bs.collapse hidden.bs.collapse', function () {

        revealFilterResetButtons($(this));     

    });

    // sum/avg button click             ...calls redrawPanels
    $('#btnSumAvg').click(function () {

        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        $('.select-collection-panel').each(function () {

            if (!$(this).hasClass('redraw')) {
                $(this).addClass('redraw');
            }
        });

        redrawPanels();
    });


});


/** 
 * functions -----
 */
// redraws panels flagged with 'redraw' . if source is provide the panel is flagged first  
function redrawPanels(source) {

    if (source) {
        let panel = source.closest('.select-collection-panel');
        if (!resetBtn.hasClass('redraw')) resetBtn.addClass('redraw');
    }

    // redrawPanes - wil redraw any panes which were invisible and flagged for later redraw

    $('.select-collection-panel.show.redraw').each(function () {
    
        redrawActivePane($(this));
        
        setChartTitles($(this));

        $(this).removeClass('redraw');      // clear the 'redraw' flag 

    });

}

//  reveals filter reset buttons flagged with 'reveal'. if source is provide the closest reset button is flagged first  
function revealFilterResetButtons(source) {
        
    if (source) {
        let resetBtn = source.closest('.select-collection-panel').find('.select-filter-reset');
        if (!resetBtn.hasClass('reveal')) resetBtn.addClass('reveal');
    }

    $('.select-filter-reset.reveal').each(function () {
            
        let activePane = getActivePane($(this).closest('.select-collection-panel'));
        let btnsVisible = $(this).closest('.select-filter').find('.select-filter-btn-panel').hasClass('show');

        isFiltered(activePane) || btnsVisible ? $(this).show() : $(this).hide();
        
        $(this).removeClass('reveal');      // clear the 'reveal' flag 
    });

}

// sets the chjart titles
function setChartTitles(panel) {
    
    let sum = getGroupOption() == 'sum';
    
    panel.find('.pane-child').find('.select-chart-title').text((sum ? 'Total' : 'Average') + ' Megajoules (MJ) / ' + childPeriod + (sum ? '' : ' / ' + grandchildPeriod));
    panel.find('.pane-grandchild').find('.select-chart-title').text((sum ? 'Total' : ' Average') + ' Megajoules (MJ) / ' + (sum ? grandchildPeriod : childPeriod));

}


// returns whether sum or avg has been selected
function getGroupOption() {
    const AVERAGE = 'avg';
    const SUM = 'sum';

    let isAvg = $('body').find('#btnSumAvg').hasClass('active');
    return (isAvg ? AVERAGE : SUM);

}

// returns an array of unselected ('show') filter button indexes for the (child/grandchild) pane 
function getActiveFilterButtons(pane) {
    
    let showButtons = [];
    let allButtons = [];

    let btnNdx = 0;

    pane.find('.btn-block').each(function () {
        if ($(this).find('.btn').hasClass('active')) {
            showButtons.push(btnNdx);
        }
        allButtons.push(btnNdx);
        ++btnNdx;
    });

    // 'all hidden' means no filters apply sp return all buttons
    return (showButtons.length > 0 ? showButtons : allButtons) ;
}

// returns true if at least one filter is unselected ('hide') and *all* filters are NOT unselected - as 'all hidden' means no filters apply
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
// returns the active child or grandchild pane for the panel
function getActivePane(panel) {
    childPane = panel.find('.pane-child');
    return (childPane.hasClass('show') ? childPane : panel.find('.pane-grandchild'));
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


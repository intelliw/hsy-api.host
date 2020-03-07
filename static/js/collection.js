
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
        let apiUrl = constructApiUrl(
            API_BASE_URL,
            $("#navEnergy").html(),
            $("#navPeriod").html(),
            $("#navEpochYear").html() + $("#navEpochMonth").html() + $("#navEpochDay").html()
            + "T" + $("#navEpochHour").html().replace(/\s: /g, ''),
            $("#navDuration").html(),
            $("#navSite").html()
        );
        window.location.href = apiUrl;
    });
    
    // adds 1 period to duration
    $("#btnAdd").click(function () {
        let newDuration = parseInt(PARAM_DURATION) + 1;     // add 1 
        let apiUrl = constructApiUrl(API_BASE_URL, PARAM_ENERGY, PARAM_PERIOD, SELF_EPOCH, newDuration, PARAM_SITE);

        window.location.href = apiUrl;
    });

    // suctracts 1 period from duration
    $("#btnSubtract").click(function () {
        let newDuration = parseInt(PARAM_DURATION) - 1;     // subtract 1 
        let apiUrl = constructApiUrl(API_BASE_URL, PARAM_ENERGY, PARAM_PERIOD, SELF_EPOCH, newDuration, PARAM_SITE);

        window.location.href = apiUrl;
    });

    // navbar 'today' item click 
    $("#btnToday").click(function () {

        let apiUrl = API_BASE_URL
            + "/energy/" + $("#navEnergy").html()
            + "/period/" + $("#navPeriod").html()
            + "?site=" + $("#navSite").html();

        window.location.href = apiUrl;
    });

    // navbar title period click - toggles collapse on all panels     ...calls redrawPanels
    $("#titlePeriod").click(function () {

        let collapsedAll; 
        $('.select-collection-panel.show').each(function () {
            $(this).removeClass("show");
            collapsedAll = true;
        });

        if (!collapsedAll) {
            $('.select-collection-panel').each(function () {
                $(this).addClass("show");
                collapsedAll = true;
            });

            redrawPanels();
        }
        
    });

    // navbar show                          ...shows the title period badge 
    $('#navbarAPI').on('show.bs.collapse', function () {
        $('#titlePeriod').hide();
    });
    $('#navbarAPI').on('hide.bs.collapse', function () {
        $('#titlePeriod').show();
    });



    // collection panel header click
    $(".select-toggle-collection").click(function (e) {
        
        // suppress propogated button clicks
        if (!['BUTTON','I', 'SPAN'].includes(e.target.nodeName)) {
            
            // toggle collection panel visibility 
            let panel = $(this).parents('.card').find('.select-collection-panel');
            
            panel.collapse(panel.hasClass('show') ? 'hide' : 'show');
        }
                
    });

    // collection panel after shown           ...calls redrawPanels
    $('.select-collection-panel').on('shown.bs.collapse', function () {

        redrawPanels();

    });

    // child / grandchild pane toggle button click 
    $(".select-toggle-grandchild").click(function () {

        
        // toggle card visiblity 
        let card = $(this).parents('.card')
        let ch = card.find('.pane-child');
        let gch = card.find('.pane-grandchild');

        ch.collapse(ch.hasClass('show') ? 'hide' : 'show');
        gch.collapse(gch.hasClass('show') ? 'hide' : 'show');

        card.find('.select-collection-panel').collapse('show');    // make panel visible when toggling

    });
    
    // child/grandchild pane after shown
    $('.pane-child, .pane-grandchild').on('shown.bs.collapse', function () {
        
         revealFilterResetButtons($(this));     

    });

    // filter button click              ...calls redrawPanels
    $('.period-filter-btn').click(function () {
        
        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        redrawPanels($(this));

    });

    // period filter buttons reset click       ...calls redrawPanels
    $(".period-filter-reset").click(function () {

        let noneActive = true;
        let allActive = true;
        let isActive;

        $(this).closest('.card-body').find('.period-filter-btn').each(function () {
            isActive = $(this).hasClass("active");

            if (isActive) {  noneActive = false; }
            
            allActive = allActive && isActive; 
        });

        $(this).closest('.card-body').find('.period-filter-btn').each(function () {

            if (noneActive || !allActive) {
                if (!$(this).hasClass("active")) { $(this).addClass("active"); }
            } else {
                if ($(this).hasClass("active")) { $(this).removeClass("active"); }
            }
        });


        $(this).parents('.card-body').find('.period-filter-btn-panel').collapse('show');    // make buttons visible when resetting

        redrawPanels($(this));

    });

    // filter button panel visibility click      
    $(".period-filter-visibility").click(function () {

        let wasActive = $(this).closest('.card-body').find('.period-filter-btn-panel').hasClass('show');

        $(this).closest('.select-collection-panel').find('.period-filter-btn-panel').each(function () {
            $(this).collapse(wasActive ? 'hide' : 'show');
        });
        
        $(this).closest('.select-collection-panel').find('.period-filter-title').each(function () {
            $(this).collapse(wasActive ? 'hide' : 'show');
        });
        
    });

    // filter button panel after shown/hidden
    $('.period-filter-btn-panel').on('shown.bs.collapse hidden.bs.collapse', function () {

        revealFilterResetButtons($(this));     

    });

    // sum/avg button click             ...calls redrawPanels
    $('#btnSumAvg').click(function () {

        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        $('.select-collection-panel').each(function () {
            flagPanelForRedraw($(this));
        });

        redrawPanels();
    });

    // hsy (live) filter button click             ...calls redrawPanels
    $('.hsy-filter-btn.live').click(function () {
        
        $(this).hasClass('active') ? $(this).removeClass("active") : $(this).addClass("active");

        $('.select-collection-panel').each(function () {
            flagPanelForRedraw($(this));
        });

        redrawPanels();
    });

    // hsy filter buttons reset click       ...calls redrawPanels
    $(".hsy-filter-reset").click(function () {

        let noneActive = true;
        let allActive = true;
        let isActive;

        $('.hsy-filter-btn.live').each(function () {
            isActive = $(this).hasClass("active");

            if (isActive) {  noneActive = false; }
            
            allActive = allActive && isActive; 
        });

        $('.hsy-filter-btn.live').each(function () {

            if (noneActive || !allActive) {
                if (!$(this).hasClass("active")) { $(this).addClass("active"); }
            } else {
                if ($(this).hasClass("active")) { $(this).removeClass("active"); }
            }
        });


        $('.select-collection-panel').each(function () {
            flagPanelForRedraw($(this));
        });

        redrawPanels($(this));

    });

});


/** 
 * functions -----
 */
// marks the panel with a redraw flag
function flagPanelForRedraw(panel) {

    panel.find('.pane-child, .pane-grandchild').each(function () {
        if (!$(this).hasClass('redraw')) {
            $(this).addClass('redraw');
        }
    });
   
}

// redraws panels flagged with 'redraw' . if source is provide the panel is flagged first  
function redrawPanels(source) {
    
    if (source) {
        
        let panel = source.closest('.select-collection-panel');
        flagPanelForRedraw(panel);
    }

    // redrawPanes - wil redraw any panes visible panes if flagged for redraw and if the panel is open 
    $('.pane-child.show.redraw, .pane-grandchild.show.redraw').each(function () {

        if ($(this).closest('.select-collection-panel').hasClass('show')) {         // check if panel open
            redrawActivePane($(this));
            
            setChartTitles($(this));

            $(this).removeClass('redraw');      // clear the 'redraw' flag 
        }

    });

}

//  reveals filter reset buttons flagged with 'reveal'. if source is provide the closest reset button is flagged first  
function revealFilterResetButtons(source) {

    if (source) {
        let resetBtn = source.hasClass('.card-body') ? source : source.closest('.card-body').find('.period-filter-reset');
        if (!resetBtn.hasClass('reveal')) resetBtn.addClass('reveal');
    }

    $('.period-filter-reset.reveal').each(function () {
            
        let activePane = getActivePane($(this).closest('.select-collection-panel'));
        let btnsVisible = activePane.find('.period-filter-btn-panel').hasClass('show');

        isPeriodFiltered(activePane) || btnsVisible ? $(this).show() : $(this).hide();
        
        $(this).removeClass('reveal');      // clear the 'reveal' flag 
    });

}

// returns constructs a url which can call the API
function constructApiUrl(baseUrl, energy, period, epoch, duration, site) {

    let apiUrl = API_BASE_URL
        + "/energy/" + energy 
        + "/period/" + period
        + "/" + epoch
        + "/" + duration
        + "?site=" + site;

    return apiUrl;
}


// returns whether sum or avg has been selected
function getGroupOption() {
    const AVERAGE = 'avg';
    const SUM = 'sum';

    let isAvg = $('body').find('#btnSumAvg').hasClass('active');
    return (isAvg ? AVERAGE : SUM);

}

// returns an array of unselected ('show') filter button indexes for the (child/grandchild) pane 
function getActivePeriodFilters(pane) {
    
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

    // return filters buttons
    return (showButtons) ;
}

// returns true if at least one period filter is unselected ('hide') 
function isPeriodFiltered(pane) {
    
    let totalButtons = 0; 
    let showButtons = 0;

    pane.find('.period-filter-btn-panel').find('.btn-block').each(function () {
        if ($(this).find('.btn').hasClass('active')) {          // 'hide' 
            ++showButtons;  
        }
        ++totalButtons;
    });
    
    return (showButtons < totalButtons);
    
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


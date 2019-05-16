
$(document).ready(function () {



});


/** 
 * functions
 */
function reDrawCharts() {

    let sumAvg = getGroupOption();
    let debugStr = [];

    $('.accordion').find('.card').find('.select-collection-panel').each(function () {

        if ($(this).hasClass('show') && $(this).hasClass('redraw')) {

            let panelIndex = $(this).attr('index');
            let childFilterVals = getFilterValues(panelIndex, 'child');
            let grandchildFilterVals = getFilterValues(panelIndex, 'grandchild');

            // let chartObj = collection_panels['chart_' + panelIndex]
            debugStr.push('panel ' + panelIndex + ' ' + sumAvg + ' , filters ' + childFilterVals + ' | ' + grandchildFilterVals + ' |');


            // clear the 'redraw' flag 
            $(this).removeClass('redraw');

        };
    });

    // if (debugStr.length > 0) alert(debugStr);

}

// TEMP / TEST -----------------------------------------------------
$(".testButton2").click(function () {
    let btnId = $(this).justtext().trim();
    //alert(btnId);
    if (btnId == 'Store') {
        
    } else if (btnId == 'Enjoy') {

    }
});

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

        alert(getGroupOption());

    } else if (btnId == 'Enjoy') {
        //alert(getFilterValues(0, 'child'));
        //let x = $('.accordion').find('.card').find('.select-collection-panel')[panelIndex].text
        //let x = $('.accordion').find('.card').find('.card-body, panel-grandchild').attr('class');
        //let x = $('.accordion').find('.card').eq(0).find('.panel-grandchild').find('.btn-block').eq(2);
        //let y = x.find('.btn').hasClass('active');
        //let y = x.find('.btn').hasClass('active');
        alert(getFilterValues(0, 'grandchild'));

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
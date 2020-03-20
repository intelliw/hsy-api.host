
// selects corresponding chart column when a table row is selected 
function handleTableSelectEvent(paneObj, numChartColumns) {

    const KEY_COLUMN = 0;
    const SEL_ITEM = 0;

    let col;
    let sel = paneObj.table.getSelection();

    if (sel[SEL_ITEM]) {

        let dataColumn = paneObj.dataTable.getValue(sel[SEL_ITEM].row, KEY_COLUMN);

        let chartSel = [];
        for (let i = 1; i <= numChartColumns; i++) {
            chartSel.push({ row: dataColumn, column: i });
        }
        paneObj.chart.setSelection(chartSel);

    } else {
        paneObj.chart.setSelection();
    }

}

// filter datatable and return a dataview. includeRows is an array of active filter button indexes
function filterDataTable(dt, filterColumn, includeRows, includeColumns) {

    let dataView = new google.visualization.DataView(dt);
    if (includeRows) {
        let filteredRows = dataView.getFilteredRows([{
            column: filterColumn,

            test: function (value, row, column, table) {
                let rowData = includeRows.includes(table.getValue(row, column));
                return rowData;
            }
        }]);

        dataView.setRows(filteredRows);
    }
    dataView.setColumns(includeColumns);

    return dataView;

}

// format datatable in red 
function colorFormatDataTable(dt, storeColIndex, gridColIndex) {
    const COLOR = 'red';

    let formatter = new google.visualization.ColorFormat();
    formatter.addRange(0, null, COLOR, '');
    formatter.format(dt, storeColIndex);

    formatter = new google.visualization.ColorFormat();
    formatter.addRange(null, 0, COLOR, '');
    formatter.format(dt, gridColIndex);
}

// draws a column chart in the div for this panelIndex, pane
function drawColumnChart(dataView, panelIndex, pane, columns) {

    const div = pane + 'ColumnChartDiv_' + panelIndex;          //'childColumnChartDiv_n'

    // Set chart options
    let chartOptions = {
        width: 700,
        height: 400,
        chartArea: { left: 45, top: 30, right: 0, bottom: 15, width: '95%', height: '95%' },
        bar: { groupWidth: '75.0%' },
        isStacked: true,
        selectionMode: 'multiple',
        tooltip: { trigger: 'selection', showColorCode: true },
        aggregationTarget: 'category',
        fontName: 'Open Sans', fontSize: '0.80rem',
        dataOpacity: 0.8,
        legend: { position: 'top', maxLines: 2, alignment: 'center' },
        vAxis: {
            title: 'Megajoules (MJ)',
            textPosition: 'out',
            titleTextStyle: { italic: 'false' },
            gridlines: { count: 10, color: 'none' }, baselineColor: 'black',
            viewWindowMode: 'pretty',
            format: '##.####'
        },
        hAxis: {
            title: '',
            textPosition: 'none',
            textStyle: { fontSize: '0.80rem' },
            gridlines: { color: 'none' }, baselineColor: 'none',
            titleTextStyle: { italic: 'true' }
        },
        axisTitlesPosition: 'none', titlePosition: 'none',
        backgroundColor: { fill: 'none', stroke: 'none', strokeWidth: 4 },
        colors: ['#28a745', '#FF0000', '#007bff', '#007bff', '#000000', '#000000']
    };

    let chartView = new google.visualization.DataView(dataView);
    chartView.setColumns(columns);

    let chart = new google.visualization.ColumnChart(document.getElementById(div));
    chart.draw(chartView, chartOptions);

    return chart;
}

// draws a table chart in the div div for this panelIndex, pane   
function drawTableChart(dataView, panelIndex, pane) {

    const INITIAL_SORT_COL = 0;

    const div = pane + 'TableDiv_' + panelIndex;          //'childTableDiv_n'

    // Set chart options
    let tableOptions = {
        width: 800, height: '100%',     // 100% if paged 
        alternatingRowStyle: false,
        showRowNumber: false,
        allowHtml: true,
        sortColumn: INITIAL_SORT_COL,
        page: 'enable', pageSize: 10,
        cssClassNames: {
            headerRow: 'header-badge',
            tableRow: 'sundaya-font-row',
            oddTableRow: ' sundaya-font-row',
            selectedTableRow: '',
            hoverTableRow: '',
            headerCell: 'text-left bg-white text-secondary border-bottom border-right-0 border-secondary',
            tableCell: 'sundaya-font-row border-bottom border-right-0 border-default',
            rowNumberCell: ''
        }
    }

    var table = new google.visualization.Table(document.getElementById(div));
    table.draw(dataView, tableOptions);

    return table;
}


/** 
 * functions
 */

// TEMP / TEST -----------------------------------------------------
$(".testButton2").click(function () {
    let btnId = $(this).justtext().trim();
    //alert(btnId);
    if (btnId == 'Store') {

    } else if (btnId == 'Enjoy') {

    }
});

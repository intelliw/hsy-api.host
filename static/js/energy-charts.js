// register table select event 
function addTableEventHandler(paneObj, numChartColumns) {
    google.visualization.events.addListener(paneObj.table, 'select', function () {
        tableSelectEvent(paneObj, numChartColumns);
    });
}

// register chart select event 
function addChartEventHandler(paneObj) {
    google.visualization.events.addListener(paneObj.chart, 'select', function () {
        // chartSelectEvent(paneObj);
    });
}

function chartSelectEvent(paneObj) {
    // alert(paneObj.chart.getSelection()[6].row + ' '  + paneObj.chart.getSelection()[6].column);
}

// selects corresponding chart column when a table row is selected 
function tableSelectEvent(paneObj, numChartColumns) {

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
// returns aggregate (sum or average) from the raw data.
function groupFilteredData(filteredData, groupColumn, groupOption, rawDataHsyColumns, groupDataHsyColumns) {

    const AGGDATA_ID_COLUMN = 0;

    const GROUP_OPTION_SUM = 'sum';
    const JOIN_OPTION_LEFT = 'left';

    // group and aggregate 
    let groupFunction = (groupOption === GROUP_OPTION_SUM) ? google.visualization.data.sum : google.visualization.data.avg;

    let groupedData = google.visualization.data.group(
        filteredData,
        [   // group by these columns and include in output
            { column: groupColumn },
        ],
        // in addition output these columns  e.g. { column: rawDataHsyColumns[0], aggregation: groupFunction, type: 'number' }
        rawDataHsyColumns.map(function (hsyColumn) {
            return {
                column: hsyColumn,
                aggregation: groupFunction,
                type: 'number'
            };
        })
    );

    // join with raw data to get formatted key column (as grouping drops all formatting..) 
    let joinedFormatDataColumn = groupDataHsyColumns.length + 1;
    let joinedData = new google.visualization.DataView(
        google.visualization.data.join(groupedData,
            filteredData,
            JOIN_OPTION_LEFT,
            [[AGGDATA_ID_COLUMN, groupColumn]], groupDataHsyColumns, [groupColumn])
    );
    joinedData.setColumns([joinedFormatDataColumn].concat(groupDataHsyColumns));

    return joinedData;
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
function colorDataTable(dt, storeTotalColumn, gridTotalColumn) {
    const COLOR = 'red';
    let formatter;

    if (storeTotalColumn) {
        formatter = new google.visualization.ColorFormat();
        formatter.addRange(0, null, COLOR, '');
        formatter.format(dt, storeTotalColumn);
    }
    if (gridTotalColumn) {    
        formatter = new google.visualization.ColorFormat();
        formatter.addRange(null, 0, COLOR, '');
        formatter.format(dt, gridTotalColumn);
    }
}

// draws a column chart in the div for this panelIndex, pane
function drawColumnChart(dataView, div, columns, chartColors) {
    
    const VAXIS_COLUMN = 0;
    let prevSelection; 

    // add the vaxis columnn as the first column
    columns.unshift(VAXIS_COLUMN);

    // Set chart options
    let chartOptions = {
        width: '100%',
        height: '100%',
        chartArea: { left: 45, top: 30, right: 10, bottom: 15, width: '95%', height: '95%' },
        bar: { groupWidth: '75.0%' },
        isStacked: true,
        selectionMode: 'multiple',
        tooltip: { trigger: 'selection', showColorCode: true },
        aggregationTarget: 'category',
        fontName: 'Open Sans', fontSize: '0.70rem',
        dataOpacity: 0.8,
        legend: { position: 'top', maxLines: 2, alignment: 'left' },
        vAxis: {
            title: 'Megajoules (MJ)',
            textPosition: 'out',
            titleTextStyle: { italic: 'false' },
            gridlines: { count: 10, color: 'none' }, baselineColor: '#343a40',
            viewWindowMode: 'pretty',
            format: '##.####'
        },
        hAxis: {
            title: '',
            textPosition: 'none',
            textStyle: { fontSize: '0.70rem' },
            gridlines: { color: 'none' }, baselineColor: 'none',
            titleTextStyle: { italic: 'true' }
        },
        axisTitlesPosition: 'none', titlePosition: 'none',
        backgroundColor: { fill: 'none', stroke: 'none', strokeWidth: 4 }
    };
    chartOptions.colors = chartColors;

    // setup dataview
    let chartView = new google.visualization.DataView(dataView);
    chartView.setColumns(columns);
    
    // draw chart
    let newChart = new google.visualization.ColumnChart(div[0]);   // first element of jquery object is html dom object
    newChart.draw(chartView, chartOptions);

    return newChart;
}

// draws a table chart in the div div for this panelIndex, pane. table is a panelMapObj.child.table   
function drawTableChart(dataView, div, table) {

    const INITIAL_SORT_COL = 0;

    // get the current sort
    let sortObj;
    if (table) {
        sortObj = table.getSortInfo()
    }

    // Set chart options with current sort
    let tableOptions = {
        width: '100%', height: '100%',     // height 100% if paged 
        alternatingRowStyle: false,
        showRowNumber: false,
        allowHtml: true,
        sortColumn: (sortObj ? sortObj.column : INITIAL_SORT_COL),
        sortAscending: (sortObj ? sortObj.ascending : true),
        page: 'enable', pageSize: 15,
        cssClassNames: {
            headerRow: 'header-badge ',
            tableRow: 'sundaya-font-row',
            oddTableRow: ' sundaya-font-row',
            selectedTableRow: '',
            hoverTableRow: '',
            headerCell: 'text-left bg-white text-secondary border-bottom border-right-0 border-default',
            tableCell: 'sundaya-font-row border-bottom border-right-0 border-default',
            rowNumberCell: ''
        }
    }

    let newTable = new google.visualization.Table(div[0]);         // first element of jquery object is html dom object
    newTable.draw(dataView, tableOptions);

    return newTable;
}

// sets the chart titles
function setChartTitles(pane) {
    
    let sum = getGroupOption() == 'sum';
    
    if (pane.hasClass('pane-child')) {
        pane.find('.select-chart-title').text((sum ? '' : 'Average') + ' Megajoules (MJ) / ' + CHILD_PERIOD + (sum ? '' : ' / ' + GRANDCHILD_PERIOD));
    } else {
        pane.find('.select-chart-title').text((sum ? '' : ' Average') + ' Megajoules (MJ) / ' + (sum ? GRANDCHILD_PERIOD : CHILD_PERIOD));
    }

}

/* get columns and colours based on hsy filters. the returned filter object has an array of columns and colours 
   order of elements in allColumns and allColours are: vAxis + harvest(0), enjoy(1), storein/out(2,3), gridout/in(4,5) 
*/
function getActiveHsyFilters(allColumns, allColours) {
    
    const HARVEST = 0;
    const ENJOY = 1;
    const STORE_IN = 2;  const STORE_OUT = 3;
    const GRID_IN = 4;   const GRID_OUT = 5;

    const ALL_FILTERS_ADDED = 4;

    let numFilters = 0;

    // initialise     
    let filterObj = { columns:[], colours:[] }; 
       

    // add columns and colours depending on which hsy buttons are active and live    

    // harvest
    if ($('.hsy-filter-btn.btn-success.live').hasClass('active')) {              
        numFilters++;
        filterObj.columns.push(allColumns[HARVEST]);
        filterObj.colours.push(allColours[HARVEST]);
    }
    
    // enjoy
    if ($('.hsy-filter-btn.btn-danger.live').hasClass('active')) {              
        numFilters++;
        filterObj.columns.push(allColumns[ENJOY]);
        filterObj.colours.push(allColours[ENJOY]);

    }

    // store
    if ($('.hsy-filter-btn.btn-primary.live').hasClass('active')) {              
        numFilters++;
        filterObj.columns.push(allColumns[STORE_IN]);
        filterObj.colours.push(allColours[STORE_IN]);

        filterObj.columns.push(allColumns[STORE_OUT]);
        filterObj.colours.push(allColours[STORE_OUT]);
    }

    // grid
    if ($('.hsy-filter-btn.btn-dark.live').hasClass('active')) {              
        numFilters++;
        filterObj.columns.push(allColumns[GRID_IN]);
        filterObj.colours.push(allColours[GRID_IN]);

        filterObj.columns.push(allColumns[GRID_OUT]);
        filterObj.colours.push(allColours[GRID_OUT]);

    }
    
    // if none or all were added then just return the original columns and colours 
    filterObj = numFilters == 0 || numFilters == ALL_FILTERS_ADDED ?  { columns: allColumns, colours: allColours } : filterObj;

    return filterObj;

}
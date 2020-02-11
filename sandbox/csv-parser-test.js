//@ts-check
"use strict";
const csvAsyncParse = require('csv-parse')
const csvSyncParse = require('csv-parse/lib/sync')

const output = []
const CSV_DATA = `
pms.id,time_local,pack.dock,pack.id,pack.dock,pack.amps,pack.temp.1,pack.temp.2,pack.temp.3,cell.volts.1,cell.volts.2,cell.volts.3,cell.volts.4,cell.volts.5,cell.volts.6,cell.volts.7,cell.volts.8,cell.volts.9,cell.volts.10,cell.volts.11,cell.volts.12,cell.volts.13,cell.volts.14,cell.open.1,cell.open.2,cell.open.3,cell.open.4,cell.open.5,cell.open.6,cell.open.7,cell.open.8,cell.open.9,cell.open.10,cell.open.11,cell.open.12,cell.open.13,cell.open.14,fet.temp.1,fet.temp.2,fet.open.1,fet.open.2
25,20190820T115900.000+0700,6,269,6,-1.3,33,32,31,3.793,3.796,3.78,3.788,3.797,3.795,3.792,3.796,3.788,3.779,3.795,3.795,3.788,3.793,1,,6,,,,,,,,,,,,30,29,0,0
25,20190820T120000.000+0700,6,269,6,-1.3,41,39,34,3.793,3.796,3.78,3.788,3.793,3.795,3.792,3.796,3.788,3.779,3.791,3.795,3.785,3.793,,,,,,,,,,,,,,,43,39,1,0
`;
// async function begins on readable stream event after csvAsyncParse returns
function test1() {
    csvAsyncParse(CSV_DATA, {
        trim: true,
        skip_empty_lines: true
    })
        // Use the readable stream api
        .on('readable', function () {
            let record
            while (record = this.read()) {
                output.push(record)
            }
        })
        // When we are done, test that the parsed output matched what expected
        .on('end', function () {
            // console.dir(record);
            // c@onsole.log(`pack.id: ${record['pack.id']} time_local: ${record.time_local}`);
        })
}


// async - function processes all records after csvAsyncParse returns, and then runs end function
// with headers - and error ('3.797' '3.795 has no closing quote
function test2() {

    csvAsyncParse(CSV_DATA.trim(), {
        columns: true, 
        skip_lines_with_error: true

    }, function (err, records) {
        records.forEach(record => {
            c@onsole.log(`pack.id: ${record['pack.id']} time_local: ${record.time_local}`);
            output.push(record);
        });
    })
    .on('end', function () {
        c@onsole.log(output.length);
        // c@onsole.log(`pack.id: ${record['pack.id']} time_local: ${record.time_local}`);
    })

}

// sync function - returns all records after csvparse 
function test3() {

    const csvRows = csvSyncParse(CSV_DATA.trim(), {
        columns: true,
        skip_empty_lines: true
    })
    c@onsole.log('$$$')  // $$$
    c@onsole.log(csvRows[0]['pack.id'])  // $$$
    c@onsole.log(csvRows[1]['pack.id'])  // $$$
    c@onsole.log(`csvRows.length ${csvRows.length}`); // $$$
    //console.dir(csvRows);

}
test3();
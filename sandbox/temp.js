// parse csv into json array of datasets - csv must have headers. error rows are skippsed (e.g. missing closing quote)
function pmsCsvToJsonDatasets(csvData) {

  let jsonObj = { datasets: [] };
  let dataset = { pms: { id: '' } };
  let dataObj;

  const CELL_VOLTS_COLUMNS = 14;
  const CELL_OPEN_COLUMNS = 14;
  const FET_OPEN_COLUMNS = 2;
  console.log('@@')  // @@@@@

  // call csv parser
  csvparse(`${csvData}`.
      trim(), {
      columns: true,
      skip_lines_with_error: true

      // convert each csv record row to json
  }, function (err, records) {
      records.forEach(record => {

          // if new pms id add the dataset to the json and reinitialise dataset as a new one
          if (dataset.pms.id !== record['pms.id'].trim()) {

              // if not first time, add the dataset to the json
              if (dataset.pms.id !== '') jsonObj.datasets.push(dataset);

              // initialise dataset object 
              dataset = { pms: { id: record['pms.id'].trim() } }
              dataset.data = [];
          }

          // data arrays
          let cellOpen = [];
          for (let i = 1; i <= CELL_OPEN_COLUMNS; i++) {
              let v = record[`cell.open.${i}`].trim();
              if (v !== '') cellOpen.push(parseFloat(v));
          }
          let cellVolts = [];
          for (let i = 1; i <= CELL_VOLTS_COLUMNS; i++) {
              cellVolts.push(parseFloat(record[`cell.volts.${i}`]));
          };
          let fetOpen = [];
          for (let i = 1; i <= FET_OPEN_COLUMNS; i++) {
              let v = record[`fet.open.${i}`].trim();
              if (v !== '') fetOpen.push(parseFloat(v));
          }

          // construct the dataObj for this row, and add it to the dataset.data array
          dataObj = {
              time_local: record['time_local'],
              pack: {
                  id: record['pack.id'],
                  dock: record['pack.dock'],
                  amps: record['pack.amps'],
                  temp: [record['pack.temp.1'], record['pack.temp.2'], record['pack.temp.3']],
                  cell: { open: cellOpen, volts: cellVolts },
                  fet: {
                      open: fetOpen,
                      temp: [record['fet.temp.1'], record['fet.temp.2']]
                  },
              }
          }
          dataset.data.push(dataObj);
      });
      console.log('@@@')  // @@@@@
      jsonObj.datasets.push(dataset);
      console.dir(jsonObj.datasets);
  })
  
  return jsonObj.datasets;





const Bigtable = require('@google-cloud/bigtable');

const TABLE_ID = 'Hello-Bigtable';
const COLUMN_FAMILY_ID = 'cf1';
const COLUMN_QUALIFIER = 'greeting';
const INSTANCE_ID = '127.0.0.1:8086';

if (!INSTANCE_ID) {
  throw new Error('Environment variables for INSTANCE_ID must be set!');
}

const getRowGreeting = row => {
  return row.data[COLUMN_FAMILY_ID][COLUMN_QUALIFIER][0].value;
};

(async () => {
  try {
    const bigtableClient = new Bigtable();
    const instance = bigtableClient.instance(INSTANCE_ID);

    const table = instance.table(TABLE_ID);
    const [tableExists] = await table.exists();
    if (!tableExists) {
      console.log(`Creating table ${TABLE_ID}`);
      const options = {
        families: [
          {
            name: COLUMN_FAMILY_ID,
            rule: {
              versions: 1,
            },
          },
        ],
      };
      await table.create(options);
    }

    console.log('Write some greetings to the table');
    const greetings = ['Hello World!', 'Hello Bigtable!', 'Hello Node!'];
    const rowsToInsert = greetings.map((greeting, index) => ({
      key: `greeting${index}`,
      data: {
        [COLUMN_FAMILY_ID]: {
          [COLUMN_QUALIFIER]: {
            timestamp: new Date(),
            value: greeting,
          },
        },
      },
    }));
    await table.insert(rowsToInsert);

    const filter = [
      {
        column: {
          cellLimit: 1, // Only retrieve the most recent version of the cell.
        },
      },
    ];

    console.log('Reading a single row by row key');
    const [singleRow] = await table.row('greeting0').get({filter});
    console.log(`\tRead: ${getRowGreeting(singleRow)}`);

    console.log('Reading the entire table');
    const [allRows] = await table.getRows({filter});
    for (const row of allRows) {
      console.log(`\tRead: ${getRowGreeting(row)}`);
    }

    console.log('Delete the table');
    await table.delete();
  } catch (error) {
    console.error('Something went wrong:', error);
  }
})();
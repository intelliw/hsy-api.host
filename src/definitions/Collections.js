//@ts-check
"use strict";
/**
 * ./definitions/Collection.js
 *  generic JSON collection object 
 */
const Definitions = require('./Definitions');

/** stores all the elements of a json collection:
 *  use collections = collections.getElements()..
 *  example below for /energy/harvest/period/week/20190204T090623.555/2?site=999
 * collections[0]....
    { collection:
      { href: 'http://localhost:8080/energy/harvest/period/week/20190204/1?site=900',
        version: '0.2',
        links: [ [Object], [Object], [Object], [Object], [Object] ],
        items: [ [Object], [Object], [Object], [Object], [Object], [Object], [Object] ] 
      } 
    }
 * collections[0].collection.links[0]....
    { rel: 'up',
      name: 'month',
      prompt: 'Feb 2019',
      title: '01/02/19 - 28/02/19',
      href: 'http://localhost:8080/energy/harvest/period/month/20190201/1?site=900',
      render: 'link' 
    }
 * collections[0].collection.items[0].... 
 { href: 'http://localhost:8080/energy/harvest/period/day/20190204/1?site=900',
   links:
   [ { rel: 'self',
       name: 'day',
       prompt: 'Mon Feb 4th',
       title: '04/02/19',
       href: 'http://localhost:8080/energy/harvest/period/day/20190204/1?site=900',
       description: 'hse',
       render: 'link' },
     { rel: 'collection',
       name: 'day.timeofday',
       prompt: 'Feb 4 Night - Feb 4 Evening',
       title: '04/02/19 00:00 - 04/02/19 23:59',
       href: 'http://localhost:8080/energy/harvest/period/timeofday/20190204T0000/4?site=900',
       description: undefined,
       render: undefined } ],
   data:
    [ { name: 'harvest.day', value: '26.558364' },
      { name: 'harvest.day.timeofday', value: '4.7139 20.595608 2.956092 20.206896' } ] 
 }
 */ 
class Collections extends Definitions  {
    constructor() {
        super();
    }

    add(version, href, colLinks, colItems) {

        let links = colLinks.getElements();             // use getElements to get the array 
        let items = colItems.getElements();
        
        let collection = { "collection" : { "href": href, "version": version, links, items } };

        
        super.add(collection);

    }
}
module.exports = Collections;

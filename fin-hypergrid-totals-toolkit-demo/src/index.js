'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    plugin = require('totals-toolkit');


var subgrids = [
    'HeaderSubgrid',
    ['SummarySubgrid', { name: 'topTotals' }],
    'data',
    ['SummarySubgrid', { name: 'bottomTotals' }]
];


window.onload = function() {

    // register the summary and install the subgrid API calls
    Hypergrid.prototype.installPlugins(plugin);

    window.grid = new Hypergrid({ margin: { bottom:'20px' } });
    window.grid.setData(makeData);
    window.grid.loadState({ subgrids: subgrids }); // override the subgrid list to include summaries

    var totals = [11,22,33,44,55,66,77,88,99];
    grid.behavior.setTopTotals(totals);
    grid.behavior.setBottomTotals(totals);

};
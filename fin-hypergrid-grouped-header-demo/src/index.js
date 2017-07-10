'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    grpHdrPlugin = require('grouped-header');

window.onload = function() {
    var data = makeData,
        grid = new Hypergrid;

    grid.setData(data);

    grid.installPlugins(grpHdrPlugin);

    // New header definitions. This example has three levels of headers.
    // The idea here is that group headers are repeated for each column participating in the group.
    grid.behavior.setHeaders({
        areaTotalMi: 'Area|Total|miles', // The highest order group header is 'Area'
        areaTotalKm: 'Area|Total|km', // The nested group header is 'Total'

        areaLandMi: 'Area|Land|miles',
        areaLandKm: 'Area|Land|km',

        areaWaterMi: 'Area|Water|miles',
        areaWaterKm: 'Area|Water|km',

        // The rest are not necessary; we only need the grouped ones.
        name: 'State',
        code: 'Postal Code',
        capital: 'Capital',
        city: 'Largest City',
        founded: 'Statehood',
        population: 'Population',
        reps: 'House Seats'
    });

    // Cosmetic: Format the number columns with comma-separator at every 3rd order of magnitude.
    for (var i = grid.behavior.getActiveColumnCount() - 1; i >= 5; --i) {
        grid.behavior.setColumnProperties(i, {format: 'number'});
    }

    window.grid = grid;
};
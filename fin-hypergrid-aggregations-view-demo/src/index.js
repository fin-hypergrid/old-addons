'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    aggregations = require('aggregations'),
    aggPlugin = aggregations.aggPlugin,
    rollups = aggregations.rollups;


window.onload = function() {

    var data = makeData(),
        grid = new Hypergrid,
        options = {
            aggregations: {
                totalPets: rollups.sum(2),
                averagePets: rollups.avg(2),
                maxPets: rollups.max(2),
                minPets: rollups.min(2),
                firstPet: rollups.first(2),
                lastPet: rollups.last(2),
                stdDevPets: rollups.stddev(2)
            },
            groups: [5, 0, 1]
        };
    grid.setData(data);
    
    grid.installPlugins([[aggPlugin, options]]);
    grid.properties.renderFalsy = true;

    window.grid = grid;

    document.querySelector('input[type=checkbox]').onclick = function() {
        if (this.checked) {
            // turn aggregations view ON using options.aggregates and options.group
            // Alternatively, you may supply overrides for both as parameters here.
            grid.plugins.aggregationsView.setAggregateGroups();
        } else {
            // turn aggregations view OFF
            grid.plugins.aggregationsView.setAggregateGroups([]);
        }
    };
};


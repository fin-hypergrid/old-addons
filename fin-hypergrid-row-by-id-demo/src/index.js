'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    plugin = require('row-by-id'); //local npm

window.onload = function() {
    var data = makeData,
        grid = new Hypergrid;

    grid.setData(data);

    grid.installPlugins(plugin);
    
    window.grid = grid;
};
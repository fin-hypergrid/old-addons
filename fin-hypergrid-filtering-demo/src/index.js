'use strict';

// "require" dependencies
var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    filterPlugin = require('filtering').hyperFilter,
    filterDatasource = require('filtering/datasources/DataSourceGlobalFilter'); // require('filtering').filterDatasourc

// instantiate
var data = makeData(),
    grid = new Hypergrid;

grid.setData(data);

// install filter data source and api (plugin) and create controller
grid.setPipeline([filterDatasource]);
grid.installPlugins(filterPlugin);
grid.filter = grid.plugins.hyperfilter.create(); // will derive schema

grid.properties.renderFalsy = true;
grid.cellEditors.add(require('filtering/cell-editors/ComboBox'));
grid.cellEditors.add(require('filtering/cell-editors/FilterBox'));
grid.properties.showFilterRow = true;

window.grid = grid;
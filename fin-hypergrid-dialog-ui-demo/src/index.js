'use strict';

var Hypergrid = require('fin-hypergrid'),
    fields = require('fin-hypergrid/src/lib/fields'),
    makeData = require('./data/make-data'),
    dialogPlugin = require('dialog-ui'),
    filter = require('filtering'),
    sorter = require('sorting'),
    sorterPlugin = sorter.hyperSorter,
    sorterDatasource = sorter.sorterDatasource,
    filterPlugin = require('filtering').hyperFilter,
    filterDatasource = require('filtering/datasources/DataSourceGlobalFilter'); // require('filtering').filterDatasourc

window.onload = function() {
    var data = makeData(),
        schema = fields.getSchema(data),
        grid = new Hypergrid;

    grid.setData(data, {schema: schema});

    // install sorter data source and api (plugin) and create controller
    // install filter data source and api (plugin) and create controller
    grid.setPipeline([filterDatasource, sorterDatasource]);
    grid.installPlugins([sorterPlugin, dialogPlugin, filterPlugin]);
    
    grid.sorter = grid.plugins.hypersorter;
    grid.filter = grid.plugins.hyperfilter.create(); // will derive schema

    grid.localization.header = {
        format: headerFormatter.bind(grid)
    };

    grid.cellEditors.add(require('filtering/cell-editors/ComboBox'));
    grid.cellEditors.add(require('filtering/cell-editors/FilterBox'));
   
    grid.properties.renderFalsy = true;
    grid.properties.showFilterRow = true;

    window.grid = grid;
};

function headerFormatter(value, config) {
    var colIndex = config.dataCell.x,
        sortString = this.behavior.dataModel.getSortImageForColumn(colIndex);

    if (sortString) {
        var groups = value.lastIndexOf(this.behavior.groupHeaderDelimiter) + 1;

        // if grouped header, prepend group headers to sort direction indicator
        if (groups) {
            sortString = value.substr(0, groups) + sortString;
            value = value.substr(groups);
        }

        // prepend sort direction indicator to column header
        value = sortString + value;
    }

    return value;
}
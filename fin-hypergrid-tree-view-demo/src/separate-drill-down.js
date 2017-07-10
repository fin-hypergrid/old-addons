'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/tree-data'),
    treePlugin = require('../../tree-view').treeView;


window.onload = function() {

    var data = makeData(),
        grid = new Hypergrid,
        options = {
            treeColumn: 'State', // groupColumn defaults to treeColumn by default
            includeSorter: true,
            includeFilter: true,
            hideIdColumns: true
        };
    // Add a blank column.
    data.forEach(function(dataRow) { dataRow.name = ''; });
    grid.setData(data);
    
    grid.installPlugins([[treePlugin, options]]);
    grid.properties.renderFalsy = true;

    var idx = grid.behavior.columnEnum;

    grid.setState({
        columnIndexes: [ idx.NAME, idx.STATE, idx.LATITUDE, idx.LONGITUDE ], // so drill-down column on far left
        fixedColumnCount: 1 // so far left drill-down column always visible
    });

    grid.behavior.setColumnProperties(grid.behavior.columnEnum.STATE, {
        halign: 'left'
    });

    var dd = grid.plugins.treeView.drillDown = {};

    window.grid = grid;

    var checkbox = document.querySelector('input[type=checkbox]'),
        button = document.querySelector('input[type=button]');

    checkbox.onclick = function() {
        var dataSource = grid.plugins.treeView.setRelation(this.checked);
        if (dataSource) {
            dd.column = grid.behavior.getColumn(dataSource.treeColumn.index);

            dd.header = dd.column.header;
            dd.column.header = '';

            dd.unsortable = dd.column.properties.unsortable;
            dd.column.properties.unsortable = true;
        } else {
            dd.column.header = dd.header;
            dd.column.properties.unsortable = dd.unsortable;
        }
    };

};


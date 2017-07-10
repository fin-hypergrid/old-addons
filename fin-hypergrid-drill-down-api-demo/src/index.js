'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/tree-data'),
    treePlugin = require('tree-view').treeView,
    drillDownAPI = require('drill-down-api'),
    rowById = require('row-by-id');

window.onload = function() {
    var data = makeData(),
        grid = new Hypergrid,
        options = {
            treeColumn: 'State', // groupColumn defaults to treeColumn by default
            includeSorter: true,
            includeFilter: true,
            hideIdColumns: true
        };
    grid.setData(data);
    
    grid.installPlugins([drillDownAPI, rowById, [treePlugin, options]]);
    grid.properties.renderFalsy = true;

    grid.behavior.setColumnProperties(grid.behavior.columnEnum.STATE, {
        halign: 'left'
    });

    window.grid = grid;

    var checkbox = document.querySelector('input[type=checkbox]'),
        button = document.querySelector('input[type=button]');

    checkbox.onclick = function() {
        grid.plugins.treeView.setRelation(this.checked);
        button.disabled = !this.checked;
    };

    button.onclick = function() {
        grid.behavior.dataModel.expandAllRows(true);
    };
};
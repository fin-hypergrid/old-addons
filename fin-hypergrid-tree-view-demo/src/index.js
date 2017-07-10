'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/tree-data'),
    treePlugin = require('tree-view').treeView; //local npm


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
    
    grid.installPlugins([[treePlugin, options]]);
    grid.properties.renderFalsy = true;

    grid.behavior.setColumnProperties(grid.behavior.columnEnum.STATE, {
        halign: 'left'
    });

    window.grid = grid;

    var checkbox = document.querySelector('input[type=checkbox]');
    
    checkbox.onclick = function() {
        grid.plugins.treeView.setRelation(this.checked);
    };

};


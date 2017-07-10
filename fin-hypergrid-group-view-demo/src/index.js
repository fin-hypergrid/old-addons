'use strict';

var Hypergrid = require('fin-hypergrid'),
    makeData = require('./data/make-data'),
    grpPlugin = require('group-view').groupView,
    versions = require('group-view').versions;


window.onload = function() {

    var data = makeData(),
        grid = new Hypergrid,
        //getCellCache,
        options = {
            groups: [5, 0, 1]
        };

    require('group-view/renderers/GVEmptyCell')(grid);
    require('group-view/renderers/GVSimpleCell')(grid);
    grid.setData(data);
    grid.installPlugins([[grpPlugin, options]]);
    grid.addProperties({
        renderFalsy: true
    });
    
    
    window.grid = grid;

    var groupOn = document.getElementById('a'),
        v2Toggle = document.getElementById('b');

    v2Toggle.disabled = true;
    versions.setVersion('1');
    grid.addProperties(versions.version.gridProps);

    groupOn.onclick = function() {
        if (this.checked) {
            // turn group view ON using options.group
            // Alternatively, you may supply overrides for both as parameters here.
            grid.plugins.groupView.setGroups();
        } else {
            // turn group view OFF
            grid.plugins.groupView.setGroups([]);
        }

        v2Toggle.disabled = !this.checked;
    };

    v2Toggle.onclick = function () {

        if (this.checked) {
            //turn off all grid lines
            //Always draw last grid line right and bottom
            //Use GVSimpleCell as a base to extend other renderers used in Group View V2
            versions.setVersion('2');
        } else {
            versions.setVersion('1');
        }
        grid.addProperties(versions.version.gridProps);
        grid.plugins.groupView.setGroups();
        //grid.plugins.groupView.directDataSourceLink.buildGroupTree(); //Implicitly called during setGroups but since we are changing the versions
    };
};


'use strict';

var SummarySubgrid = require('./js/SummarySubgrid');

var totalsToolkit = {
    preinstall: function(HypergridPrototype, BehaviorPrototype) {

        HypergridPrototype.mixIn(require('./mix-ins/grid'));
        BehaviorPrototype.mixIn(require('./mix-ins/behavior'));

        // Register for reference by name from a subgrid list in state object
        var Hypergrid = HypergridPrototype.constructor;
        Hypergrid.dataModels.add('SummarySubgrid', SummarySubgrid);
    }
};

module.exports = totalsToolkit;

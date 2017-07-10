/* eslint-env browser */

'use strict';

// NOTE: gulpfile.js's 'add-ons' task copies this file, altering the final line, to /demo/build/add-ons/, along with a minified version. Both files are eventually deployed to http://openfin.github.io/fin-hypergrid/add-ons/.

/** @typedef customDataSource
 * @type {function|boolean}
 * @summary One of:
 * * A custom data source module (object constructor).
 * * Truthy - Use a default data source object constructor.
 * * Falsy - No datasource (exclude from pipeline).
 * @memberOf AggregationsView
 */

/**
 * @param {AggregationsView.customDataSource} dataSource - A custom data source object constructor *or* `true` to enable default *or* `false` to disable.
 * @param {function} defaultDataSource - The default data source object constructor.
 * @returns {function} Returns selected dataSource; or falsy `dataSource`.
 * @memberOf AggregationsView
 * @inner
 */
function include(dataSource, defaultDataSource) {
    var isConstructor = typeof dataSource === 'function';
    return isConstructor ? dataSource : dataSource && defaultDataSource;
}

function AggregationsView(grid, options) {
    this.grid = grid;
    this.options = options || {};
}

AggregationsView.prototype.name = 'AggregationsView';

AggregationsView.prototype.setAggregateGroups = function(aggregations, groups) {
    aggregations = aggregations || this.options.aggregations;
    groups = groups || this.options.groups;

    if (!aggregations || !groups) {
        throw 'Expected both an aggregations hash and a group list.';
    }

    var aggregated = groups.length,
        grid = this.grid,
        behavior = grid.behavior,
        dataModel = behavior.dataModel;

    // 1. ON AGGREGATING: INSTALL PIPELINE

    if (aggregated) {
        behavior.setPipeline([
            require('./dataSources/DataSourceAggregator')
        ], {
            stash: 'default',
            apply: false // defer until after setGroupBys call below
        });
    }

    // 2. PERFORM ACTUAL AGGREGATING OR UNAGGREGATING

    var dataSource = dataModel.findDataSourceByType('aggregator'),
        columnProps = behavior.getColumnProperties(dataSource.treeColumnIndex),
        state = grid.properties;

    if (aggregated) {
        dataSource.setAggregateGroups(aggregations, groups);
        behavior.reindex(); // rows have changed
    } else {
        dataSource.setAggregateGroups({}, []);
    }

    // 3. SAVE OR RESTORE SOME RENDER PROPERTIES

    if (aggregated) {
        // save the current value of column's editable property and set it to false
        this.editableWas = !!columnProps.editable;
        columnProps.editable = false;

        this.cellSelectionWas = !!columnProps.cellSelection;
        columnProps.cellSelection = false;

        // save value of grid's checkboxOnlyRowSelections property and set it to true so drill-down clicks don't select the row they are in
        this.checkboxOnlyRowSelectionsWas = state.checkboxOnlyRowSelections;
        state.checkboxOnlyRowSelections = true;
        //Turn on Tree Column
        grid.properties.showTreeColumn = true;
    } else {
        // restore the saved render props
        columnProps.editable = this.editableWas;
        columnProps.cellSelection = this.cellSelectionWas;
        state.checkboxOnlyRowSelections = this.checkboxOnlyRowSelectionsWas;

        // 3a. ON UNGROUPING: RESTORE PIPELINE
        behavior.unstashPipeline();
        //Turn off Tree Column
        grid.properties.showTreeColumn = false;
    }

    behavior.createColumns(); // columns changed
    behavior.changed(); // number of rows changed
    grid.selectionModel.clear();
    grid.clearMouseDown();

    return aggregated;
};

module.exports = {
   aggPlugin: AggregationsView,
   rollups: require('./datasources/util/aggregations')
};
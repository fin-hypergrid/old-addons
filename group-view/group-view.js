/* eslint-env browser */

'use strict';

var versions = require('./versions-strategy');

// NOTE: gulpfile.js's 'add-ons' task copies this file, altering the final line, to /demo/build/add-ons/, along with a minified version. Both files are eventually deployed to http://openfin.github.io/fin-hypergrid/add-ons/.

/** @typedef customDataSource
 * @type {function|boolean}
 * @summary One of:
 * * A custom data source module (object constructor).
 * * Truthy - Use a default data source object constructor.
 * * Falsy - No datasource (exclude from pipeline).
 * @memberOf GroupView
 */

/**
 * @param {GroupView.customDataSource} dataSource - A custom data source object constructor *or* `true` to enable default *or* `false` to disable.
 * @param {function} defaultDataSource - The default data source object constructor.
 * @returns {function} Returns selected dataSource; or falsy `dataSource`.
 * @memberOf GroupView
 * @inner
 */
function include(dataSource, defaultDataSource) {
    var isConstructor = typeof dataSource === 'function';
    return isConstructor ? dataSource : dataSource && defaultDataSource;
}

function GroupView(grid, options) {
    this.grid = grid;
    this.options = options || {};
    this.directDataSourceLink = null;
    this.pixelConstantPadding = 10; //Fiddle with this number
    this.maxGroupNodeDepth = 0;

    var Hypergrid = this.grid.constructor;
    Hypergrid.defaults.mixIn(require('./mix-ins/defaults'));
}

GroupView.prototype = {
    constructor: GroupView.prototype.constructor,

    name: 'GroupView',

    get pixelConstant() {
        return Math.round(this.grid.renderer.visibleColumns[this.grid.behavior.treeColumnIndex].width / (this.maxGroupNodeDepth + this.pixelConstantPadding));
    },

    fireSyntheticGroupsChangedEvent: function() {
        this.grid.canvas.dispatchEvent(new CustomEvent('fin-groups-changed', {
            detail: {
                groups: this.getGroups(),
                time: Date.now(),
                grid: this
            }
        }));
    },

    getGroups: function() {
        var dataModel = this.grid.behavior.dataModel,
            schema = dataModel.schema,
            fields = schema.map(function(s) { return s.name; }),
            dataSource = dataModel.findDataSourceByType('groupviewer'),
            groupBys = dataSource.groupBys,
            groups = [];
        for (var i = 0; i < groupBys.length; i++) {
            var field = schema[groupBys[i] + 1].header; // add 1 to exclude the tree column
            groups.push({
                id: groupBys[i],
                label: field,
                field: fields
            });
        }
        return groups;
    },

    getAvailableGroups: function() {
        var dataModel = this.grid.behavior.dataModel,
            schema = dataModel.schema,
            dataSource = dataModel.findDataSourceByType('groupviewer'),
            groupBys = dataSource.groupBys,
            groups = [];
        for (var i = 0; i < schema.length; i++) {
            if (groupBys.indexOf(i) === -1) {
                var field = schema[groupBys[i]].header;
                groups.push({
                    id: i,
                    label: field,
                    field: field
                });
            }
        }
        return groups;
    },

    /**
     * @summary Build/unbuild the group view.
     * @desc Sets up grouping on the table using the options given to the constructor (see above).
     *
     * Reconfigures the data model's data pipeline for group view; restores it when ungrouped.
     *
     * Also saves and restores some grid properties:
     * * Tree column is made non-editable.
     * * Tree column is made non-selectable so clicking drill-down controls doesn't select the cell.
     * * Row are made selectable by clicking in row handles only so clicking drill-down controls doesn't select the row.
     *
     * @param {number[]} [groups=this.options.groups] - One of:
     * * Non-empty array: Turn group-view **ON** using the supplied group list.
     * * Empty array (`[]`): Turn group-view **OFF**.
     *
     * @returns {boolean} Grouped state.
     */
    setGroups: function(groups) {
        groups = groups || this.options.groups;

        if (!groups) {
            throw 'Expected a group list.';
        }

        var grouped = groups.length,
            grid = this.grid,
            behavior = grid.behavior,
            dataModel = behavior.dataModel;

        // 1. ON GROUPING: INSTALL GROUP-VIEW PIPELINE

        if (grouped) {
            behavior.setPipeline([
                require('./dataSources/DataSourceGroupView')
            ], {
                stash: 'default',
                apply: false // defer until after setGroupBys call below
            });
            this.directDataSourceLink = grid.behavior.dataModel.dataSource; //groupview is at the tip of the pipeline
        } else {
            this.directDataSourceLink = null;
        }

        // 2. PERFORM ACTUAL GROUPING OR UNGROUPING

        var dataSource = dataModel.findDataSourceByType('groupviewer'),
            columnProps = behavior.getColumnProperties(dataSource.treeColumnIndex),
            state = grid.properties;

        dataSource.setGroupBys(groups);


        if (grouped) {
            behavior.reindex(); // rows have changed

            // 2a. ON GROUPING: OVERRIDE `getCell` TO FORCE `EmptyCell` RENDERER FOR PARENT ROWS
            this.defaultGetCell = dataModel.getCell;
            this.defaultGetCellEditorAt = dataModel.getCellEditorAt;
            dataModel.getCellEditorAt = getCellEditorAt.bind(dataModel, this.defaultGetCellEditorAt);
            dataModel.getCell = getCell.bind(dataModel, this.defaultGetCell);

            this.defaultPaintGridlines = grid.renderer.paintGridlines;
            if (versions.version.id === 2){
                grid.renderer.paintGridlines = paintGridlines.bind(grid.renderer, this);
            }
        }

        this.fireSyntheticGroupsChangedEvent();

        // 3. SAVE OR RESTORE SOME RENDER PROPERTIES

        if (grouped) {
            this.maxGroupNodeDepth = groups.length - 1;
            // save the current value of column's editable property and set it to false
            this.editableWas = !!columnProps.editable;
            columnProps.editable = false;

            this.cellSelectionWas = !!columnProps.cellSelection;
            columnProps.cellSelection = false;

            // save value of grid's checkboxOnlyRowSelections property and set it to true so drill-down clicks don't select the row they are in
            this.checkboxOnlyRowSelectionsWas = state.checkboxOnlyRowSelections;
            state.checkboxOnlyRowSelections = true;
            //Turn On Tree Column
            grid.properties.showTreeColumn = true;

        } else {
            this.maxGroupNodeDepth = 0;
            // restore the saved render props
            columnProps.editable = this.editableWas;
            columnProps.cellSelection = this.cellSelectionWas;
            state.checkboxOnlyRowSelections = this.checkboxOnlyRowSelectionsWas;

            // 3a. ON UNGROUPING: RESTORE PIPELINE
            behavior.unstashPipeline();

            // 3b. ON UNGROUPING: REMOVE `getCell` AND `getCellEditorAt` OVERRIDE
            grid.behavior.dataModel.getCell = this.defaultGetCell;
            grid.behavior.dataModel.getCellEditorAt = this.defaultGetCellEditorAt;
            grid.renderer.paintGridlines = this.defaultPaintGridlines;

            //Turn Off Tree Column
            grid.properties.showTreeColumn = false;
        }


        //behavior.createColumns(); // columns changed
        behavior.changed(); // number of rows changed
        grid.selectionModel.clear();
        grid.clearMouseDown();

        return grouped;
    }
};

/**
 * @memberOf Renderer.prototype
 * @desc We opted to not paint borders for each cell as that was extremely expensive. Instead we draw grid lines here.
 * @param {CanvasRenderingContext2D} gc
 */
function paintGridlines (plugin, gc) {
    var visibleColumns = this.visibleColumns, C = visibleColumns.length,
        treeColumn = this.visibleColumns[this.grid.behavior.treeColumnIndex],
        visibleRows = this.visibleRows, R = visibleRows.length;

    if (C && R) {
        var gridProps = this.properties,
            lineWidth = gridProps.lineWidth,
            lineColor = gridProps.lineColor;

        if (gridProps.gridLinesV) {
            gc.cache.fillStyle = lineColor;
            var viewHeight = visibleRows[R - 1].bottom,
                c = this.grid.behavior.leftMostColIndex;
            if (gridProps.gridBorderLeft) {
                gc.fillRect(visibleColumns[c].left, 0, lineWidth, viewHeight);
            }
            //Don't Paint LeftMost Border
            var first = true;
            // This code could be simplified
            this.visibleColumns.forEachWithNeg(function(vc, i) {
                first = false;

                if (i > -1) {
                    return;
                }
                if (!first) { gc.fillRect(vc.left - lineWidth, 0, lineWidth, viewHeight); }
            });
            if (gridProps.gridBorderRight) {
                gc.fillRect(visibleColumns[C - 1].right + 1 - lineWidth, 0, lineWidth, viewHeight);
            }
        }
        
        var mask = grid.properties.treeColumnGutterColor;

        if (gridProps.gridLinesH) {
            gc.cache.fillStyle = lineColor;
            var viewWidth = visibleColumns[C - 1].right;
            if (gridProps.gridBorderTop) {
                gc.fillRect(0, visibleRows[0].top, viewWidth, lineWidth);
            }
            if (!gridProps.gridBorderBottom) {
                R -= 1;
            }
            if (gridProps.gridBorderRight) {
                viewWidth += lineWidth;
            }
            for (var r = 0; r < R; r++) {
                gc.fillRect(0, visibleRows[r].bottom, viewWidth, lineWidth);
            }

            // Mask over the part of the horizontal gridLines we don't to see
            // Loop again to avoid switching the gc state on every row
            gc.cache.fillStyle = mask;
            var maskWidth = plugin.pixelConstant;
            for (var dataRow, depth, maskLeft, maskWidth, r2 = 0; r2 < R; r2++) {
                dataRow = visibleRows[r2].rowIndex;
                depth = plugin.directDataSourceLink.view[dataRow].depth;
                maskLeft = treeColumn.left;
                for (var i = 0; i < depth; maskLeft += maskWidth + lineWidth, i++) {
                    gc.fillRect(maskLeft, visibleRows[r2].top - 1, maskWidth, lineWidth);

                }

            }
        }
    }
}


/**
 * Force `EmptyCell` renderer on parent rows.
 * @this {dataModelAPI} - bound above
 * @param {function} defaultGetCell - bound above
 * @param {object} config
 * @param {string} rendererName
 * @returns {CellRenderer}
 * @memberOf GroupView
 * @inner
 */
function getCell(defaultGetCell, config, rendererName) {
    // First call the default getCell in case developer overrode it.
    // This will decorate `config` and return a renderer which we might override below.
    var cellRenderer = defaultGetCell.call(this, config, rendererName);

    if (config.isUserDataArea && !this.grid.behavior.dataModel.dataSource.isLeafNode(config.dataCell.y)) {
        // Override renderer on parent rows
        cellRenderer = this.grid.cellRenderers.get(versions.version.emptyCellRenderer);
    }

    return cellRenderer;
}

function getCellEditorAt(defaultGetCellEditorAt, x, y, declaredEditorName, cellEvent) {

    // First call the default getCellEditorAt in case developer overrode it.
    var cellEditor = defaultGetCellEditorAt.call(this, x, y, declaredEditorName, cellEvent);

    if (cellEvent.isDataCell && !this.grid.behavior.dataModel.dataSource.isLeafNode(cellEvent.dataCell.y)) {
        // Override renderer on parent rows
        cellEditor = undefined;
    }

    return cellEditor;
}

module.exports = GroupView;

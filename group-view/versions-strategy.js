'use strict';

var versions = [
    {
        id: 1,
        INDENT: '   ',
        gridProps: {
            gridLinesH: true,
            gridLinesV: true,
            gridBorderRight: false,
            gridBorderTop: false,
            gridBorderLeft: false,
            gridBorderBottom: false,
            columnHeaderRenderer: 'SimpleCell',
            treeRenderer: 'SimpleCell',
            treeHeaderBackgroundColor: 'rgb(223, 227, 232)',
            columnHeaderBackgroundColor: 'rgb(223, 227, 232)',
            rowHeaderBackgroundColor: 'rgb(223, 227, 232)',
            backgroundColor: 'rgb(223, 227, 232)',
            leafCellBackgroundColor: 'rgb(223, 227, 232)',
            renderer: 'SimpleCell'
        },
        drillDownCharMap: {
            OPEN: '\u25bc', // BLACK DOWN-POINTING TRIANGLE aka '▼'
            CLOSE: '\u25b6', // BLACK RIGHT-POINTING TRIANGLE aka '▶'
            undefined: '' // for leaf rows
        },
        emptyCellRenderer: 'EmptyCell'
    },
    {
        id: 2,
        INDENT: '',
        gridProps: {
            gridLinesH: true,
            gridLinesV: true,
            gridBorderRight: true,
            gridBorderTop: true,
            gridBorderLeft: true,
            gridBorderBottom: true,
            columnHeaderRenderer: 'GVSimpleCell',
            treeRenderer: 'GVSimpleCell',
            treeHeaderBackgroundColor: 'rgb(211, 211, 211)',
            columnHeaderBackgroundColor: 'rgb(233, 227, 210)',
            rowHeaderBackgroundColor: 'rgb(233, 227, 210)',
            backgroundColor: 'rgb(211, 211, 211)',
            leafCellBackgroundColor: 'rgb(227, 227, 227)',
            renderer: 'GVSimpleCell'
        },
        drillDownCharMap: {
            OPEN: '-',
            CLOSE: '+',
            undefined: '' // for leaf rows
        },
        emptyCellRenderer: "GVEmptyCell"
    }
];

module.exports = {
    version: null,
    setVersion: function (key){
        this.version = versions[Number(key)-1];
    }
};
'use strict';

var images = require('fin-hypergrid/images/');

var WHITESPACE = /\s\s+/g;

module.exports = function (grid){
    //ideally should not have reference to the grid
    //limit scope as much as possible, maybe to the plugin
    var EC = grid.cellRenderers.get('EmptyCell'),
        GEC;

    GEC = EC.constructor.extend('GVEmptyCell', {
        setBorderInfo: function (config){
            var dm = grid.behavior.dataModel,
                isLeaf = dm.dataSource.isLeafNode(config.dataCell.y),
                pixelConstant = grid.plugins.groupView.pixelConstant,
                view = dm.dataSource.getView(config.dataCell.y),
                depth = view.depth,
                isTreeCol = config.isTreeColumn;

            config.isLeaf = isLeaf;
            config.leftBorder = true;
            config.bounds2 = JSON.parse(JSON.stringify(config.bounds)); //shallowCopy
            config.VBounds = [];

            //Group Rows and header cells
            if (!isTreeCol && !isLeaf && !(config.gridCell.x > -1 && config.gridCell.y === 0)) {
                config.leftBorder = false;
            }

            //These numbers are repeat calculated
            if (isTreeCol) {
                for (var i = -1, left = config.bounds.x; i < depth; i++){
                    if(i === -1){
                        config.VBounds.push(left);
                        continue;
                    }
                    left += pixelConstant;
                    config.VBounds.push(left);
                    left += config.lineWidth;
                }
                config.bounds2.x = config.VBounds[config.VBounds.length - 1];

            }
            return config;
        },
        paint: function (gc, config){
            this.paintBorder(gc, this.setBorderInfo(config));
        },
        paintBorder: function(gc, config) {
            var bounds = config.bounds2,
                x = bounds.x,
                y = bounds.y,
                lineColor = config.lineColor,
                gutter = grid.properties.treeColumnGutterColor,
                thickness = config.lineWidth,
                height = bounds.height;

            //Note that when drawing cell borders they are not included in the bounds
            //Meaning a 1 pixel border is horizontally positioned at config.bounds.x - 1

            gc.cache.fillStyle = lineColor;

            if (config.leftBorder){
                if (config.isDataColumn || config.isHeaderRow) {
                    gc.fillRect(x - thickness, y, thickness, height);
                } else {
                    //Draw the Tree Cell Group Lines
                    var maskY,
                        prev = 0;
                    config.VBounds.forEach(function (el, i) {
                        if (i === 0) {
                            //Don't redraw row handle border
                            prev = el;
                            return;
                        }

                        gc.cache.fillStyle = gutter;
                        gc.fillRect(prev, y, el - prev, height); //Gutter Background
                        gc.cache.fillStyle = lineColor;
                        gc.fillRect(el, y, thickness, height);
                        prev = el + 1;
                    });
                }
            }
            return config;
        }
    });

    grid.cellRenderers.add('GVEmptyCell', GEC);
};


/*global $, ko*/
(function ($, ko) {
    var names = [
        'Declan',
        'Tessa',
        'Claire',
        'Violet',
        'Alice',
        'Mia',
        'Camille',
        'Aiden'
    ];

    var model = {
        simple: {
            source: ko.observableArray([].concat(names)),
            target: ko.observableArray(),
            dropFromSource: function (data, model) {
                model.source.remove(data);
                model.target.push(data);
            },
            dropFromTarget: function (data, model) {
                model.target.remove(data);
                model.source.push(data);
            }
        },

        dragElement: {
            source: ko.observableArray([].concat(names)),
            target: ko.observableArray(),
            dropFromSource: function (data, model) {
                model.source.remove(data);
                model.target.push(data);
            },
            dropFromTarget: function (data, model) {
                model.target.remove(data);
                model.source.push(data);
            }
        },

        styling: {
            source: ko.observableArray(ko.utils.arrayMap(names, function (name) {
                return {
                    value: name,
                    dragging: ko.observable(false)
                };
            })),
            target: ko.observableArray(),
            dragStart: function (item) {
                item.dragging(true);
            },
            dragEnd: function (item) {
                item.dragging(false);
            },
            dropFromSource: function (data, model) {
                model.source.remove(data);
                model.target.push(data);
            },
            dropFromTarget: function (data, model) {
                model.target.remove(data);
                model.source.push(data);
            }
        },

        sortable: {
            items: ko.observableArray(ko.utils.arrayMap(names, function (name) {
                return {
                    value: name,
                    dragging: ko.observable(false)
                };
            })),
            dragStart: function (item) {
                item.dragging(true);
            },
            dragEnd: function (item) {
                item.dragging(false);
            },
            reorder: function (event, dragData, zoneData) {
                if (dragData !== zoneData) {
                    var zoneDataIndex = model.sortable.items.indexOf(zoneData);
                    model.sortable.items.remove(dragData);
                    model.sortable.items.splice(zoneDataIndex, 0, dragData);
                }
            },
            ignore: function () {
            }
        }

    };
    ko.applyBindings(model, $('.demo')[0]);
}($, ko));

/*global $, ko*/
(function ($, ko) {
    function toDraggables(values) {
        return ko.utils.arrayMap(values, function (value) {
            return {
                value: value,
                dragging: ko.observable(false),
                isSelected: ko.observable(false),
                startsWithVowel: function () {
                    return !!this.value.match(/^(a|e|i|o|u|y)/i);
                }
            };
        });
    }

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

    function getSelectedItems(items) {
        return ko.utils.arrayFilter(ko.utils.unwrapObservable(items), function (item) {
            return item.isSelected();
        });
    }

    function clearSelection(items) {
        ko.utils.arrayForEach(ko.utils.unwrapObservable(items), function (item) {
            item.isSelected(false);
        });
    }


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
            source: ko.observableArray(toDraggables(names)),
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

        payload: {
            source: {
                items: ko.observableArray(toDraggables(names)),
                drop: function (data, model) {
                    clearSelection(data.selection);
                    data.items.removeAll(data.selection);
                    ko.utils.arrayPushAll(model.items, data.selection);
                },
                dragStart: function (data) {
                    data.selection = getSelectedItems(data.items);
                    if (!data.item.isSelected()) {
                        clearSelection(data.selection);
                        data.item.isSelected(true);
                        data.selection = [data.item];
                    }
                    ko.utils.arrayForEach(data.selection, function (item) {
                        item.dragging(true);
                    });
                },
                dragEnd: function (data) {
                    ko.utils.arrayForEach(data.selection, function (item) {
                        item.dragging(false);
                    });
                }
            },
            target: {
                items: ko.observableArray([]),
                drop: function (data, model) {
                    clearSelection(data.selection);
                    data.items.removeAll(data.selection);
                    ko.utils.arrayPushAll(model.items, data.selection);
                },
                dragStart: function (data) {
                    data.selection = getSelectedItems(data.items);
                    if (!data.item.isSelected()) {
                        clearSelection(data.selection);
                        data.item.isSelected(true);
                        data.selection = [data.item];
                    }
                    ko.utils.arrayForEach(data.selection, function (item) {
                        item.dragging(true);
                    });
                },
                dragEnd: function (data) {
                    ko.utils.arrayForEach(data.selection, function (item) {
                        item.dragging(false);
                    });
                }
            }
        },

        rejectDrop: {
            source: ko.observableArray(toDraggables(names)),
            target: ko.observableArray(),
            dragStart: function (item) {
                item.dragging(true);
            },
            dragEnd: function (item) {
                item.dragging(false);
            },
            dragEnter: function (event, data, model) {
                return data.startsWithVowel();
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

        dragZones: {
            target: ko.observableArray(),
            vowels: ko.observableArray(toDraggables(names).filter(function (draggable) {
                return draggable.startsWithVowel();
            })),
            consonants: ko.observableArray(toDraggables(names).filter(function (draggable) {
                return !draggable.startsWithVowel();
            })),
            dragStart: function (item) {
                item.dragging(true);
            },
            dragEnd: function (item) {
                item.dragging(false);
            },
            dropVowel: function (data, model) {
                model.target.remove(data);
                model.vowels.push(data);
            },
            dropConsonant: function (data, model) {
                model.target.remove(data);
                model.consonants.push(data);
            },
            dropFromSource: function (data, model) {
                model.vowels.remove(data);
                model.consonants.remove(data);
                model.target.push(data);
            }
        },


        dragHandles: {
            source: ko.observableArray(toDraggables(names)),
            target: ko.observableArray(),
            dragStart: function (item, event) {
                var insideDragHandle = $(event.target).closest('.drag-handle').length > 0;
                if (insideDragHandle) {
                    item.dragging(true);
                    return true;
                } else {
                    return false;
                }
            },
            dragEnd: function (item, event) {
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
            items: ko.observableArray(toDraggables(names)),
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
            }
        },

        scrollWhileDragging: {
            items: ko.observableArray(toDraggables(names)),
            dragStart: function (item) {
                item.dragging(true);
            },
            dragEnd: function (item) {
                item.dragging(false);
            },
            reorder: function (event, dragData, zoneData) {
                if (dragData !== zoneData) {
                    var zoneDataIndex = model.scrollWhileDragging.items.indexOf(zoneData);
                    model.scrollWhileDragging.items.remove(dragData);
                    model.scrollWhileDragging.items.splice(zoneDataIndex, 0, dragData);
                }
            }
        }
    };
    ko.applyBindings(model, $('.demo')[0]);
}($, ko));

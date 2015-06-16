/*global ko*/
(function (ko) {
    function matches(element, selector) {
        if(!element.tagName) {
            return null;
        }
        var docEl = document.documentElement;
        var match = docEl.matches || docEl.matchesSelector || docEl.webkitMatchesSelector || docEl.mozMatchesSelector || docEl.msMatchesSelector || docEl.oMatchesSelector;
        return match.call(element, selector);
    }

    function getClosest(element, selector) {
        do {
            if (matches(element, selector)) {
                return element;
            }
            element = element.parentNode;
        } while (element);
        return null;
    }

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

    function extendConstructor(Constructor) {
        function ExtendedConstructor() {
            Constructor.apply(this, arguments);
        }
        ko.utils.extend(ExtendedConstructor.prototype, Constructor.prototype);
        return ExtendedConstructor;
    }

    function DragDropView(items) {
        items = items || [];
        this.source = ko.observableArray([].concat(items));
        this.target = ko.observableArray();
    }


    var SimpleView = extendConstructor(DragDropView);

    SimpleView.prototype.dropFromSource = function (data, model) {
        model.source.remove(data);
        model.target.push(data);
    };

    SimpleView.prototype.dropFromTarget = function (data, model) {
        model.target.remove(data);
        model.source.push(data);
    };

    var StylingView = extendConstructor(SimpleView);

    StylingView.prototype.dragStart = function (item) {
        item.dragging(true);
    };

    StylingView.prototype.dragEnd = function (item) {
        item.dragging(false);
    };

    function DragDropArea(items) {
        items = items || [];
        this.items = ko.observableArray([].concat(items));
    }

    DragDropArea.prototype.dragStart = function (data) {
        data.selection = getSelectedItems(data.items);
        if (!data.item.isSelected()) {
            clearSelection(data.selection);
            data.item.isSelected(true);
            data.selection = [data.item];
        }
        ko.utils.arrayForEach(data.selection, function (item) {
            item.dragging(true);
        });
    };

    DragDropArea.prototype.dragEnd = function (data) {
        ko.utils.arrayForEach(data.selection, function (item) {
            item.dragging(false);
        });
    };

    DragDropArea.prototype.drop = function (data, model) {
        clearSelection(data.selection);
        data.items.removeAll(data.selection);
        ko.utils.arrayPushAll(model.items, data.selection);
    };

    var RejectionView = extendConstructor(StylingView);
    RejectionView.prototype.dragEnter = function (event, data, model) {
        return data.startsWithVowel();
    };

    var DragHandlesView = extendConstructor(StylingView);
    DragHandlesView.prototype.dragStart = function (item, event) {
        var insideDragHandle = getClosest(event.target, '.drag-handle') !== null;
        if (insideDragHandle) {
            item.dragging(true);
            return true;
        } else {
            return false;
        }
    };

    function SortableView(items) {
        items = items || [];
        this.items = ko.observableArray([].concat(items));
    }

    SortableView.prototype.dragStart = function (item) {
        item.dragging(true);
    };

    SortableView.prototype.dragEnd = function (item) {
        item.dragging(false);
    };

    SortableView.prototype.reorder = function (event, dragData, zoneData) {
        if (dragData !== zoneData.item) {
            var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
            zoneData.items.remove(dragData);
            zoneData.items.splice(zoneDataIndex, 0, dragData);
        }
    };

    var mainView = {
        simple: new SimpleView(names),
        dragElement: new SimpleView(names),
        styling: new StylingView(toDraggables(names)),
        payload: {
            source: new DragDropArea(toDraggables(names)),
            target: new DragDropArea()
        },
        rejectDrop: new RejectionView(toDraggables(names)),
        dragZones: {
            vowels: new DragDropArea(toDraggables(names).filter(function (draggable) {
                return draggable.startsWithVowel();
            })),
            consonants: new DragDropArea(toDraggables(names).filter(function (draggable) {
                return !draggable.startsWithVowel();
            })),
            target: new DragDropArea()
        },
        dragHandles: new DragHandlesView(toDraggables(names)),
        sortable: new SortableView(toDraggables(names)),
        scrollWhileDragging: new SortableView(toDraggables(names.concat([
            'Noah', 'Emma', 'Liam', 'Olivia', 'Mason', 'Sophia',
            'Jacob', 'Isabella', 'William', 'Ava', 'Ethan', 'Mia',
            'Michael', 'Emily', 'Alexander', 'Abigail', 'James',
            'Madison', 'Daniel', 'Charlotte'
        ])))
    };
    ko.applyBindings(mainView, document.querySelector('.demo'));
}(ko));

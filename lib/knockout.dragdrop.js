/*global ko, jQuery*/

// Github repository: https://github.com/One-com/knockout-dragdrop
// License: standard 3-clause BSD license https://raw.github.com/One-com/knockout-dragdrop/master/LICENSE

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "jquery"], factory);
    } else {
        // <script> tag: use the global `ko` and `jQuery`
        factory(ko, jQuery);
    }
})(function (ko, $) {
    var dropZones = {};
    var eventZones = {};

    var forEach = ko.utils.arrayForEach;
    var first = ko.utils.arrayFirst;
    var filter = ko.utils.arrayFilter;

    function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }

        return out;
    }

    function toggleClass(element, className, addOrRemove) {
        var classes = element.className.split(' ');
        var existingIndex = classes.indexOf(className);
        if (existingIndex >= 0 && !addOrRemove) {
            classes.splice(existingIndex, 1);
        }
        if (existingIndex < 0 && addOrRemove) {
            classes.push(className);
        }
        element.className = classes.join(' ');
    }

    function matches(element, selector) {
        if (!element.tagName) {
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

    function Zone(args) {
        this.init(args);
    }

    Zone.prototype.init = function (args) {
        this.element = args.element;
        this.$element = $(args.element);
        this.data = args.data;
        this.dragEnter = args.dragEnter;
        this.dragOver = args.dragOver;
        this.dragLeave = args.dragLeave;
        this.active = false;
        this.inside = false;
        this.dirty = false;
    };

    Zone.prototype.refreshDomInfo = function () {
        var $element = this.$element;
        this.hidden = $element.css('display') === 'none';
        if (!this.hidden) {
            var offset = $element.offset();
            this.top = offset.top;
            this.left = offset.left;
            this.width = $element.outerWidth();
            this.height = $element.outerHeight();
        }
    };

    Zone.prototype.isInside = function (x, y) {
        if (this.hidden) {
            return false;
        }

        if (x < this.left || y < this.top) {
            return false;
        }

        if (this.left + this.width < x) {
            return false;
        }

        if (this.top + this.height < y) {
            return false;
        }
        return true;
    };

    Zone.prototype.update = function (event, data) {
        if (this.isInside(event.pageX, event.pageY)) {
            if (!this.inside) {
                this.enter(event, data);
            }

            if (this.dragOver) {
                this.dragOver(event, data, this.data);
            }
        } else {
            this.leave(event);
        }
    };

    Zone.prototype.enter = function (event, data) {
        this.inside = true;
        if (this.dragEnter) {
            this.active = this.dragEnter(event, data, this.data) !== false;
        } else {
            this.active = true;
        }
        this.dirty = true;
    };

    Zone.prototype.leave = function (event) {
        if (event) {
            event.target = this.element;
        }

        if (this.inside && this.dragLeave) {
            this.dragLeave(event, this.data);
        }
        this.active = false;
        this.inside = false;
        this.dirty = true;
    };

    function DropZone(args) {
        this.init(args);
        this.drop = function (data) {
            args.drop(data, args.data);
        };
    }
    DropZone.prototype = Zone.prototype;

    DropZone.prototype.updateStyling = function () {
        if (this.dirty) {
            this.$element.toggleClass('drag-over', this.active);
            this.$element.toggleClass('drop-rejected', this.inside && !this.active);
        }
        this.dirty = false;
    };

    function DragElement($element) {
        this.$element = $element;
        this.$element.addClass('drag-element').css({
            'position': 'fixed',
            'z-index': 9998
        });
        this.$element.on('selectstart', false);
    }

    DragElement.prototype.updatePosition = function (event) {
        this.$element.offset({
            'top': event.pageY,
            'left': event.pageX
        });
    };

    DragElement.prototype.remove = function () {
        this.$element.remove();
    };

    function Draggable(args) {
        this.name = args.name;
        this.dragStart = args.dragStart;
        this.dragEnd = args.dragEnd;
        this.data = args.data;
    }

    Draggable.prototype.startDrag = function (event) {
        if (this.dragStart && this.dragStart(this.data, event) === false) {
            return false;
        }
    };

    Draggable.prototype.drag = function (event) {
        var that = this;
        var name = this.name;
        var zones = dropZones[name].concat(eventZones[name]);

        forEach(zones, function (zone) {
            zone.refreshDomInfo();
        });

        forEach(zones, function (zone) {
            event.target = zone.element;
            zone.update(event, that.data);
        });

        forEach(dropZones[name], function (zone) {
            zone.updateStyling();
        });
    };

    Draggable.prototype.dropRejected = function () {
        var name = this.name;
        var insideAZone = first(dropZones[name], function (zone) {
            return zone.inside;
        });
        if (!insideAZone) {
            return false;
        }
        var noActiveZone = !first(dropZones[name], function (zone) {
            return zone.active;
        });
        return noActiveZone;
    };

    Draggable.prototype.cancelDrag = function (event) {
        if (this.dragEnd) {
            this.dragEnd(this.data, event);
        }
    };

    Draggable.prototype.drop = function (event) {
        var name = this.name;

        var dropZoneElement = $(event.target).closest('.drop-zone');
        var activeZones = filter(dropZones[name], function (zone) {
            return zone.active;
        });
        var winningDropZone = filter(activeZones, function (zone) {
            return zone.$element.is(dropZoneElement);
        })[0];

        forEach(dropZones[name].concat(eventZones[name]), function (zone) {
            zone.leave(event);
        });

        forEach(dropZones[name], function (zone) {
            zone.updateStyling();
        });

        if (this.dragEnd) {
            this.dragEnd(this.data, event);
        }

        if (winningDropZone && winningDropZone.drop) {
            winningDropZone.drop(this.data);
        }
    };

    function ScrollArea(element) {
        this.element = element;
        this.$element = $(element);
        this.scrollMargin = Math.floor(this.$element.innerHeight() / 10);
        this.offset = this.$element.offset();
        this.innerHeight = this.$element.innerHeight();
        this.scrollDeltaMin = 5;
        this.scrollDeltaMax = 30;
    }

    ScrollArea.prototype.scroll = function (x, y) {
        var topLimit = this.scrollMargin + this.offset.top;
        var speed, scrollDelta;
        if (y < topLimit) {
            speed = (topLimit - y) / this.scrollMargin;
            scrollDelta = speed * (this.scrollDeltaMax - this.scrollDeltaMin) + this.scrollDeltaMin;
            this.element.scrollTop -= scrollDelta;
        }

        var bottomLimit = this.offset.top + this.innerHeight - this.scrollMargin;
        if (y > bottomLimit) {
            speed = (y - bottomLimit) / this.scrollMargin;
            scrollDelta = speed * (this.scrollDeltaMax - this.scrollDeltaMin) + this.scrollDeltaMin;
            this.element.scrollTop += scrollDelta;
        }
    };

    function getAcceptedDragZones(options) {
        if (options.accepts) {
            return [].concat(options.accepts);
        } else if (options.name) {
            // options.name is deprecated
            return [options.name];
        } else {
            throw new Error('A drop zone must specify the drag zones it accepts');
        }
    }

    ko.utils.extend(ko.bindingHandlers, {
        dropZone: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(valueAccessor());
                var accepts = getAcceptedDragZones(options);

                $(element).addClass('drop-zone');

                var zone = new DropZone({
                    element: element,
                    data: bindingContext && bindingContext.$data,
                    drop: options.drop,
                    dragEnter: options.dragEnter,
                    dragOver: options.dragOver,
                    dragLeave: options.dragLeave
                });

                accepts.forEach(function (zoneName) {
                    dropZones[zoneName] = dropZones[zoneName] || [];
                    dropZones[zoneName].push(zone);
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    zone.leave();
                    accepts.forEach(function (zoneName) {
                        dropZones[zoneName].splice(dropZones[zoneName].indexOf(zone), 1);
                    });
                });
            }
        },

        dragEvents: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(valueAccessor());
                var accepts = getAcceptedDragZones(options);

                var data = options.data ||
                    (bindingContext && bindingContext.$data);

                var zone = new Zone({
                    element: element,
                    data: data,
                    dragEnter: options.dragEnter,
                    dragOver: options.dragOver,
                    dragLeave: options.dragLeave
                });

                accepts.forEach(function (zoneName) {
                    eventZones[zoneName] = eventZones[zoneName] || [];
                    eventZones[zoneName].push(zone);
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    zone.leave();
                    accepts.forEach(function (zoneName) {
                        eventZones[zoneName].splice(eventZones[zoneName].indexOf(zone), 1);
                    });
                });
            }
        },

        dragZone: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(valueAccessor());
                var name = options.name;
                var dragDistance = options.dragDistance || 10;
                dropZones[name] = dropZones[name] || [];
                eventZones[name] = eventZones[name] || [];
                if (!name || typeof name !== 'string') {
                    throw new Error('A drag zone must specify a name');
                }


                var data = options.data ||
                    (bindingContext && bindingContext.$data);

                var draggable = new Draggable({
                    name: name,
                    data: data,
                    dragStart: options.dragStart,
                    dragEnd: options.dragEnd
                });

                function createCloneProxyElement() {
                    var dragProxy = $(element).clone().appendTo($(element).parent());
                    dragProxy.css({
                        height: $(element).height(),
                        width: $(element).width(),
                        opacity: 70 / 100,
                        filter: "alpha(opacity=70"
                    });
                    return dragProxy;
                }

                function createTemplateProxyElement() {
                    var dragProxy = $('<div>').appendTo('body');
                    var innerBindingContext = ('data' in options) ?
                        bindingContext.createChildContext(options.data) :
                        bindingContext;
                    ko.renderTemplate(options.element, innerBindingContext, {}, dragProxy[0]);
                    return dragProxy;
                }

                $(element).on('selectstart', function (e) {
                    if (!$(e.target).is(':input')) {
                        return false;
                    }
                });

                $(element).addClass('draggable');
                $(element).on('mousedown', function (downEvent) {
                    if (downEvent.which !== 1) {
                        return true;
                    }

                    $(document).on('selectstart.drag', false);

                    function startDragging(startEvent) {
                        $(element).off('mouseup.startdrag click.startdrag mouseleave.startdrag mousemove.startdrag');

                        var dragElement = null;
                        if (!options.element) {
                            dragElement = new DragElement(createCloneProxyElement());
                        }

                        if (draggable.startDrag(downEvent) === false) {
                            return false;
                        }

                        var $overlay = $('<div class="drag-overlay" unselectable="on">');
                        $overlay.css({
                            'z-index': 9999,
                            'position': 'fixed',
                            'top': 0,
                            'left': 0,
                            'right': 0,
                            'bottom': 0,
                            'cursor': 'move',
                            'background-color': 'white',
                            'opacity': 0,
                            'filter': "alpha(opacity=0)",
                            '-webkit-user-select': 'none',
                            '-moz-user-select': '-moz-none',
                            '-ms-user-select': 'none',
                            '-o-user-select': 'none',
                            'user-select': 'none'
                        });

                        $overlay.on('selectstart', false);
                        $overlay.appendTo('body');

                        if (options.element) {
                            dragElement = new DragElement(createTemplateProxyElement());
                        }

                        dragElement.updatePosition(downEvent);

                        var dragTimer = null;
                        var dropRejected = false;
                        function drag(event) {
                            draggable.drag(event);
                            if (draggable.dropRejected() !== dropRejected) {
                                $overlay.toggleClass('drop-rejected', draggable.dropRejected());
                                $overlay.css('cursor', draggable.dropRejected() ? 'no-drop' : 'move');
                                dropRejected = draggable.dropRejected();
                            }
                            dragTimer = setTimeout(function () {
                                drag(event);
                            }, 250);
                        }

                        function cancelDrag(e) {
                            $(element).off('mouseup.drag selectstart.drag');
                            clearTimeout(dragTimer);
                            dragElement.remove();
                            $overlay.remove();
                            draggable.cancelDrag(e);
                            return true;
                        }

                        $overlay.on('mousemove.drag', function (moveEvent) {
                            if (moveEvent.which !== 1) {
                                return cancelDrag(moveEvent);
                            }

                            clearTimeout(dragTimer);
                            dragElement.updatePosition(moveEvent);
                            drag(moveEvent);
                            return false;
                        });

                        $overlay.on('mouseup.drag', function (upEvent) {
                            clearTimeout(dragTimer);
                            dragElement.remove();
                            $overlay.remove();
                            upEvent.target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
                            draggable.drop(upEvent);

                            $(document).off('selectstart.drag');
                            return false;
                        });
                    }

                    $(element).one('mouseup.startdrag click.startdrag mouseleave.startdrag', function (event) {
                        $(element).off('mousemove.startdrag');
                        $(document).off('selectstart.drag');
                        return true;
                    });

                    $(element).on('mousemove.startdrag', function (event) {
                        if ($(event.target).is(':input')) {
                            return;
                        }

                        var distance = Math.sqrt(Math.pow(downEvent.pageX - event.pageX, 2) +
                                                 Math.pow(downEvent.pageY - event.pageY, 2));
                        if (distance > dragDistance) {
                            startDragging(event);
                        }
                    });

                    return true;
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(document).off('selectstart.drag');
                });
            }
        },

        scrollableOnDragOver: {
            // TODO make this binding scroll on the x-axis as well
            init: function (element, valueAccessor, allBindingAccessor) {
                var options = ko.utils.unwrapObservable(valueAccessor());
                if (typeof options === 'string' || Array.isArray(options)) {
                    options = { accepts: options };
                }
                options.delay = options.delay || 0;
                var accepts = getAcceptedDragZones(options);

                var scrollArea = null;
                var x, y;
                var timer;

                function scroll() {
                    scrollArea.scroll(x, y);
                }
                function dragEnter(e) {
                    scrollArea = new ScrollArea(element);
                    timer = setInterval(scroll, 100);
                }

                function dragOver(e) {
                    x = e.pageX;
                    y = e.pageY;
                }

                function dragLeave(e) {
                    clearTimeout(timer);
                }

                ko.bindingHandlers.dragEvents.init(element, function () {
                    return {
                        accepts: accepts,
                        dragEnter: dragEnter,
                        dragOver: dragOver,
                        dragLeave: dragLeave
                    };
                });
            }
        }
    });
});

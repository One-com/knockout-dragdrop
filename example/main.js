/*global $, ko*/
(function ($, ko) {
    var model = {
        source: ko.observableArray([
			'Declan',
			'Tessa',
			'Claire',
			'Violet',
			'Alice',
			'Mia',
			'Camille',
			'Aiden'
        ]),
        target: ko.observableArray(),
        dropFromSource: function (data, model) {
            model.source.remove(data);
            model.target.push(data);
        },
        dropFromTarget: function (data, model) {
            model.target.remove(data);
            model.source.push(data);
        }
    };
    ko.applyBindings(model, $('.demo')[0]);
}($, ko));

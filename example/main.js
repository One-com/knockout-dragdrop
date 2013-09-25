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
        drop: function (data, model) {
            model.source.remove(data);
            model.target.push(data);
        }
    };
    ko.applyBindings(model, $('.demo')[0]);
}($, ko));

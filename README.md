# knockout-dragdrop

A drag and drop binding for Knockout.

[Click here to see an example](http://one-com.github.io/knockout-dragdrop/examples/)

## Install

### NPM

`npm install knockout-dragdrop`

### Bower

`bower install knockout-dragdrop`

## Usage

Dragging between two lists:

```html
<h2>Drag from here</h2>
<ul data-bind="foreach: source">
    <li data-bind="text: $data, dragZone: { name: 'lists' }"></li>
</ul>

<h2>Drop here</h2>
<ul data-bind="foreach: target, dropZone: { accepts: 'lists', drop: drop }">
    <li data-bind="text: $data"></li>
</ul>
```

```js
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
ko.applyBindings(model);
```

## Running the example locally

Run the following command:

```
npm install && bower install && serve
```

and open [http://localhost:3000](http://localhost:3000) in your browser.

## License

Knockout.dragdrop is licensed under a standard 3-clause BSD license -- see the `LICENSE`-file for details.

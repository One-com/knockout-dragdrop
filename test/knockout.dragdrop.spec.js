var expect = window.weknowhow.expect;

describe('knockout.dragdrop', function () {
    it('attaches the binding handlers', function () {
        expect(ko.bindingHandlers, 'to have keys', ['dropZone', 'dragEvents', 'dragZone', 'scrollableOnDragOver']);
    });
});
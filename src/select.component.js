"use strict";
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var style_1 = require('./style');
exports.SELECT_VALUE_ACCESSOR = { provide: forms_1.NG_VALUE_ACCESSOR,
    useExisting: core_1.forwardRef(function () { return SelectComponent; }),
    multi: true
};
var SelectComponent = (function () {
    function SelectComponent() {
        // Class names.
        this.S2 = 'select2';
        this.S2_CONTAINER = this.S2 + '-container';
        this.S2_SELECTION = this.S2 + '-selection';
        this.opened = new core_1.EventEmitter();
        this.closed = new core_1.EventEmitter();
        this.selected = new core_1.EventEmitter();
        this.deselected = new core_1.EventEmitter();
        // State variables.
        this.isDisabled = false;
        this.isBelow = true;
        this.isOpen = false;
        this.hasFocus = false;
        // Select options.
        this.optionValues = [];
        this.optionsDict = {};
        this.selection = [];
        this.value = [];
        this.onChange = function (_) { };
        this.onTouched = function () { };
        /***************************************************************************
         * Keys.
         **************************************************************************/
        this.KEYS = {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            SPACE: 32,
            UP: 38,
            DOWN: 40
        };
    }
    /***************************************************************************
     * Event handlers.
     **************************************************************************/
    SelectComponent.prototype.ngOnInit = function () {
        this.init();
    };
    SelectComponent.prototype.ngOnChanges = function (changes) {
        this.init();
    };
    SelectComponent.prototype.onSelectionClick = function (event) {
        this.toggleDropdown();
        if (this.multiple) {
            this.searchInput.nativeElement.focus();
        }
        event.stopPropagation();
    };
    /**
     * Event handler of the single select clear (x) button click. It is assumed
     * that there is exactly one item selected.
     *
     * The `deselect` method is used instead of `clear`, to heve the deselected
     * event emitted.
     */
    SelectComponent.prototype.onClearClick = function (event) {
        this.deselect(this.selection[0].value);
        event.stopPropagation();
    };
    SelectComponent.prototype.onClearItemClick = function (event) {
        this.deselect(event.target.dataset.value);
        event.stopPropagation();
    };
    SelectComponent.prototype.onToggleSelect = function (optionValue) {
        this.toggleSelect(optionValue);
    };
    SelectComponent.prototype.onClose = function (focus) {
        this.close(focus);
    };
    SelectComponent.prototype.onWindowClick = function () {
        this.close(false);
    };
    SelectComponent.prototype.onWindowResize = function () {
        this.updateWidth();
    };
    SelectComponent.prototype.onKeydown = function (event) {
        this.handleKeyDown(event);
    };
    SelectComponent.prototype.onInput = function (event) {
        var _this = this;
        // Open dropdown, if it is currently closed.
        if (!this.isOpen) {
            this.open();
            // HACK
            setTimeout(function () {
                _this.handleInput(event);
            }, 100);
        }
        else {
            this.handleInput(event);
        }
    };
    SelectComponent.prototype.onSearchKeydown = function (event) {
        this.handleSearchKeyDown(event);
    };
    /***************************************************************************
     * Initialization.
     **************************************************************************/
    SelectComponent.prototype.init = function () {
        this.initOptions();
        this.initDefaults();
    };
    SelectComponent.prototype.initOptions = function () {
        var values = [];
        var opts = {};
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var option = _a[_i];
            var selected = false;
            var existingOption = this.optionsDict[option.value];
            if (typeof existingOption !== 'undefined') {
                selected = existingOption.selected;
            }
            opts[option.value] = {
                value: option.value,
                disabled: option.disabled,
                label: option.label,
                selected: selected
            };
            values.push(option.value);
        }
        this.optionValues = values;
        this.optionsDict = opts;
        this.updateSelection();
    };
    SelectComponent.prototype.initDefaults = function () {
        if (typeof this.multiple === 'undefined') {
            this.multiple = false;
        }
        if (typeof this.theme === 'undefined') {
            this.theme = 'default';
        }
        if (typeof this.allowClear === 'undefined') {
            this.allowClear = false;
        }
    };
    /***************************************************************************
     * Dropdown toggle.
     **************************************************************************/
    SelectComponent.prototype.toggleDropdown = function () {
        if (!this.isDisabled) {
            this.isOpen ? this.close(true) : this.open();
        }
    };
    SelectComponent.prototype.open = function () {
        if (!this.isOpen) {
            this.updateWidth();
            this.updatePosition();
            this.isOpen = true;
            this.opened.emit(null);
        }
    };
    SelectComponent.prototype.close = function (focus) {
        if (this.isOpen) {
            this.isOpen = false;
            if (focus) {
                this.focus();
            }
            this.closed.emit(null);
        }
    };
    /***************************************************************************
     * Select.
     **************************************************************************/
    SelectComponent.prototype.toggleSelect = function (value) {
        if (!this.multiple && this.selection.length > 0) {
            this.selection[0].selected = false;
        }
        this.optionsDict[value].selected ?
            this.deselect(value) : this.select(value);
        if (this.multiple) {
            this.searchInput.nativeElement.value = '';
            this.searchInput.nativeElement.focus();
        }
        else {
            this.focus();
        }
    };
    SelectComponent.prototype.select = function (value) {
        this.optionsDict[value].selected = true;
        this.updateSelection();
        this.selected.emit(this.optionsDict[value]);
    };
    SelectComponent.prototype.deselect = function (value) {
        this.optionsDict[value].selected = false;
        this.updateSelection();
        this.deselected.emit(this.optionsDict[value]);
    };
    SelectComponent.prototype.updateSelection = function () {
        var s = [];
        var v = [];
        for (var _i = 0, _a = this.optionValues; _i < _a.length; _i++) {
            var optionValue = _a[_i];
            if (this.optionsDict[optionValue].selected) {
                var opt = this.optionsDict[optionValue];
                s.push(opt);
                v.push(opt.value);
            }
        }
        this.selection = s;
        this.value = v;
        // TODO first check if value has changed?
        this.onChange(this.getOutputValue());
    };
    SelectComponent.prototype.popSelect = function () {
        if (this.selection.length > 0) {
            this.selection[this.selection.length - 1].selected = false;
            this.updateSelection();
            this.onChange(this.getOutputValue());
        }
    };
    SelectComponent.prototype.clear = function () {
        for (var item in this.optionsDict) {
            this.optionsDict[item].selected = false;
        }
        this.selection = [];
        this.value = [];
        // TODO first check if value has changed?
        this.onChange(this.getOutputValue());
    };
    SelectComponent.prototype.getOutputValue = function () {
        if (this.multiple) {
            return this.value.length === 0 ? '' : this.value.slice(0);
        }
        else {
            return this.value.length === 0 ? '' : this.value[0];
        }
    };
    /***************************************************************************
     * ControlValueAccessor interface methods.
     **************************************************************************/
    SelectComponent.prototype.writeValue = function (value) {
        if (typeof value === 'undefined' || value === null || value === '') {
            value = this.multiple ? [] : '';
        }
        for (var item in this.optionsDict) {
            this.optionsDict[item].selected = false;
        }
        if (this.multiple) {
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var item = value_1[_i];
                this.optionsDict[item].selected = true;
            }
        }
        else if (value !== '') {
            this.optionsDict[value].selected = true;
        }
        this.updateSelection();
    };
    SelectComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    SelectComponent.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    SelectComponent.prototype.handleKeyDown = function (event) {
        var key = event.which;
        if (key === this.KEYS.ENTER || key === this.KEYS.SPACE ||
            (key === this.KEYS.DOWN && event.altKey)) {
            this.open();
            event.preventDefault();
        }
    };
    SelectComponent.prototype.handleInput = function (event) {
        this.dropdown.filter(event.target.value);
    };
    SelectComponent.prototype.handleSearchKeyDown = function (event) {
        var key = event.which;
        if (key === this.KEYS.ENTER) {
            if (typeof this.dropdown !== 'undefined') {
                var hl = this.dropdown.highlighted;
                if (hl !== null) {
                    this.onToggleSelect(hl.value);
                }
            }
        }
        else if (key === this.KEYS.BACKSPACE) {
            if (this.searchInput.nativeElement.value === '') {
                this.popSelect();
            }
        }
        else if (key === this.KEYS.UP) {
            if (typeof this.dropdown === 'undefined') {
                this.open();
            }
            else {
                this.dropdown.highlightPrevious();
            }
        }
        else if (key === this.KEYS.DOWN) {
            if (typeof this.dropdown === 'undefined') {
                this.open();
            }
            else {
                this.dropdown.highlightNext();
            }
        }
        else if (key === this.KEYS.ESC) {
            this.close(true);
        }
    };
    /***************************************************************************
     * Layout/Style/Classes/Focus.
     **************************************************************************/
    SelectComponent.prototype.focus = function () {
        this.hasFocus = true;
        if (this.multiple) {
            this.searchInput.nativeElement.focus();
        }
        else {
            this.selectionSpan.nativeElement.focus();
        }
    };
    SelectComponent.prototype.blur = function () {
        this.hasFocus = false;
        this.selectionSpan.nativeElement.blur();
    };
    SelectComponent.prototype.updateWidth = function () {
        this.width = this.container.nativeElement.offsetWidth;
    };
    SelectComponent.prototype.updatePosition = function () {
        var e = this.container.nativeElement;
        this.left = e.offsetLeft;
        this.top = e.offsetTop + e.offsetHeight;
    };
    SelectComponent.prototype.getContainerClass = function () {
        var result = {};
        result[this.S2] = true;
        var c = this.S2_CONTAINER;
        result[c] = true;
        result[c + '--open'] = this.isOpen;
        result[c + '--focus'] = this.hasFocus;
        result[c + '--' + this.theme] = true;
        result[c + '--' + (this.isBelow ? 'below' : 'above')] = true;
        return result;
    };
    SelectComponent.prototype.getSelectionClass = function () {
        var result = {};
        var s = this.S2_SELECTION;
        result[s] = true;
        result[s + '--' + (this.multiple ? 'multiple' : 'single')] = true;
        return result;
    };
    SelectComponent.prototype.showPlaceholder = function () {
        return typeof this.placeholder !== 'undefined' &&
            this.selection.length === 0;
    };
    SelectComponent.prototype.getPlaceholder = function () {
        return this.showPlaceholder() ? this.placeholder : '';
    };
    SelectComponent.prototype.getInputStyle = function () {
        var width;
        if (typeof this.searchInput === 'undefined') {
            width = 200;
        }
        else if (this.showPlaceholder() &&
            this.searchInput.nativeElement.value.length === 0) {
            width = 10 + 10 * this.placeholder.length;
        }
        else {
            width = 10 + 10 * this.searchInput.nativeElement.value.length;
        }
        return {
            'width': width + 'px'
        };
    };
    SelectComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ng-select',
                    template: "\n<div style=\"width:100%;position:relative;\">\n    <span style=\"width:100%\"\n        #container\n        [ngClass]=\"getContainerClass()\"\n        (window:resize)=\"onWindowResize()\"\n        (window:click)=\"onWindowClick()\">\n        <span class=\"selection\">\n            <span tabindex=0\n                #selectionSpan\n                [ngClass]=\"getSelectionClass()\"\n                (click)=\"onSelectionClick($event)\"\n                (keydown)=\"onKeydown($event)\">\n\n                <span class=\"select2-selection__rendered\"\n                    *ngIf=\"!multiple\">\n                    <span class=\"select2-selection__placeholder\">\n                        {{getPlaceholder()}}\n                    </span>\n                </span>\n\n                <span class=\"select2-selection__rendered\"\n                    *ngIf=\"!multiple && selection.length > 0\">\n                    <span class=\"select2-selection__clear\"\n                        *ngIf=\"allowClear\"\n                        (click)=\"onClearClick($event)\">\n                        x\n                    </span>\n                    {{selection[0].label}}\n                </span>\n\n                <ul class=\"select2-selection__rendered\"\n                    *ngIf=\"multiple\">\n                    <li class=\"select2-selection__choice\" title=\"{{option.label}}\"\n                        *ngFor=\"let option of selection\">\n                        <span class=\"select2-selection__choice__remove\"\n                            [attr.data-value]=\"option.value\"\n                            (click)=onClearItemClick($event)>\n                            \u00D7</span>\n                        {{option.label}}\n                    </li>\n                    <li class=\"select2-search select2-search--inline\">\n                        <input class=\"select2-search__field\"\n                            #searchInput\n                            placeholder=\"{{getPlaceholder()}}\"\n                            [ngStyle]=\"getInputStyle()\"\n                            (input)=\"onInput($event)\"\n                            (keydown)=\"onSearchKeydown($event)\"/>\n                    </li>\n                </ul>\n\n                <span class=\"select2-selection__arrow\">\n                    <b></b>\n                </span>\n            </span>\n        </span>\n    </span>\n    <select-dropdown\n        *ngIf=\"isOpen\"\n        #dropdown\n        [multiple]=\"multiple\"\n        [optionValues]=\"optionValues\"\n        [optionsDict]=\"optionsDict\"\n        [selection]=\"selection\"\n        [width]=\"width\"\n        [top]=\"top\"\n        [left]=\"left\"\n        (toggleSelect)=\"onToggleSelect($event)\"\n        (close)=\"onClose($event)\">\n    </select-dropdown>\n</div>\n",
                    styles: [
                        style_1.DEFAULT_STYLES
                    ],
                    encapsulation: core_1.ViewEncapsulation.None,
                    providers: [
                        exports.SELECT_VALUE_ACCESSOR
                    ]
                },] },
    ];
    /** @nocollapse */
    SelectComponent.ctorParameters = [];
    SelectComponent.propDecorators = {
        'options': [{ type: core_1.Input },],
        'theme': [{ type: core_1.Input },],
        'multiple': [{ type: core_1.Input },],
        'placeholder': [{ type: core_1.Input },],
        'allowClear': [{ type: core_1.Input },],
        'opened': [{ type: core_1.Output },],
        'closed': [{ type: core_1.Output },],
        'selected': [{ type: core_1.Output },],
        'deselected': [{ type: core_1.Output },],
        'container': [{ type: core_1.ViewChild, args: ['container',] },],
        'selectionSpan': [{ type: core_1.ViewChild, args: ['selectionSpan',] },],
        'dropdown': [{ type: core_1.ViewChild, args: ['dropdown',] },],
        'searchInput': [{ type: core_1.ViewChild, args: ['searchInput',] },],
    };
    return SelectComponent;
}());
exports.SelectComponent = SelectComponent;

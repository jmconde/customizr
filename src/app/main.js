import classes from "./defaults.js";

export default class Customizr {
    constructor (options) {
        this._setOptions(options);
        this._preloadImages().then(() => {
            this.$target = $(options.target).addClass(classes.BASE_CLASS);
            this.$filter = $(options.filter);
            this.options.showTitle && this._setTitle();
            this._setMainControl();
            this._setTypes();
        });
    }

    value () {
        var values = [];
        $(`.${classes.LAYER}`).each(function () {
            values.push($(this).data("value"));
        });
        return values;
    }

    _setOptions (options) {
        var defaults = {
            showTitle: true
        }
        this.options = $.extend(defaults, options)
    }

    _setTitle () {
        this.$title = $("<div></div>")
            .addClass(classes.TITLE)
            .appendTo(this.$target);
    }

    _setTypes () {
        var types = this.options.types,
            activeId = types[0].id;

        this.$type = $("<section></section>")
            .addClass(classes.TYPE)
            .addClass(activeId)
            .appendTo(this.$target)
            .data("active", activeId);

        this._setActiveType(activeId);
    }

    _setMainControl (options) {
        var types = this.options.types,
            activeId, options, $control;

        if (types.length < 2) {
            return;
        }

        activeId = types[0].id;
        options = [];
        $control = this._getControl(classes.MAIN_CONTROL, this.options.typesText, true);

        types.forEach((type) => {
            options.push({id: type.id, text: type.text});
        });

        this._appendOptions($control.find("select"), options, activeId);
        $control.find("select").on("change", (ev) => {
            this._setActiveType($(ev.currentTarget).val());
        });
    }

    _getControl (id, label, main) {
        return $("<p></p>")
            .append("<label for'" + id + "'>" + label + "</label>")
            .append("<select id='" + id + "'></select>")
            .addClass(main ? classes.MAIN_CONTROL : classes.CONTROL)
            .appendTo(this.$filter);
    }

    _setActiveType (activeType) {
        var type = this.options.types.filter(function (type) {
                return type.id === activeType;
            })[0],
            layers = type.layers;

        this.options.showTitle && this.$title.html(type.text);
        this.$type.removeClass(this.$type.data("active"));
        this.$type.addClass(activeType).data("active", activeType);
        this._appendLayers(layers);
    }

    _preloadImages () {
        var allImages = $.map(this.options.types, (type) => {
            return [type.image].concat($.map(type.layers, (layer, i) => {
                    return $.map(layer.options, function (option) {
                        return option.image;
                    });
                }));
            }),
            deferred = $.Deferred(),
            promises = [];
        allImages.forEach((image) => {
            promises.push(this._loadImage(image));
        });

        $.when(promises).then(function () {
            deferred.resolve();
        });

        return deferred.promise();
    }

    _loadImage (src) {
        var deferred = $.Deferred();
        var image = new Image();
        image.src = "images/"+src;
        image.onload = () => deferred.resolve();
        image.onerror = () => deferred.reject("Image: " + src + " Not Found.");
        return deferred.promise();
    }

    _appendLayers (layers) {
        var $type = this.$type.empty();
        $(`.${classes.CONTROL}`).remove();
        layers.forEach((layer, i) => {
            var $layer = $("<div></div>")
                    .addClass(classes.LAYER)
                    .addClass(classes.LAYER + "-" + i)
                    .addClass(layer.class)
                    .appendTo($type),
                $control = this._getControl(classes.CONTROL + "-" + i, layer.label);
            this._appendOptions($control.find("select"), layer.options, layer.defaultOption, layer.defaultText);

            $control.find("select").unbind().on("change", (ev) => {
                this._setActive($layer, $(ev.currentTarget).val());
            });

            if (layer.defaultOption && typeof layer.defaultOption === "string") {
                this._setActive($layer, layer.defaultOption);
            }
        });
    }

    _setActive ($layer, value) {
        if ($layer.data("value")) {
            var $clonedLayer = $layer.clone().css("z-index", $layer.css("z-index") - 1);
            $layer.before($clonedLayer);
            $layer.removeClass(classes.VISIBLE)
                .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', (e) => {
                    $layer.removeClass($layer.data("value"))
                    this._showLayer($layer, value);
                    $clonedLayer.removeClass("visible")
                        .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', (e) => {
                            $clonedLayer.remove();
                        });
                });;
        } else {
            this._showLayer($layer, value);
        }
    }

    _showLayer ($layer, value) {
        $layer.data("value", value)
            .addClass(value)
            .addClass(classes.VISIBLE);
    }

    // añade opciones al select
    _appendOptions ($control, options, defaultOption, defaultText) {
        $control.empty();
        if (!defaultOption) {
            var texto =  defaultText || "Selecciona una opción";
            $control.append("<option value='' selected> " + texto + " </option>")
        }
        options.forEach(function (option) {
            if (defaultOption === option.id){
                $control.append("<option value='" + option.id + "' selected> " + option.text + " </option>")
            } else {
                $control.append("<option value='" + option.id + "'> " + option.text + " </option>")
            }
        });
    }
}

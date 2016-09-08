(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Customizr = factory());
}(this, function () { 'use strict';

  var BASE = "customizr";

  var classes = {
      BASE_CLASS: BASE + "-base",
      LAYER: BASE + "-layer",
      TYPE: BASE + "-type",
      MAIN_CONTROL: BASE + "-main-control",
      CONTROL: BASE + "-filter-control",
      VISIBLE: "visible",
      TITLE: BASE + "title"
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Customizr = function () {
      function Customizr(options) {
          var _this = this;

          classCallCheck(this, Customizr);

          this._setOptions(options);
          this._preloadImages().then(function () {
              _this.$target = $(options.target).addClass(classes.BASE_CLASS);
              _this.$filter = $(options.filter);
              _this.options.showTitle && _this._setTitle();
              _this._setMainControl();
              _this._setTypes();
          });
      }

      createClass(Customizr, [{
          key: "value",
          value: function value() {
              var values = [];
              $("." + classes.LAYER).each(function () {
                  values.push($(this).data("value"));
              });
              return values;
          }
      }, {
          key: "_setOptions",
          value: function _setOptions(options) {
              var defaults = {
                  showTitle: true
              };
              this.options = $.extend(defaults, options);
          }
      }, {
          key: "_setTitle",
          value: function _setTitle() {
              this.$title = $("<div></div>").addClass(classes.TITLE).appendTo(this.$target);
          }
      }, {
          key: "_setTypes",
          value: function _setTypes() {
              var types = this.options.types,
                  activeId = types[0].id;

              this.$type = $("<section></section>").addClass(classes.TYPE).addClass(activeId).appendTo(this.$target).data("active", activeId);

              this._setActiveType(activeId);
          }
      }, {
          key: "_setMainControl",
          value: function _setMainControl(options) {
              var _this2 = this;

              var types = this.options.types,
                  activeId,
                  options,
                  $control;

              if (types.length < 2) {
                  return;
              }

              activeId = types[0].id;
              options = [];
              $control = this._getControl(classes.MAIN_CONTROL, this.options.typesText, true);

              types.forEach(function (type) {
                  options.push({ id: type.id, text: type.text });
              });

              this._appendOptions($control.find("select"), options, activeId);
              $control.find("select").on("change", function (ev) {
                  _this2._setActiveType($(ev.currentTarget).val());
              });
          }
      }, {
          key: "_getControl",
          value: function _getControl(id, label, main) {
              return $("<p></p>").append("<label for'" + id + "'>" + label + "</label>").append("<select id='" + id + "'></select>").addClass(main ? classes.MAIN_CONTROL : classes.CONTROL).appendTo(this.$filter);
          }
      }, {
          key: "_setActiveType",
          value: function _setActiveType(activeType) {
              var type = this.options.types.filter(function (type) {
                  return type.id === activeType;
              })[0],
                  layers = type.layers;

              this.options.showTitle && this.$title.html(type.text);
              this.$type.removeClass(this.$type.data("active"));
              this.$type.addClass(activeType).data("active", activeType);
              this._appendLayers(layers);
          }
      }, {
          key: "_preloadImages",
          value: function _preloadImages() {
              var _this3 = this;

              var allImages = $.map(this.options.types, function (type) {
                  return [type.image].concat($.map(type.layers, function (layer, i) {
                      return $.map(layer.options, function (option) {
                          return option.image;
                      });
                  }));
              }),
                  deferred = $.Deferred(),
                  promises = [];
              allImages.forEach(function (image) {
                  promises.push(_this3._loadImage(image));
              });

              $.when(promises).then(function () {
                  deferred.resolve();
              });

              return deferred.promise();
          }
      }, {
          key: "_loadImage",
          value: function _loadImage(src) {
              var deferred = $.Deferred();
              var image = new Image();
              image.src = "images/" + src;
              image.onload = function () {
                  return deferred.resolve();
              };
              image.onerror = function () {
                  return deferred.reject("Image: " + src + " Not Found.");
              };
              return deferred.promise();
          }
      }, {
          key: "_appendLayers",
          value: function _appendLayers(layers) {
              var _this4 = this;

              var $type = this.$type.empty();
              $("." + classes.CONTROL).remove();
              layers.forEach(function (layer, i) {
                  var $layer = $("<div></div>").addClass(classes.LAYER).addClass(classes.LAYER + "-" + i).addClass(layer.class).appendTo($type),
                      $control = _this4._getControl(classes.CONTROL + "-" + i, layer.label);
                  _this4._appendOptions($control.find("select"), layer.options, layer.defaultOption, layer.defaultText);

                  $control.find("select").unbind().on("change", function (ev) {
                      _this4._setActive($layer, $(ev.currentTarget).val());
                  });

                  if (layer.defaultOption && typeof layer.defaultOption === "string") {
                      _this4._setActive($layer, layer.defaultOption);
                  }
              });
          }
      }, {
          key: "_setActive",
          value: function _setActive($layer, value) {
              var _this5 = this;

              if ($layer.data("value")) {
                  var $clonedLayer = $layer.clone().css("z-index", $layer.css("z-index") - 1);
                  $layer.before($clonedLayer);
                  $layer.removeClass(classes.VISIBLE).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                      $layer.removeClass($layer.data("value"));
                      _this5._showLayer($layer, value);
                      $clonedLayer.removeClass("visible").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                          $clonedLayer.remove();
                      });
                  });;
              } else {
                  this._showLayer($layer, value);
              }
          }
      }, {
          key: "_showLayer",
          value: function _showLayer($layer, value) {
              $layer.data("value", value).addClass(value).addClass(classes.VISIBLE);
          }

          // añade opciones al select

      }, {
          key: "_appendOptions",
          value: function _appendOptions($control, options, defaultOption, defaultText) {
              $control.empty();
              if (!defaultOption) {
                  var texto = defaultText || "Selecciona una opción";
                  $control.append("<option value='' selected> " + texto + " </option>");
              }
              options.forEach(function (option) {
                  if (defaultOption === option.id) {
                      $control.append("<option value='" + option.id + "' selected> " + option.text + " </option>");
                  } else {
                      $control.append("<option value='" + option.id + "'> " + option.text + " </option>");
                  }
              });
          }
      }]);
      return Customizr;
  }();

  return Customizr;

}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9kZWZhdWx0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBCQVNFID0gXCJjdXN0b21penJcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIEJBU0VfQ0xBU1M6IEJBU0UgKyBcIi1iYXNlXCIsXG4gICAgTEFZRVI6IEJBU0UgKyBcIi1sYXllclwiLFxuICAgIFRZUEU6IEJBU0UgKyBcIi10eXBlXCIsXG4gICAgTUFJTl9DT05UUk9MOiBCQVNFICsgXCItbWFpbi1jb250cm9sXCIsXG4gICAgQ09OVFJPTDogQkFTRSArIFwiLWZpbHRlci1jb250cm9sXCIsXG4gICAgVklTSUJMRTogXCJ2aXNpYmxlXCIsXG4gICAgVElUTEU6IEJBU0UgKyBcInRpdGxlXCJcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0VBQUEsSUFBTSxPQUFPLFdBQWI7O0FBRUEsZ0JBQWU7QUFDWCxFQUFBLGdCQUFZLE9BQU8sT0FEUjtBQUVYLEVBQUEsV0FBTyxPQUFPLFFBRkg7QUFHWCxFQUFBLFVBQU0sT0FBTyxPQUhGO0FBSVgsRUFBQSxrQkFBYyxPQUFPLGVBSlY7QUFLWCxFQUFBLGFBQVMsT0FBTyxpQkFMTDtBQU1YLEVBQUEsYUFBUyxTQU5FO0FBT1gsRUFBQSxXQUFPLE9BQU87QUFQSCxFQUFBLENBQWY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

app.directive("overlay", function() {
  return {
    restrict: "C",
    templateUrl: 'views/editor/overlay/overlay.html',
    link: function(scope, element, attributes) {
      var menuElement = element.find(".menu");
      var transformElement = element.find(".transform");
      var selectionElement = element.find(".selection");
      var selectionBounds = null;

      var init = function() {
        //transform buttons
        transformElement.on("mousedown", "div", transform.start);

        //events
        scope.editor.graph.on("change:position", changePosition);
        scope.editor.graph.on("change:size", changeSize);
        scope.$watch("editor.scale", changeScale);
        scope.$watch("editor.selectionFocus", changeFocus);
        scope.$watchCollection("editor.selectionElements", changeSelection);
      };

      var transform = {
        transformApply: {
          tl: function(diff) {
            return {
              width: transformData.startSize.width + diff.x,
              height: transformData.startSize.height + diff.y,
              x: transformData.startPosition.x - diff.x,
              y: transformData.startPosition.y - diff.y
            };
          },
          tr: function(diff) {
            return {
              width: transformData.startSize.width - diff.x,
              height: transformData.startSize.height + diff.y,
              x: transformData.startPosition.x,
              y: transformData.startPosition.y - diff.y,
            };
          },
          bl: function(diff) {
            return {
              width: transformData.startSize.width + diff.x,
              height: transformData.startSize.height - diff.y,
              x: transformData.startPosition.x - diff.x,
              y: transformData.startPosition.y,
            };
          },
          br: function(diff) {
            return {
              width: transformData.startSize.width - diff.x,
              height: transformData.startSize.height - diff.y,
              x: transformData.startPosition.x,
              y: transformData.startPosition.y,
            };
          }
        },
        start: function(e) {
          e.stopPropagation();

          var direction = $(this).attr("class");
          var selectionFocus = scope.editor.selectionFocus;

          transformData = {
            x: e.pageX,
            y: e.pageY,
            startPosition: {
              x: selectionFocus.attributes.position.x,
              y: selectionFocus.attributes.position.y
            },
            startSize: {
              width: selectionFocus.attributes.size.width,
              height: selectionFocus.attributes.size.height
            },
            transformApply: transform.transformApply[direction]
          }

          var body = $("body");
          body.on("mousemove", transform.drag);
          body.on("mouseup", transform.end);
          body.css("cursor", $(this).css("cursor"));
        },
        end: function(e) {
          var body = $("body");
          body.off("mousemove", transform.drag);
          body.off("mouseup", transform.end);
          body.css("cursor", "");
        },
        drag: function(e) {
          var diff = {
            x: g.snapToGrid((1 / scope.editor.scale) * (transformData.x - e.pageX), scope.editor.grid),
            y: g.snapToGrid((1 / scope.editor.scale) * (transformData.y - e.pageY), scope.editor.grid)
          };

          var transform = transformData.transformApply(diff);

          var selectionFocus = scope.editor.selectionFocus;

          selectionFocus.position(transform.x, transform.y);
          selectionFocus.resize(transform.width, transform.height);
        }
      };

      var changeScale = function() {
        changeSize();
        changePosition(scope.editor.selectionFocus);
      };

      var changeFocus = function() {
        if (scope.editor.selectionFocus instanceof joint.dia.Element) {
          menuElement.find("[data-toggle=tooltip]").tooltip();
          menuElement.show();
          transformElement.show();
        } else {
          menuElement.hide();
          transformElement.hide();
        }

        changeSize();
        changePosition(scope.editor.selectionFocus);
      };

      var changeSelection = function() {
        if (scope.editor.selectionElements.length > 0) {
          selectionElement.show();
        } else {
          selectionElement.hide();
        }

        changeSize();
        changePosition(scope.editor.selectionFocus);
      };

      var changeSize = function() {
        if (scope.editor.selectionFocus instanceof joint.dia.Element) {
          selectionBounds = scope.editor.graph.getBBox(scope.editor.selectionElements);

          if (scope.editor.selectionFocus instanceof joint.dia.Element) {
            selectionBounds.startPosition = {
              x: scope.editor.selectionFocus.attributes.position.x,
              y: scope.editor.selectionFocus.attributes.position.y
            };
          }

          changePosition(scope.editor.selectionFocus);
        }
      };

      var changePosition = function(cell) {
        if (!scope.editor.selectionFocus || !cell) {
          return;
        }

        if (cell.id != scope.editor.selectionFocus.id) {
          return;
        }

        if (scope.editor.selectionFocus instanceof joint.dia.Element) {
          //update menu
          menuElement.css({
            fontSize: scope.editor.scale + "em",
            left: scope.editor.scale * scope.editor.selectionFocus.attributes.position.x,
            top: scope.editor.scale * (scope.editor.selectionFocus.attributes.position.y - 24),
            width: scope.editor.scale * scope.editor.selectionFocus.attributes.size.width
          });

          //update transform
          transformElement.css({
            fontSize: scope.editor.scale + "em",
            left: scope.editor.scale * scope.editor.selectionFocus.attributes.position.x,
            top: scope.editor.scale * scope.editor.selectionFocus.attributes.position.y,
            width: scope.editor.scale * scope.editor.selectionFocus.attributes.size.width,
            height: scope.editor.scale * scope.editor.selectionFocus.attributes.size.height
          });
        }

        if (scope.editor.selectionElements.length > 0) {
          var diff = {
            x: (selectionBounds.startPosition.x - scope.editor.selectionFocus.attributes.position.x),
            y: (selectionBounds.startPosition.y - scope.editor.selectionFocus.attributes.position.y)
          };

          //update selection
          selectionElement.css({
            left: scope.editor.scale * (selectionBounds.x - diff.x) - 5,
            top: scope.editor.scale * (selectionBounds.y - diff.y) - 5,
            width: scope.editor.scale * selectionBounds.width + 10,
            height: scope.editor.scale * selectionBounds.height + 10
          });
        }
      };

      init();
    }
  };
});

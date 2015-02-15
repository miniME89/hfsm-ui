app.controller("EditorController", function($rootScope, $scope, StatemachineExecutorService) {
  var init = function() {
    $scope.debug = true;

    $scope.toolbar = {
      scaleOptions: [0.25, 0.5, 1.0, 1.5, 2.0, 3.0]
    };

    $rootScope.editor = {
      selectionElements: [],
      selectionFocus: null,
      size: {
        width: 1000,
        height: 1000
      },
      scale: 1.0,
      gridVisible: true,
      grid: 10
    };

    $rootScope.graph = new joint.dia.Graph;

    $scope.graph.on("all", $scope.update);

    StatemachineExecutorService.state(function(state) {
      console.log(state);

      return true;
    });
  }

  $scope.addSelection = function(element) {
    for (var i = 0; i < $scope.editor.selectionElements.length; i++) {
      if ($scope.editor.selectionElements[i].id == element.id) {
        return;
      }
    }

    $scope.editor.selectionElements.unshift(element);
  }

  $scope.removeSelection = function(element) {
    for (var i = 0; i < $scope.editor.selectionElements.length; i++) {
      if ($scope.editor.selectionElements[i].id == element.id) {
        $scope.editor.selectionElements.splice(i, 1);

        if ($scope.editor.selectionFocus.id == element.id) {
          $scope.setFocus($scope.editor.selectionElements[0]);
        }

        return;
      }
    }
  }

  $scope.isSelected = function(element) {
    for (var i = 0; i < $scope.editor.selectionElements.length; i++) {
      if ($scope.editor.selectionElements[i].id == element.id) {
        return true;
      }
    }

    return false;
  }

  $scope.clearSelection = function() {
    $scope.editor.selectionElements = [];
    $scope.editor.selectionFocus = null;
  }

  $scope.setFocus = function(cell) {
    $scope.editor.selectionFocus = cell;
  }

  $scope.clearFocus = function() {
    $scope.editor.selectionFocus = null;
  }

  $scope.update = function(eventName) {
    if (!$scope.$$phase && eventName != "change") {
      $scope.$apply();
    }
  }

  init();
});

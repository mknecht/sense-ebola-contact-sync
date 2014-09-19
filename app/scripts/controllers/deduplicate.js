'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:DeduplicateCtrl
 * @description
 * # DeduplicateCtrl
 * Controller of secsApp
 */
var secsApp = angular.module('secsApp')

secsApp
  .controller('DeduplicateCtrl',
    ['$scope', '$filter', 'ngTableParams', 'contactFactory', 'SETTINGS',
      'duplicateRecognizer',
      function ($scope, $filter, NgTableParams, contactFactory, SETTINGS,
        duplicateRecognizer) {
        contactFactory.allOrderedByName().then(function(contacts) {
          function extendContact(contact) {
            // Ugly extension of Contact objects, because contacts are
            // plain objects, i.e. do not share a prototype.
            // Functions would be more ugly, because we're really working
            // on the objects, hence methods are appropriate and also
            // we'd have to pass the functions to the isolated scope.
            if (contact.isDuplicate === undefined) {
              contact.isDuplicate = function() {
                return this.duplicateOf !== undefined
              }
            }
            if (contact.markAsDuplicate === undefined) {
              contact.markAsDuplicate = function(originalContact) {
                return this.duplicateOf = originalContact._id
              }
            }
          }

          var matches = duplicateRecognizer.findDuplicateContacts(contacts)

          // Bootstrap pagination
          $scope.totalItems = matches.length
          $scope.$watch('currentPage', function(pagenum) {
            var left = matches[pagenum][0]
            contactFactory.addDetails(left)
            extendContact(left)
            $scope.left = left

            var right = matches[pagenum][1]
            contactFactory.addDetails(right)
            extendContact(right)
            $scope.right = right

            // TODO Test data to be removed
            $scope.left.duplicateOf = "3e96add5cbba0bcd9345745637017a4h"
          })

          // Start with the best match
          $scope.currentPage = 0
        });

        $scope.toggleStatus = function(contact, event) {
          event.stopPropagation();
          var newStatus = (contact.status === 'active' ? 'inactive' : 'active');
          contactFactory.update(contact._id, { 'status': newStatus})
                        .then(function(updatedContact) {
            contact.status = updatedContact.status;
          });
        };

        $scope.toDeactivate = function(contact) {
          return (contact.status === 'active' &&
              contact.daysSinceLastContact > SETTINGS.incubationPeriod);
        };
      }]);

secsApp.directive('mergeString', function() {
  return {
    restrict: 'A',
    scope: {
      left: '=',
      name: '@',
      right: '=',
      title: '@'
    },
    templateUrl: 'views/deduplicate_string.html'
  }
})


secsApp.directive(
  'mergeList',
  ['$compile', '$http', '$templateCache',
  function($compile, $http, $templateCache) {
    // Interpret the content of the directive's element
    // as representing one list item.
    // Insert it at the insertItemText element.
    var nameOfMarkerTag = "insertItemText"
    var templateLoader
    return {
      restrict: 'A',
      scope: {
        copyLabel: '@',
        name: '@',
        obj: '=',
        other: '=',
        title: '@'
      },
      compile: function(tElement, tAttrs) {
        var itemHtml = tElement.html()
        templateLoader = (
        $http
          .get('views/deduplicate_list.html', {cache: $templateCache})
          .success(function(html) { tElement.html(html) }))
        return function ($scope, element, attrs) {
          templateLoader.then(function (templateText) {
           tElement.find(nameOfMarkerTag).html(itemHtml)
            element.html(tElement.html())
            $compile(element.contents())($scope)
          })
        }
      },
      controller: function($scope) {
        $scope.append = function(lst, item) {
          if (lst.indexOf(item) === -1) {
            lst.push(item)
          }
        }
        $scope.remove = function(lst, item) {
          lst.splice(lst.indexOf(item), 1)
        }
      }
    }
  }]
)

secsApp.directive('duplicateMarker', function() {
  return {
    restrict: 'A',
    scope: {
      obj: '=',
      other: '='
    },
    templateUrl: 'views/deduplicate_marker.html'
  }
})

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
      function ($scope, $filter, NgTableParams, contactFactory, SETTINGS) {

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

          // TODO Choose a suitable pair.
          $scope.left = contacts[4];
          $scope.right = contacts[5];

          extendContact($scope.left)
          extendContact($scope.right)

          // TODO Test data to be removed
          $scope.left.duplicateOf = "3e96add5cbba0bcd9345745637017a4h"
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

secsApp.directive('duplicateMarker', function() {
  return {
    restrict: 'A',
    scope: {
      other: '=',
      this: '='
    },
    templateUrl: 'views/deduplicate_marker.html'
  }
})
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
          // TODO Choose a suitable pair.
          $scope.left = contacts[4];
          $scope.right = contacts[5];

          // TODO Test data to be removed
          $scope.left.isduplicate = true
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
    templateUrl: 'views/deduplicate_row.html'
  }
})

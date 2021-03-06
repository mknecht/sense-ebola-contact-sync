'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of secsApp
 */
angular.module('secsApp')
  // Note: make ngTableParams -> NgTableParams, to make jshint stop complaining
  .controller('ContactsCtrl',
      ['$scope', '$filter', 'ngTableParams', 'contactFactory', 'SETTINGS',
      function ($scope, $filter, NgTableParams, contactFactory, SETTINGS) {

    $scope.contacts = [];

    $scope.tableParams = new NgTableParams(
      {
        sorting: {
          lastName: 'asc'
        }
      }, {
        total: $scope.contacts.length,
        getData: function($defer, params) {
          var orderedData = params.sorting ?
                    $filter('orderBy')($scope.contacts, params.orderBy()) : $scope.contacts;

          orderedData = params.filter ?
                    $filter('filter')(orderedData, params.filter()) : orderedData;

          $defer.resolve(orderedData);
        }
      });

    contactFactory.allOrderedByName().then(function(contacts) {
      $scope.contacts = contacts;
      $scope.tableParams.reload();
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

    $scope.showDetails = function(contact) {
      if (contact.includingDetailedInfo) {
        contact.includingDetailedInfo = false;
      } else {
        contactFactory.addDetails(contact);
      }
    };
  }]);

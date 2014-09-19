'use strict';

var secsApp = angular.module('secsApp')

secsApp.factory('duplicateRecognizer',
  ['fastLevenshteinService',
  function duplicateRecognizer(fastLevenshteinService) {
    function isNotDuplicate(it) {
      return it.duplicateOf === undefined
    }

    function isAfter(marker) {
      var found = [false]
      return function(it) {
        if (it === marker) {
          found[0] = true
        } else {
          // In else-block, so marker element will be skipped.
          return found[0]
        }
      }
    }

    function isDiffLessThanOrUndefined(maxDiff, left, get) {
      return function(right) {
        return (
          get(left) === undefined
               || get(right) === undefined
               || Math.abs(get(left) - get(right)) < maxDiff
        )
      }
    }

    function isLevenshteinDistanceLessThan(maxDist, left, get) {
      return function(right) {
          return get(left) !== undefined
               && get(right) !== undefined
               && fastLevenshteinService.distance(get(left), get(right)) < maxDist
      }
    }

    function findDuplicateContacts(contacts) {
      var duplicatesPerContact = (
        contacts
          .filter(isNotDuplicate)
          .map(
            function(left) {
              return contacts
              // removes many contacts fast
                       .filter(isAfter(left))
              // integer ops: fast
                       .filter(isDiffLessThanOrUndefined(
                         3,
                         left,
                         function (it) { return it.age }))
              // string operations: slow, thus last
                       .filter(isLevenshteinDistanceLessThan(
                         2,
                         left,
                         function(it) { return it.lastName }))
                       .filter(isLevenshteinDistanceLessThan(
                         5,
                         left,
                         function(it) { return it.otherNames }))
                       .map(function(right) { return [left, right] })
            }
          )
      )

      return [].concat.apply([], duplicatesPerContact.filter(
        function(it) { return it.length > 0 }))
    }

    return {
      findDuplicateContacts: findDuplicateContacts
    }
  }
])
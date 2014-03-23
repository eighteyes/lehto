// JavaScript Document

    var app = angular.module("app", []);

    app.service('CountryService', function($q, $http){
      return {
        getCountries: function() {
          var d = $q.defer();
          $http.get('countries.json').then(function(data) {
            d.resolve(data);
          });
          return d.promise;
        }
      }
    });

    app.service('ArtistService', function($q, $http){
      return {
        getArtists: function(cc) {
          var d = $q.defer();
          $http.get('country/'+cc).then(function(data) {
            d.resolve(data);
          });
          return d.promise;
        },
        getSimiliar: function(artist){
          var d = $q.defer();
          $http.get('similiar/'+artist).then(function(data) {
            d.resolve(data);
          });
          return d.promise;
        },
        getShows: function(artist){
          var d = $q.defer();
          $http.get('shows/'+artist).then(function(data) {
            d.resolve(data);
          });
          return d.promise;
        }
      }
    })

    app.controller('LehtoControl', function( $scope, CountryService, ArtistService ){
      CountryService.getCountries().then( function(data) {
        $scope.countries = _.sortBy(data.data, ['population'] ).reverse();
      });

      $scope.findArtists = function(cc){
        ArtistService.getArtists(cc).then( function(data) {
        $scope.artists = data.data;
      });

      $scope.findEvents = function(artist){
        ArtistService.getShows(artist).then( function(data){
          $scope.shows = data.data;
        })
      }
      }
    });
	myapp.directive('autoComplete', function(autoCompleteDataService) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.autocomplete({
                source: autoCompleteDataService.getSource(), //from your service
                select: function( event, ui ) {
                    scope.foo= ui.item.label;
                    scope.$apply();
                },
                change:function (event, ui) {
                    if (ui.item === null) {
                        scope.foo = null;
                    }
                },
                minLength: 2
            });
        }
    };
});

   
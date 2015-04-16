var app = angular.module('fencin');

app.controller('checkinSelectionController', function ($scope, checkinService, firebaseService, $location, environmentService, currentAuth, $location) {
 
    if(currentAuth){
      $scope.clubName = 'Utah Swords Academy Fencing Club';
      $scope.getTournaments = function () {
          firebaseService.getTournaments().then(function (data) {
              $scope.tournaments = data;
              $scope.tournamentNames = [];
              for (i = 0; i < $scope.tournaments.length; i++) {
                  $scope.tournamentNames.push($scope.tournaments[i].tournament.tournamentName);
              }
          });
      }();


      $scope.tournamentSelected = function () {
           for(i = 0; i < $scope.tournaments.length; i++){
               if($scope.tournaments[i].tournament.tournamentName === $scope.selectedTournament){ 
                   checkinService.setCurrentTournament($scope.tournaments[i]);
                  $scope.selected = $scope.tournaments[i];
                 environmentService.saveTournament($scope.selected);
                   break;
               }
           }
          $location.path('/dashboard');
      };

    }
});

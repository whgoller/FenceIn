var app = angular.module('fencin');

app.controller('checkinParticipantController', function ($scope, checkinService, firebaseService) {
  
    var firebaseUrl = 'https://fencein.firebaseio.com/';
  var ref = new Firebase(firebaseUrl)
  ref.onAuth(function(authData){
    console.log(authData);
    if(authData){
        $scope.currentParticipant = checkinService.getParticipant();
        $scope.currentTournament = checkinService.getCurrentTournament();
        $scope.totalAmountDue = 0;
        $scope.eventsParticipatingIn = [];

        //Pulls the usfencing.org fencer information 
        $scope.currentParticipantDetails = function (id) {
          if(id){
            firebaseService.getUSFAFencer(id).then(function (data) {
                if(data.competitive === true){
                  data.competitive = "Yes";
                } else if(data.competitive === false){
                  data.competitive = "No";
                } 
                $scope.fencerDetails = data;
                console.log(data);
            });
          } else {
            $scope.fencerDetails = null;
          }
        }($scope.currentParticipant.usfa_id);



        //when a event is selected it add/removes it from the eventsParticipatingIn array
        $scope.eventSelected = function (selected) {
            if ($scope.eventsParticipatingIn.indexOf(selected.full_name) === -1) {
                $scope.eventsParticipatingIn.push(selected.full_name);
            }
            else {
                if ($scope.eventsParticipatingIn.length === 0) {
                    $scope.eventsParticipatingIn = [];
                }
                else {
                    $scope.eventsParticipatingIn.splice($scope.eventsParticipatingIn.indexOf(selected.full_name), 1);
                }
            }
            calculateAmountDue();
        };

    //calculates the amount due
        var calculateAmountDue = function () {
            $scope.totalAmountDue = 0;
            for (i = 0; i < $scope.eventsParticipatingIn.length; i++) {
                for (j = 0; j < $scope.tournamentEvents.length; j++) {
                    if ($scope.tournamentEvents[j].full_name === $scope.eventsParticipatingIn[i]) {
                        $scope.totalAmountDue += parseInt($scope.tournamentEvents[j].fee);
                    }
                }
            }
        };

        //saves method of payment to checkinService
        $scope.paidBy = function () {
            if ($scope.paymentType === 'cash') {
                checkinService.setPaidCash($scope.totalAmountDue);
            } else if ($scope.paymentType === 'check') {
                checkinService.setPaidCheck($scope.totalAmountDue);
            } else if ($scope.paymentType === 'card') {
                checkinService.setPaidCredit($scope.totalAmountDue);
            }
        };

        //sends user to the equipment checkout page
        $scope.equipmentCheckout = function () {
            window.location.hash = '/equipment';
        };

      
      $scope.updateMember = function(){
        console.log('1', $scope.currentParticipant);
        console.log('1', $scope.currentParticipant.usfa_id);
        console.log('1', $scope.currentParticipant.first_name);
        console.log('1', $scope.currentParticipant.last_name);
        var memberNumber = '';
        var firstName = '';
        var lastName = '';
        
        if($scope.currentParticipant.usfa_id === undefined){
          memberNumber = null;
        } else {
          memberNumber = $scope.currentParticipant.usfa_id;
        }     
        if($scope.currentParticipant.first_name === undefined){
          firstName = null;
        } else {
          firstName = $scope.currentParticipant.first_name;
        }  
        if($scope.currentParticipant.last_name === undefined){
          lastName = null;
        } else {
          lastName = $scope.currentParticipant.last_name;
        }  
        firebaseService.setUSFAFencerToCheck(memberNumber, firstName, lastName);
      }

        //submits fencer to the database for backroom access. 
        //will need the fencer duplicated per event registered
        $scope.submit = function () {
            //Need to remove fencer from checkin list and add to a checked-in list.
            firebaseService.checkedIn($scope.currentParticipant);
            $scope.currentParticipant.details = $scope.fencerDetails;
            $scope.currentParticipant.inFencingTime = false;
            $scope.checkInComplete = true;

            if ($scope.eventsParticipatingIn.length > 0) {
                for (var i = 0; i < $scope.eventsParticipatingIn.length; i++) {
                    $scope.currentParticipant.eventName = $scope.eventsParticipatingIn[i];
                    firebaseService.setFenncerCheckedIn($scope.currentParticipant);
                }
            }
            window.location.hash = '/checkin';
        };

        //Will select preregistered events for the fencer.
        var checkEventsPreregistered = function () {
          for (i = 0; i < $scope.tournamentEvents.length; i++) {
            //console.log($scope.tournamentEvents[i].fencerIds);
            //console.log($scope.currentParticipant.competitor_id);
            if($scope.tournamentEvents[i].fencerIds){
              if ($scope.tournamentEvents[i].fencerIds.indexOf($scope.currentParticipant.competitor_id) !== -1) {
                if ($scope.eventsParticipatingIn.indexOf($scope.tournamentEvents[i].full_name) === -1) {
                  $scope.eventsParticipatingIn.push($scope.tournamentEvents[i].full_name);
                  //This array is attached to the checked model and auto checks the checkboxes
                  $scope.tournamentEvents[i].preRegistered = true;
                } else {
                  $scope.tournamentEvents[i].preRegistered = false;
                }
              }
            }
          }
          calculateAmountDue();
        };

        //populates all the events within this tournament
        $scope.getEvents = function () {
            $scope.tournamentEvents = $scope.currentTournament.tournament.tournamentEvents;
            checkEventsPreregistered();
        }();    //self call
    }
  });
});


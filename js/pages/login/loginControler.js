var app = angular.module('fencin');
        
app.controller('loginController', function($scope, authService, $location, firebaseService, environmentService){
  
  //Step 4 of Registration
  var loginCallback = function(user){
    //user.uid = user.uid.replace('simplelogin:', '');
    firebaseService.getUser(user.uid).then(function(data){
      $location.path('/dashboard/' + user.uid);
    });
  };

  $scope.login = function () {
    return authService.login($scope.details, loginCallback);
  };

  //Step 2 of Registration
  $scope.register = function () {
    return authService.register($scope.details, loginCallback);
  };


  $scope.showReg = function(){
    $scope.reg = !$scope.reg;
  }; 
    
    

  
});
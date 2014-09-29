"use strict";

angular.module('myApp.upload', ['myApp.userAuthentication',
                                'myApp.receiptService',
                                'myApp.receipt',
                                'angularFileUpload'])
  .controller('UploadController', function($scope, $upload, $location, receiptService, $timeout) {

    receiptService.setReceipt(null);

    $scope.addManually = function() {
      $location.path("/receipt");
    };

    $scope.onFileSelect = function($files) {
      console.log("selecting files");
      $scope.loading = true;
      $timeout(function() {
        // Fadein loading text nicely
        $scope.loadingText = true;
      }, 400);
      $timeout(function() {
        // Fadein ocr loading text after that.
        $scope.loadingOcr = true;
      }, 1400);
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: '/api/upload',
          //method: 'POST' or 'PUT',
          //headers: {'header-key': 'header-value'},
          //withCredentials: true,
          //data: {myObj: $scope.myModelObj},
          file: file  // or list of files ($files) for html5 only
          //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
          // customize file formData name ('Content-Desposition'), server side file variable name.
          //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
          // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
          //formDataAppender: function(formData, key, val){}
        }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
          $scope.uploadPercent =  parseInt(100.0 * evt.loaded / evt.total);
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          console.log("Upload success, redirecting, response data:");
          console.log(data);
          receiptService.setReceipt(data);
          $scope.loading = false;
          $location.path("/receipt");
        }).error(function(er) {
          console.log(er);
          $scope.loading = false;
        });
        //.then(success, error, progress);
        // access or attach event listeners to the underlying XMLHttpRequest.
        //.xhr(function(xhr){xhr.upload.addEventListener(...)})
      }
      /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
       It could also be used to monitor the progress of a normal http post/put request with large data*/
      // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };
    /*
     * Change drop-box area css class when dragging file
     */
    $scope.dragOverClass = function($event) {
      var items = $event.dataTransfer.items;
      var hasFile = false;
      if (items != null) {
        for (var i = 0 ; i < items.length; i++) {
          if (items[i].kind == 'file') {
            hasFile = true;
            break;
          }
        }
      } else {
        hasFile = true;
      }
      return hasFile ? "upload-drop-box-dragover" : "upload-drop-box-dragover-err";
    };
  });

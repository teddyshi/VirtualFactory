
var stepIdArr = [10, 20, 30, 50, 60, 80, 90];

var ACTION_START = "start";
var ACTION_COMPLETE = "complete";

var nextStep = function(stepId) {
  var index = stepIdArr.indexOf(stepId);
  if(index + 1 >= stepIdArr.length) {
    return;
  }
  else {
    return stepIdArr[index + 1];
  }
}

$.previousSfcsData = null;

$.compareSfcs = function(latestSfcsData) {
  if (null === $.previousSfcsData) {
    $.previousSfcsData = {};
    //copy
    for(var i = 0;i < latestSfcsData.length;i++) {
      var sfc = latestSfcsData[i]['sfc'];
      //Parse Int
      var stepId = parseInt(latestSfcsData[i]['stepId']);
      var status = latestSfcsData[i]['status'];
      $.previousSfcsData[sfc] = {
        stepId: stepId,
        status: status,
        modified: false
      }
    }
    //copy end
    return {
      init: true,
      data: latestSfcsData
    };
  } 
  else {
    var compareResult = [];
    //Consider Done
    for(var i = 0;i < latestSfcsData.length;i++) {
      var sfc = latestSfcsData[i]['sfc'];
      //Parse Int
      var stepId = parseInt(latestSfcsData[i]['stepId']);
      var status = latestSfcsData[i]['status'];
      var previousSfcData = $.previousSfcsData[sfc];
      var preStepId, preStatus;
      if(previousSfcData) {
        preStepId = previousSfcData['stepId'];
        preStatus = previousSfcData['status'];
      }
      else {
        previousSfcData = {};
        preStepId = 10;
        preStatus = '401';
      }

      //console.log('sfc:' + sfc + ' prestep:' + preStepId + ' step:' + stepId);
      while(preStepId < stepId) {
        if('401' === preStatus || '402' === preStatus) {
          console.log('sfc' + sfc + 'prestatus' + preStatus);
          compareResult.push({
            sfc: sfc,
            step: preStepId,
            action: ACTION_START
          });
        }
        compareResult.push({
          sfc: sfc,
          step: preStepId,
          action: ACTION_COMPLETE
        });
        
        preStepId = nextStep(preStepId);
        preStatus = '402';
      }

      if(preStepId === stepId) {
        //console.log('sfc:' + sfc + ' preStatus:' + preStatus + ' status:' + status);
        if(('401' === preStatus || '402' === preStatus) && '403' === status) {
          compareResult.push({
            sfc: sfc,
            step: preStepId,
            action: ACTION_START
          });
        } 
      }

      previousSfcData['modified'] = true;
    }

    for(var sfc in $.previousSfcsData) {
      if(!$.previousSfcsData[sfc]['modified']) {
        var preStepId = $.previousSfcsData[sfc]['stepId'];
        var preStatus = $.previousSfcsData[sfc]['status'];
        //Make this Done
        while(preStepId) {
          if('401' === preStatus || '402' === preStatus) {
            compareResult.push({
              sfc: sfc,
              step: preStepId,
              action: ACTION_START
            });
          }
          compareResult.push({
            sfc: sfc,
            step: preStepId,
            action: ACTION_COMPLETE
          });
          preStepId = nextStep(preStepId);
          preStatus = '402';
        }
      }
    }
    //copy
    $.previousSfcsData = {};
    for(var i = 0;i < latestSfcsData.length;i++) {
      var sfc = latestSfcsData[i]['sfc'];
      //Parse Int
      var stepId = parseInt(latestSfcsData[i]['stepId']);
      var status = latestSfcsData[i]['status'];
      $.previousSfcsData[sfc] = {
        stepId: stepId,
        status: status,
        modified: false
      }
    }
    //copy end
    return {
      init: false,
      data: compareResult
    }
  }
  //end else
}

// (function($) {
//   $.extend({
//     previousSfcsData: {},
    
//     compareSfcs: function(latestSfcsData) {



//     }
//   })
// })(jQuery);


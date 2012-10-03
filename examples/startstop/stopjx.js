//
$(function() {
  //
  var $label = $("head title, .time-label h1");
  
  var displayPoll = function(p) {
    if(!p) return;

    var string = "";
    
    p.successTimes || (p.successTimes = 0);

    string += "|" + p.successTimes;
    string += "|" + p.pollId;
    $label.text(string);

    if(poll.cancelled) {
      $("h1").addClass("cancelled");
    } else {
      $("h1").removeClass("cancelled");
    }
  };

  var successPoll = function(data, p) {
    p.successTimes += 1;
  };

  var poll = $.longpoll({
    url: "http://localhost:8000",
    crossDomain: true,
    dataType: "text",
    beforePoll: displayPoll,
    success: successPoll
  });

  $("h1").text("Start poll and stop poll");

  $("a.start").click(function() {
    poll.start();
    return false;
  });

  $("a.stop").click(function() {
    poll.stop();
    displayPoll();
  });
});

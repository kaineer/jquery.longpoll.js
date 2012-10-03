$(function() {
  $("h1").text("Fishing example");

  var successFn = function(data, poll) {
    //
    var state = data.state;

    if(data.got) {
      $("head title").text("Got some " + data.got);
    }

    poll.url = "http://localhost:8000/poll/" + state;

    if(state == "wet") {
      $("#message").text("Fishing..");

    } else if(state == "dry") {
      $("#message").text("Smoking..");
    }
  };

  var poll = $.longpoll({
    url: "http://localhost:8000/poll",
    success: successFn
  });

  var jx = function(path) {
    $.ajax({
      url: "http://localhost:8000" + path,
      dataType: "json"
    });
  };

  $("a.go").click(function() {
    poll.start();
  });

  $("a.ungo").click(function() {
    poll.stop();
    $("#message").text("");
  });

  $("a.start").click(function() {
    $("head title").text("Gone fishing..");
    jx("/wet_rod");
  });

  $("a.stop").click(function() {
    jx("/dry_rod");
  });
});
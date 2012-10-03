$(function() {
  $("h1").text("Fishing example");

  var successFn = function(data, poll) {
    //
    var state = data.state;

    if(data.got) {
      $("head title, h1").text("Got some " + data.got);
    }

    poll.url = "http://localhost:8000/poll/" + state;

    if(state == "wet") {
      $("#message").text("Fishing..");
      
      $("li.start").hide();
      $("li.stop").show();
    } else if(state == "dry") {
      $("#message").text("Smoking..");
      
      $("li.stop").hide();
      $("li.start").show();
    }
  };

  var poll = $.longpoll({
    url: "http://localhost:8000/poll",
    success: successFn,
    failure: function() {
      $("#message").text("Lost connection");
      $("li.ungo, li.start, li.stop").hide();
      $("li.go").show();
    }
  });

  var jx = function(path) {
    $.ajax({
      url: "http://localhost:8000" + path,
      dataType: "json"
    });
  };

  $("a.go").click(function() {
    poll.start(true);

    $("li.ungo, li.start").show();
    $("li.go").hide();
  });

  $("a.ungo").click(function() {
    poll.stop();
    $("#message").text("");

    $("li.ungo, li.start, li.stop").hide();
    $("li.go").show();
  });

  $("a.start").click(function() {
    $("head title, h1").text("Gone fishing..");
    jx("/wet_rod");
  });

  $("a.stop").click(function() {
    $("head title, h1").text("Become tired of fishing");
    jx("/dry_rod");
  });

  $("li.ungo, li.start, li.stop").hide();
});

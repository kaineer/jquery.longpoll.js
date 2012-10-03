//
//
//
(function($, _, undefined) {
  //
  if(!$) {
    throw "jQuery should be loaded before this file";
  }
  
  if(!_) {
    throw "Underscore should be loaded before this file";
  }

  //
  var dummyFn = function() {};

  //
  var Longpoll = function(options) {
    options || (options = {});
    this.options = _.extend({}, Longpoll.defaults, options);
    
    // More poll-specific data
    this.url = this.options.url;
    this.canceled = false;
    this.pollId = null;
  };

  //
  Longpoll.defaults = {
    timeout: 30000,                     // 30 seconds
    url: "/longpoll",                   // url to poll
    dataType: "json",                   // dataType to fetch
    crossDomain: false,
    beforePoll: dummyFn,                // function to call before $.ajax
    success: dummyFn                    // function to call on $.ajax.success
    // To be continued
  };

  //// Private methods
  //
  var makePollFunction = function(pollId, poll) {
    var fn = function() {
      var options = poll.options;

      if(poll.isRunningWith(pollId)) {
	//
	options.beforePoll(poll);

	//
	$.ajax(
	  _.extend({}, options, {
	    url: poll.url,
	    success: function(data) {
	      if(poll.isRunningWith(pollId)) {
		return options.success(data, poll);
	      }
	    },
	    complete: fn
	  })
	);
      }
    };

    return fn;
  };

  //
  _.extend(Longpoll.prototype, {
    start: function(doReset) {
      if(doReset) {
	this.url = this.options.url;
      }
      this.pollId = new Date();
      this.canceled = false;
      (makePollFunction(this.pollId, this))();
    },

    stop: function() {
      this.canceled = true;
    },
    
    isRunningWith: function(pollId) {
      return !this.cancelled && this.pollId === pollId;
    }
  });

  //
  $.longpoll = function(options) {
    return new Longpoll(options);
  };

})(jQuery, _);

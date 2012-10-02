var obj = {key: "old value"};
var fn = function() {
  console.log(obj.key);
};

fn(); // -> old value
obj.key = "new value";
fn(); // -> new value

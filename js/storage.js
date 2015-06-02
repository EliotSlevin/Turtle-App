storage = {};

storage.get_auth_token = function(next){
  if(localStorage.auth_token){
    next(localStorage.auth_token);
  }
  else{
    //Register this device
    //Get some name somehow (Maybe show a modal)
    var name = generate_random_name();
    serverside.register_device(name, function(data){
      console.log(data);
      localStorage.auth_token = data.token;
      localStorage.username = data.username;
      next(localStorage.auth_token);
    }, function(error){
      //Should probably do something with this error
      console.err(error);
    });
  }
}

function generate_random_name(){
  var adjectives = ["windy", "rainy", "flimsy", "cold", "bright", "smart", "bouncy", "tranquil", "cute", "silent", "silent", "complex",
                    "cheerful", "blue", "orange", "pink", "yellow", "fluffy", "smooth", "catty", "adorable", "fast", "strong", "better"];

  var nouns = ["button", "yak", "cat", "lamp", "bed", "towel", "book", "shirt", "phone", "duck", "tortoise", "cherry", "pickle",
               "donkey", "flower", "badger", "cake", "hook"];

  var randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  var randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdj + "-" + randomNoun + "-" + Math.floor((Math.random() * 1000));
}

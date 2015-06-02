/**
  * The storage object which represents data about local storage
  **/
storage = {};

/**
  * Gets the auth token stored for this device. If we haven't
  * registered yet then we register the device serverside before
  * calling next with the auth token
  * @param next - The function to call with the auth_token
  **/
storage.get_auth_token = function(next){
  //If we have it in local storage, we have already registered (Probably)
  if(localStorage.auth_token){
    next(localStorage.auth_token);
  }
  else{
    //Register this device
    //Get some name somehow (Maybe show a modal)
    var name = generate_random_name();
    serverside.register_device(name, function(data){
      //Store some information to indicate we have registered
      localStorage.auth_token = data.token;
      localStorage.username = data.username;
      next(localStorage.auth_token);
    }, function(error){
      //Should probably do something with this error
      console.err(error);
    });
  }
}

/**
  * Loads a *local* sketch identified by the given ID.
  * Note: id is a local id, not an online one
  * @param id - The local ID of the sketch to load
  **/
storage.load_local_sketch = function(id){
  var sketch = local_sketches[id];
  serverside.recompose_execution_pane(JSON.parse(sketch.sketch_contents));
  current_sketch.online_sketch_id = sketch.online_sketch_id;
  current_sketch.sketchid = id;
  current_sketch.name = sketch.sketch_name;
}

/**
  * Saves the current sketch to load storage
  **/
storage.save_local_sketch = function(){
  var sketch = storage.decompose_current_sketch();
  sketch.online_sketch_id = current_sketch.online_sketch_id;
  sketch.local_sketch_id = current_sketch.local_sketch_id;

  local_sketches[current_sketch.local_sketch_id] = sketch;
  localStorage.sketches = JSON.stringify(local_sketches);
  localStorage.sketch_counter = Number(localStorage.sketch_counter) + 1;
}

/**
  * Decomposes the current sketch down into an object which can
  * be serialized
  **/
storage.decompose_current_sketch = function(){
  var name = current_sketch.name;
  var contents = JSON.stringify(decompose_execution_pane());
  var preview = $("#paper_canvas")[0].toDataURL().substring("data:image/png;base64,".length);
  return {
    sketch_name: name,
    sketch_contents: contents,
    sketch_demo_blob: preview
  };
}

/**
  * Generates a random heroku-style name for a username.
  * @return The generated user name
  **/
function generate_random_name(){
  var adjectives = ["windy", "rainy", "flimsy", "cold", "bright", "smart", "bouncy", "tranquil", "cute", "silent", "silent", "complex",
                    "cheerful", "blue", "orange", "pink", "yellow", "fluffy", "smooth", "catty", "adorable", "fast", "strong", "better"];

  var nouns = ["button", "yak", "cat", "lamp", "bed", "towel", "book", "shirt", "phone", "duck", "tortoise", "cherry", "pickle",
               "donkey", "flower", "badger", "cake", "hook"];

  var randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  var randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdj + "-" + randomNoun + "-" + Math.floor((Math.random() * 1000));
}

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

storage.load_local_sketch = function(id){
  var sketch = local_sketches[id];
  console.log(sketch.sketch_contents);
  serverside.recompose_execution_pane(JSON.parse(sketch.sketch_contents));
  current_sketch.online_sketch_id = sketch.online_sketch_id;
  current_sketch.sketchid = id;
  current_sketch.name = sketch.sketch_name;
}

storage.save_local_sketch = function(){
  var sketch = storage.decompose_current_sketch();
  sketch.online_sketch_id = current_sketch.online_sketch_id;
  sketch.local_sketch_id = current_sketch.local_sketch_id;

  local_sketches[current_sketch.local_sketch_id] = sketch;
  localStorage.sketches = JSON.stringify(local_sketches);
  localStorage.sketch_counter = Number(localStorage.sketch_counter) + 1;
}

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

function generate_random_name(){
  var adjectives = ["windy", "rainy", "flimsy", "cold", "bright", "smart", "bouncy", "tranquil", "cute", "silent", "silent", "complex",
                    "cheerful", "blue", "orange", "pink", "yellow", "fluffy", "smooth", "catty", "adorable", "fast", "strong", "better"];

  var nouns = ["button", "yak", "cat", "lamp", "bed", "towel", "book", "shirt", "phone", "duck", "tortoise", "cherry", "pickle",
               "donkey", "flower", "badger", "cake", "hook"];

  var randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  var randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdj + "-" + randomNoun + "-" + Math.floor((Math.random() * 1000));
}

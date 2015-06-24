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
    var name = localStorage.username;
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
  current_sketch.local_sketch_id = Number(id);
  current_sketch.name = sketch.sketch_name;
}

/**
  * Saves the current sketch to load storage
  **/
storage.save_local_sketch = function(next){
  if(current_sketch.local_sketch_id == null)return;
  storage.decompose_current_sketch(function(sketch){
    sketch.online_sketch_id = current_sketch.online_sketch_id;
    sketch.local_sketch_id = current_sketch.local_sketch_id;

    local_sketches[current_sketch.local_sketch_id] = sketch;
    localStorage.sketches = JSON.stringify(local_sketches);
    if(sketch.local_sketch_id == localStorage.sketch_counter){
      localStorage.sketch_counter = Number(localStorage.sketch_counter) + 1;
    }

    if(sketch.online_sketch_id !== null && sketch.local_sketch_id !== null){
      serverside.save_local_sketch(sketch);
    }
    else{
        if(next)next();
    }
  });
}

/**
  * Decomposes the current sketch down into an object which can
  * be serialized
  **/
storage.decompose_current_sketch = function(next){
  //Bollocks
  paper = paper_contexts[1];
  execution_pane.run(undefined, true);
  $("#big_canvas").show();
  paper.view.draw();
  console.log("Waiting for paper to finish its render loop");
  paper_contexts[1].view.onFrame = function(){
    console.log("Constructing sketch");
    var preview = document.getElementById('big_canvas').toDataURL().substring("data:image/png;base64,".length);
    paper_contexts[1].view.onFrame = undefined;
    $("#big_canvas").hide();
    paper = paper_contexts[0];
    var name = current_sketch.name;
    var contents = JSON.stringify(decompose_execution_pane());
    console.log("Finished Deconstructing");
    console.log(next);
    next({
      sketch_name: name,
      sketch_contents: contents,
      sketch_demo_blob: preview
    });
  }
}

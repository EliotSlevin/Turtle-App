/**
  * The serverside Object. Has serverside methods + config info
  **/
serverside = {
  root_server_url: "https://sketchbackend.herokuapp.com"
};

/**
  * Internal method for serializing a given block so that
  * it can be stored as a string. NOTE: Does recurse down if the given block is a multi-block
  * @param block - The block to serialize
  * @return the String representation of the given block
  **/
function decompose_block(block){
  var block_decomp = {
    name: block.name,
    palette_index: block.palette_index,
    multi_block: block.multi_block,
    parameters: block.parameters
  };

  //Recurse down if we need to
  if(block.multi_block){
    block_decomp.blocks = [];
    for(var i = 0;i < block.blocks.length;i ++){
      block_decomp.blocks.push(decompose_block(block.blocks[i]));
    }
  }

  return block_decomp;
}

/**
  * Serializes the execution pane contents so that it can be stored as a string
  */
function decompose_execution_pane(){
  var blocks = execution_pane.blocks;
  var execution_pane_decomp = {blocks:[]};
  for(var i = 0;i < blocks.length;i ++){
    execution_pane_decomp.blocks.push(decompose_block(blocks[i]));
  }

  return execution_pane_decomp;
}

/**
  * Reverses the effects of `decompose_block` to reconstruct a block
  * object from a reparsed JSON version of what was stored
  * @param server_block - The JavaScript Object which was stored as a string somewhere
  * @returns The recomposed block from the given one, which can be stored in the execution pane and run
  **/
function recompose_block(server_block){
  var parentRef = palette.blocks[server_block.palette_index];//Get the palette reference where we can steal a bunch of info
  var block = new CodeBlock(server_block.name, parentRef.palette_id, parentRef.modal_id, parentRef.action, parentRef.immediate_action, parentRef.on_open_modal, parentRef.on_close_modal, parentRef.on_draw_parameters,server_block.parameters, server_block.multi_block);
  block.palette_index = server_block.palette_index;

  //Recurse down if the block was a multiblock
  if(server_block.multi_block){
    if(!server_block.blocks){
      //Sometimes this happens due to serialization issues. Should probably fix.
      console.err("Missing Blocks in rotBlock: ");
      console.err(rotBlock);
    }
    block.blocks = [];
    for(var i = 0;i < server_block.blocks.length;i ++){
      block.blocks.push(recompose_block(server_block.blocks[i]));
    }
  }

  return block;
}

/**
  * Saves the current sketch to the server under the given name
  * @param name - The name to save the sketch under
  **/
serverside.save_sketch = function(name){
  if(name)current_sketch.name = name;

  serverside.post_sketch(function(data){
    var sketch = data.sketch;
    localStorage.auth_token = data.new_token;
    current_sketch.online_sketch_id = sketch.id;
    storage.flush_current_sketch();
  }, function(error){
    //We should do something better here. Maybe update the UI.
    console.log(error);
  });
}

serverside.delete_local_sketch = function(sketch){
  if(sketch.online_sketch_id === null)return;
  storage.get_auth_token(function(token){
    function _success(data){
      localStorage.auth_token = data.new_token;
      sketch.online_sketch_id = null;
      localStorage.sketches = JSON.stringify(local_sketches);
    }

    function _error(err){
      console.log(err);
    }

    var sendBlob = {
      uuid: localStorage.uuid,
      token: token
    };

    $.ajax(serverside.to_abs_url("/sketch/" + sketch.online_sketch_id), {
      method: "DELETE",
      data: $.param(sendBlob)
    }).done(function(data){
      _success(JSON.parse(data));
    }).error(_error);
  });
}

serverside.save_local_sketch = function(sketch){
  storage.get_auth_token(function(token){
    var sendBlob = {
      sketch_name: sketch.sketch_name,
      sketch_contents: sketch.sketch_contents,
      sketch_demo_blob: sketch.sketch_demo_blob,
      uuid: localStorage.uuid,
      token: token
    };

    function _success(data){
      console.log(data);
      var returned_sketch = data.sketch;
      localStorage.auth_token = data.new_token;
      sketch.online_sketch_id = returned_sketch.id;
      localStorage.sketches = JSON.stringify(local_sketches);
    }

    function _error(err){
      console.log(err);
    }

    if(sketch.online_sketch_id !== null){
      $.ajax(serverside.to_abs_url("/sketches/" + sketch.online_sketch_id), {
        method: "PUT",
        data: $.param(sendBlob)
      }).done(function(data){
        _success(JSON.parse(data));
      }).error(_error);
    }
    else{
      $.post(serverside.to_abs_url("/sketches"), $.param(sendBlob)).done(function(data){
        _success(JSON.parse(data));
      }).error(_error);
    }
  });
}

/**
  * Loads the sketches made by a user with the given UUID, up to 'num' of them.
  * If num doesn't exist, or is 'all', fetches all the sketches.
  * If successfull: calls `success` with a JavaScript object containing the loaded sketches
  * If failed: calls `error` with an unparsed JSON string of the error (From the server)
  * @param user - The UUID of the user to load from
  * @param num - The maximum number of sketches to fetch
  * @param success - The function to call on success
  * @param error - The function to call on error
  **/
serverside.load_sketches_by_user = function(user, num, success, error){
  //Default to all
  if(!num){
    num = "all";
  }

  $.get(serverside.to_abs_url("/sketches/" + user + "/" + num)).done(function(data){success($.parseJSON(data));}).error(error);
}

/**
  * Searches the users database for users with names similar to the query
  * @param query - The query to search for
  * @param num - The number of results to fetch
  * @param offset - The starting index of the results (num * (page number-1))
  * @param success - The function to call on success
  * @param error - The function to call on error
  **/
serverside.search_users = function(query, num, offset, success, error){
  $.get(serverside.to_abs_url("/users/search/" + query + "/" + num + "/" + offset)).done(function(data){success($.parseJSON(data));}).error(error);
}

/**
  * Searches the sketches database for sketches with names similar to the query
  * @param query - The query to search for
  * @param num - The number of results to fetch
  * @param offset - The starting index of the results (num * (page number-1))
  * @param success - The function to call on success
  * @param error - The function to call on error
  **/
serverside.search_sketches = function(query, num, offset, success, error){
  $.get(serverside.to_abs_url("/sketches/search/" + query + "/" + num + "/" + offset)).done(function(data){success($.parseJSON(data));}).error(error);
}

/**
  * Loads an array of the popular sketches, using the given sorting mechanism
  * @param num - The number of results to fetch
  * @param offset - The starting index of the results (num * (page number-1))
  * @param sorting_mech - The sorting mechanism to use. Either 'popular', 'views' or 'new'
  * @param success - The function to call on success
  * @param error - The function to call on error
  **/
serverside.load_popular_sketches = function(num, offset, sorting_mech, success, error){
  $.get(serverside.to_abs_url("/sketches/popular/" + sorting_mech + "/" + num + "/" + offset)).done(function(data){success($.parseJSON(data));}).error(error);
}

/**
  * Loads the sketch identified by the given id
  * as the current sketch
  * @param id - the id of the sketch to load
  **/
serverside.load_sketch = function(id){
  serverside.get_sketch(id,
    function(data){
      console.log(data);
      serverside.recompose_execution_pane(data.blocks);
      current_sketch.online = true;
      current_sketch.author = data.by;
      if(data.by != localStorage.uuid){
        current_sketch.online = false;
        current_sketch.online_sketch_id = data.sketchid;
        current_sketch.local_sketch_id = null;
      }
      current_sketch.name = data.name;
    },
    function(error){
      console.log(error);
    }
  );
};

/**
  * Recomposes the execution pane from the given block array.
  * Used to load from serialized locations (Local storage and serverside)
  * Should be moved at some point. Doesn't really belong here
  * @param data - The block array to load into the execution pane
  **/
serverside.recompose_execution_pane = function(data){
  if(!data.blocks)return undefined;
  var blocks = [];
  for(var i = 0;i < data.blocks.length;i ++){
    var block = recompose_block(data.blocks[i]);
    blocks.push(block);
  }
  execution_pane.blocks = blocks;
  execution_pane.draw();
}

/**
  * Convienience method which converts a URI to an absolute url
  * for the server.
  * @param uri - The URI to convert
  **/
serverside.to_abs_url = function(uri){
  return serverside.root_server_url + uri;
}

/**
  * Registers this device against the given name on the serverside,
  * so that this device can start uploading pins. Note: Currently we
  * just fail hard if the username is already in use. We should probably fix that.
  * Note2: Don't just call this method. The success function has to do some things
  * like store some of the return values in local storage.
  * @param name - The name to register this device against
  * @param success - The function to call when successful
  * @param error - The function to call when we error
  **/
serverside.register_device = function(name, success, error){
  var toSend = {
    uuid: localStorage.uuid,
    username: name
  };

  localStorage.uuid = toSend.uuid;

  $.post(serverside.to_abs_url("/user"), $.param(toSend)).done(function(data){success($.parseJSON(data))}).error(error);
}

/**
  * POSTs The current sketch to the server, effectively saving it
  * @param success - The function to call on success
  * @param error - The function to call on error
  **/
serverside.post_sketch = function(success, error){
  storage.get_auth_token(function(token){
    storage.decompose_current_sketch(function(sendBlob){
      sendBlob.uuid = localStorage.uuid;
      sendBlob.token = token;

      if(current_sketch.online_sketch_id !== null){
        $.ajax(serverside.to_abs_url("/sketches/" + current_sketch.online_sketch_id), {
          method: "PUT",
          data: $.param(sendBlob)
        }).done(function(data){success(JSON.parse(data));}).error(error);
      }
      else{
        $.post(serverside.to_abs_url("/sketches"), $.param(sendBlob)).done(function(data){success(JSON.parse(data));}).error(error);
      }
    });
  });
}

/**
  * GETs the sketch identified by the given ID.
  * On Success - Calls `success` with a JavaScript object containing the loaded sketch
  * On Error - Calls `error` with the raw text response (Probably JSON, but not always :s)
  * @param id - The online ID of the sketch to get
  * @param success - The function to call when the sketch is sucesfully gotten
  * @param error - The function to call on an error
  **/
serverside.get_sketch = function(id, success, error){
  $.get(serverside.to_abs_url("/sketch/" + id)).done(function(data){success($.parseJSON(data));}).error(error);
}

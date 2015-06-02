serverside = {
  root_server_url: "https://sketchbackend.herokuapp.com"
};

function decompose_block(block){
  var block_decomp = {
    name: block.name,
    palette_index: block.palette_index,
    multi_block: block.multi_block,
  };

  if(block.multi_block){
    block_decomp.blocks = [];
    for(var i = 0;i < block.blocks.length;i ++){
      block_decomp.blocks.push(decompose_block(block.blocks[i]));
    }
  }

  return block_decomp;
}

function decompose_execution_pane(){
  var blocks = execution_pane.blocks;
  var execution_pane_decomp = {blocks:[]};
  for(var i = 0;i < blocks.length;i ++){
    execution_pane_decomp.blocks.push(decompose_block(blocks[i]));
  }

  return execution_pane_decomp;
}

function recompose_block(server_block){
  var parentRef = palette.blocks[server_block.palette_index];
  var block = new CodeBlock(server_block.name, parentRef.palette_id, parentRef.action, server_block.multi_block);
  block.palette_index = server_block.palette_index;
  if(server_block.multi_block){
    if(!server_block.blocks){
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

serverside.save_sketch = function(name){
  if(name)current_sketch.name = name;
  serverside.post_sketch(function(data){
    console.log(data);
    current_sketch.online = true;
    current_sketch.sketchid = data.sketchid;
  }, function(error){
    console.log(error);
  });
}

serverside.load_sketches_by_user = function(user, num, success, error){
  if(!num){
    num = "all";
  }

  $.get(serverside.to_abs_url("/sketches/" + user + "/" + num)).done(function(data){success($.parseJSON(data));}).error(error);
}

serverside.load_sketch = function(id){
  serverside.get_sketch(id,
    function(data){
      console.log(data);
      serverside.recompose_execution_pane(data.blocks);
      current_sketch.online = true;
      current_sketch.sketchid = data.sketchid;
      current_sketch.author = data.by;
      current_sketch.name = data.name;
    },
    function(error){
      console.log(error);
    }
  );
};

serverside.recompose_execution_pane = function(data, parent){
  if(!data.blocks)return undefined;
  var blocks = [];
  for(var i = 0;i < data.blocks.length;i ++){
    var block = recompose_block(data.blocks[i]);
    blocks.push(block);
  }
  console.log(blocks);
  execution_pane.blocks = blocks;
  execution_pane.draw();
}

serverside.to_abs_url = function(uri){
  return serverside.root_server_url + uri;
}

serverside.register_device = function(name, success, error){
  var toSend = {
    //Totally secure way of generating a uuid if we dont have one (i.e. not running on device)
    uuid: (typeof device !== 'undefined') ? device.uuid : Math.floor(Math.random() * 1000000),
    username: name
  };

  localStorage.uuid = toSend.uuid;

  $.post(serverside.to_abs_url("/user"), $.param(toSend)).done(function(data){success($.parseJSON(data))}).error(error);
}

serverside.post_sketch = function(success, error){
  storage.get_auth_token(function(token){
    var uuid = localStorage.uuid;
    var name = current_sketch.name;
    var contents = JSON.stringify(decompose_execution_pane());
    var preview = $("#paper_canvas")[0].toDataURL().substring("data:image/png;base64,".length);
    var sendBlob = {
      token: token,
      uuid: uuid,
      sketch_name: name,
      sketch_contents: contents,
      sketch_demo_blob: preview
    };

    $.post(serverside.to_abs_url("/sketches"), $.param(sendBlob)).done(success).error(error);
  });
}

serverside.get_sketch = function(id, success, error){
  $.get(serverside.to_abs_url("/sketch/" + id)).done(function(data){success($.parseJSON(data));}).error(error);
}

serverside = {};

function decompose_block(block){
  var block_decomp = {
    name: block.name;
    palette_index: block.palette_index;
    multi_block: block.multi_block;
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

serverside.post_sketch = function(){
  var uuid = encodeURIComponent("colin");//device.uuid;
  var name = encodeURIComponent(current_sketch.name);
  var contents = encodeURIComponent(decompose_execution_pane());
}

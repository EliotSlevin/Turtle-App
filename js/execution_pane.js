/**
* Initialises Execution Pane
* Sets up the droppable event to add blocks to this pane when dropped on
**/
function init_execution_pane(){
  $(".program").droppable({
    drop: on_drop_on_execution_pane
  });
  console.log("Initted Execution Pane");
}

function run_execution(canvas){
  //Clear the canvas
  canvas.project.activeLayer.removeChildren();
  var context = make_default_context();

  //Recurse down the program tree, waiting for each instruction to finish before running the next
  var i = 0;
  function run_next_block(){
    execution_pane.blocks[i].dom_element.addClass("running");
    execution_pane.blocks[i].action(context, canvas, function(){
      execution_pane.blocks[i].dom_element.removeClass("running");
      if(++i >= execution_pane.blocks.length){
        return;
      }
      run_next_block();
    });
  }
  $(".running").removeClass("running");//Clear current running, if it exists
  run_next_block();
}

/**
  * Constructs the DOM of the execution pane
  **/
function draw_execution_pane(){
  var src = "";
  var i = 0;

  var parent_dom_element = $(".program");
  //Construct Execution Pane DOM
  parent_dom_element.html("");
  console.log("Rendering " + execution_pane.blocks.length + " blocks in execution pane");
  for(var i = 0;i < execution_pane.blocks.length;i ++){
    var block = execution_pane.blocks[i];
    if(block.multi_block){
      draw_multi_code_block(parent_dom_element, execution_pane.blocks, i);
    }
    else{
      draw_normal_code_block(parent_dom_element, execution_pane.blocks, i);
    }
  }

  $(".multiblock").droppable({
    drop: on_drop_on_multi_block,
    greedy: true //Prevents propogation to execution pane
  });
}

/**
  * Called to draw a normal code block
  * @param parent_dom_object The DOM object which this code block will be added to
  * @param block The Block object (As described in the data structures file) to draw
  * @param index The index of the above block object in the execution_pane object
  **/
function draw_normal_code_block(parent_dom_object, parent_block_array, index){
  var block = parent_block_array[index];
  var codeblock_div = $(block.palette_id).clone();
  block.dom_element = codeblock_div;
  codeblock_div.removeAttr("id");//Prevents destroying our DOM by having multiple element with the same ID
  codeblock_div.addClass("execution_pane_block").data('execution_pane_reference', block);

  codeblock_div.draggable({helper: function(){
    var block =  parent_block_array.splice(index, 1);
    return codeblock_div.data('block_ref', block);
  }, scroll:false, zindex: 2500, appendTo: "body"});

  if(parent_dom_object)parent_dom_object.append(codeblock_div);
  else return codeblock_div;
}

/**
  * Called to draw a multi-code-block, i.e. a code block that can contain
  * other code blocks
  **/
function draw_multi_code_block(parent_dom_object, parent_block_array, index){
  var block = parent_block_array[index];
  var multiblock_div = $(block.palette_id).clone();
  multiblock_div.removeAttr("id");
  multiblock_div.addClass('execution_pane_block').addClass('multiblock');
  multiblock_div.attr('code_palette_index', block.palette_index).data('execution_pane_reference', block);
  block.dom_element = multiblock_div;
  var contents_div = $("<div class='multiblock_contents'>");
  for(var j = 0;j < block.blocks.length;j ++){
    var codeblock_div = $("<div />");
    //The size here will need to be adjusted when we are not resizing the large image
    if(block.blocks[j].multi_block){
      draw_multi_code_block(contents_div, block.blocks, j);
    }
    else{
      draw_normal_code_block(contents_div, block.blocks, j);
    }
    contents_div.append(codeblock_div);
  }

  multiblock_div.draggable({helper: function(){
    var block = parent_block_array.splice(index, 1);
    return multiblock_div.data('block_ref', block);
  }, scroll:false, zindex: 2500, appendTo: "body"});

  multiblock_div.append(contents_div);

  if(parent_dom_object)parent_dom_object.append(multiblock_div);
  else return multiblock_div;
}

/**
  * Called when a code block is dropped onto the execution pane
  **/
function on_drop_on_execution_pane(event, ui){
  drop_on(ui.draggable, $(this), execution_pane);
}

/**
  * Called when a block from the palette is dropped onto a multi-block (loop/if) in the
  * execution pane
  **/
function on_drop_on_multi_block(event, ui){
  drop_on(ui.draggable, $(this), $(this).data("execution_pane_reference"));
}

function drop_on(dropped, dropped_on, parent_block){
  if(dropped_on != dropped.parent()){
    var palette_index = Number(dropped.attr("code_palette_index"));
    var template = palette.blocks[palette_index];
    var existing_block = dropped.data('block_ref');
    var new_execution_block = (existing_block ? existing_block['0'] : new CodeBlock(template.name, template.palette_id, template.action, template.multi_block));
    new_execution_block.palette_index = palette_index;
    parent_block.blocks.push(new_execution_block);
  }
  draw_execution_pane();
}

execution_pane = {
  blocks: [],
  init: init_execution_pane,
  run : run_execution
};

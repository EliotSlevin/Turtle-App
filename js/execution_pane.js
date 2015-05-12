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
    execution_pane.blocks[i].action(context, canvas, function(){
      if(++i >= execution_pane.blocks.length)return;
      run_next_block();
    });
  }
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
      draw_multi_code_block(parent_dom_element, block, i);
    }
    else{
      draw_normal_code_block(parent_dom_element, block, i);
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
function draw_normal_code_block(parent_dom_object, block, index){
  var codeblock_div = $(block.palette_id).clone();
  console.log(codeblock_div.html());
  codeblock_div.addClass("execution_pane_block").attr('code_palette_index', block.palette_index).data('execution_pane_reference', block);
  if(parent_dom_object)parent_dom_object.append(codeblock_div);
  else return codeblock_div;
}

/**
  * Called to draw a multi-code-block, i.e. a code block that can contain
  * other code blocks
  **/
function draw_multi_code_block(parent_dom_object, block, index){
  var multiblock_div = $(block.palette_id).clone();
  multiblock_div.removeAttr("id");
  multiblock_div.addClass('execution_pane_block').addClass('multiblock');
  multiblock_div.attr('code_palette_index', block.palette_index).data('execution_pane_reference', block);

 var contents_div = $("<div class='multiblock_contents'>");
 for(var j = 0;j < block.blocks.length;j ++){
    var codeblock_div = $("<div />");
    //The size here will need to be adjusted when we are not resizing the large image
    if(block.blocks[j].multi_block){
      draw_multi_code_block(contents_div, block.blocks[j], j, block);
    }
    else{
      draw_normal_code_block(contents_div, block.blocks[j], j, block);
    }
    contents_div.append(codeblock_div);
  }

  multiblock_div.append(contents_div);

  if(parent_dom_object)parent_dom_object.append(multiblock_div);
  else return multiblock_div;
}

/**
  * Called when a code block is dropped onto the execution pane
  **/
function on_drop_on_execution_pane(event, ui){
  var palette_index = Number(ui.draggable.attr("code_palette_index"));
  var template = palette.blocks[palette_index];
  var new_execution_block = new CodeBlock(template.name, template.palette_id, template.action, template.multi_block);
  new_execution_block.execution_pane_index = execution_pane.blocks.length;
  execution_pane.blocks.push(new_execution_block);
  draw_execution_pane();
}

/**
  * Called when a block from the palette is dropped onto a multi-block (loop/if) in the
  * execution pane
  **/
function on_drop_on_multi_block(event, ui){
  var parent_block = $(this).data("execution_pane_reference");
  console.log(ui.draggable.attr("code_palette_index"));
  var template = palette.blocks[ui.draggable.attr("code_palette_index")];
  var new_execution_block = new CodeBlock(template.name, template.palette_id, template.action, template.multi_block);

  parent_block.blocks.push(new_execution_block);
  draw_execution_pane();
}

execution_pane = {
  blocks: [],
  init: init_execution_pane,
  run : run_execution
};

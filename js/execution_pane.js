/**
* Initialises Execution Pane
* Sets up the droppable event to add blocks to this pane when dropped on
**/
function init_execution_pane(){
  $(".program").droppable({
    tolerance:'pointer',
    drop: on_drop_on_execution_pane,
    greedy: true
  });
  console.log("Initted Execution Pane");
}

function run_execution(canvas, immediate){
  //Clear the canvas
  if(typeof immediate === 'undefined'){
    var context = make_default_context();
    paper.turtle_layer.removeChildren();
    paper.turtle_layer.activate();
    paper.view.turtle = new paper.Raster({source: "img/turtle.jpg"});
    paper.view.turtle.position = paper.view.center;
    paper.view.turtle.onLoad = function(){
      paper.view.turtle.width = 50;
      paper.view.turtle.height = 50;
      if(context.speed === 100){
        run_next_block(execution_pane);
      }
      else{
        run_next_block();
      }
    }
    rotate_turtle(180);
    paper.sketch_layer.activate();
    paper.sketch_layer.removeChildren();
  }
  else{
    var context = make_immediate_context();
    if(paper.sketch_layer){
      paper.sketch_layer.activate();
      paper.sketch_layer.removeChildren();
    }
    else{
      paper.project.activeLayer.removeChildren();
    }
    if(paper.view.turtle)paper.view.turtle.opacity = 0;
    run_next_block(execution_pane);
  }

  //Recurse down the program tree, waiting for each instruction to finish before running the next
  var i = 0;
  function run_next_block(block){
    if(typeof block !== 'undefined'){
      for(var j = 0;j < block.blocks.length;j++){
        block.blocks[j].immediate_action(context, canvas);
      }
    }
    else{
      if(execution_pane.blocks[i])execution_pane.blocks[i].dom_element.addClass("running");
      else return;
      execution_pane.blocks[i].action(context, canvas, function(){
        if(execution_pane.blocks[i])execution_pane.blocks[i].dom_element.removeClass("running");
        else return;
        if(++i >= execution_pane.blocks.length){
          $(".running").removeClass("running");
          return;
        }
        run_next_block();
      });
    }
  }
  $(".running").removeClass("running");//Clear current running, if it exists
}

function clear(){
  execution_pane.blocks = [];
  current_sketch = {name: "new_sketch", online_sketch_id: null, local_sketch_id: Number(localStorage.sketch_counter)};
  execution_pane.draw();
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
  parent_dom_element.append(createSpacer(execution_pane, -1));//Droppable for between blocks (pretty hacky, yeah)
  for(var i = 0;i < execution_pane.blocks.length;i ++){
    var block = execution_pane.blocks[i];
    if(block.multi_block){
      draw_multi_code_block(parent_dom_element, execution_pane.blocks, i);
    }
    else{
      draw_normal_code_block(parent_dom_element, execution_pane.blocks, i);
    }

    parent_dom_element.append(createSpacer(execution_pane, i));//Droppable for between blocks (pretty hacky, yeah)
  }

  $(".multiblock").droppable({
    drop: on_drop_on_multi_block,
    tolerance:'pointer',
    greedy: true //Prevents propogation to execution pane
  });

  $(".parameter").click(function(){
    parameters.current_editing = $(this).parent().data('execution_pane_reference');
    parameters.current_editing.on_open_modal();
    window.location.hash = $(this).parent().data('execution_pane_reference').modal_id;
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
  if(typeof block.on_draw_parameters !== "undefined"){
    block.on_draw_parameters(codeblock_div.children(".parameter"));
  }
  block.dom_element = codeblock_div;
  codeblock_div.removeAttr("id");//Prevents destroying our DOM by having multiple element with the same ID
  codeblock_div.addClass("execution_pane_block").data('execution_pane_reference', block);

  codeblock_div.draggable({helper: function(){
    var block =  parent_block_array.splice(index, 1);
    return codeblock_div.data('block_ref', block);
  }, stop: function(){
    storage.save_local_sketch();
    execution_pane.draw();
  }, scroll:false, zindex: 2500, appendTo: "body"});

  if(parent_dom_object)parent_dom_object.append(codeblock_div);
  else return codeblock_div;
}

function createSpacer(parent_block, i){
  var spacer = $("<div>");
  spacer.addClass("execution_pane_spacer");
  spacer.attr("index", i);
  spacer.data("parent_block", parent_block);
  spacer.droppable({
    tolerance:'pointer',
    greedy:true,
    over: function(){
      $(this).addClass("execution_pane_spacer_highlight");
      //Need to check whether $(this).parent().parent() is actually droppable
      $(this).parent().parent().droppable("disable");
    },
    out: function(){
      $(this).removeClass("execution_pane_spacer_highlight");
      //Need to check whether $(this).parent().parent() is actually droppable
      $(this).parent().parent().droppable("enable");
    },
    drop: on_drop_on_spacer
  });

  return spacer;
}

/**
  * Called to draw a multi-code-block, i.e. a code block that can contain
  * other code blocks
  **/
function draw_multi_code_block(parent_dom_object, parent_block_array, index){
  var block = parent_block_array[index];
  var multiblock_div = $(block.palette_id).clone();

  if(typeof block.on_draw_parameters !== "undefined"){
    block.on_draw_parameters(multiblock_div.children(".parameter"));
  }

  multiblock_div.removeAttr("id");
  multiblock_div.addClass('execution_pane_block').addClass('multiblock');
  multiblock_div.attr('code_palette_index', block.palette_index).data('execution_pane_reference', block);
  block.dom_element = multiblock_div;
  var contents_div = $("<div class='multiblock_contents'>");
  contents_div.append(createSpacer(block, -1));
  for(var j = 0;j < block.blocks.length;j ++){
    //The size here will need to be adjusted when we are not resizing the large image
    if(block.blocks[j].multi_block){
      draw_multi_code_block(contents_div, block.blocks, j);
    }
    else{
      draw_normal_code_block(contents_div, block.blocks, j);
    }
    contents_div.append(createSpacer(block, j));//Droppable for between blocks (pretty hacky, yeah)
  }

  multiblock_div.draggable({helper: function(){
    var block = parent_block_array.splice(index, 1);
    return multiblock_div.data('block_ref', block);
  }, stop: function(){
    storage.save_local_sketch();
    execution_pane.draw();
  }, scroll:false, zindex: 2500, appendTo: "body"});

  multiblock_div.append(contents_div);

  if(parent_dom_object)parent_dom_object.append(multiblock_div);
  else return multiblock_div;
}

function on_drop_on_spacer(event, ui){
  drop_on(ui.draggable, $(this).parent(), $(this).data().parent_block, Number($(this).attr("index")) + 1);
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

/**
  * Handle drop events.
  * Handles the event where dropped is dropped on dropped_on, with the parent DOM object
  **/
function drop_on(dropped, dropped_on, parent_block, index){
  if(dropped_on != dropped.parent()){
    var palette_index = Number(dropped.attr("code_palette_index"));
    var template = palette.blocks[palette_index];
    var existing_block = dropped.data('block_ref');
    var new_execution_block = (existing_block ? existing_block['0'] : new CodeBlock(template.name, template.palette_id, template.modal_id, template.action, template.immediate_action, template.on_open_modal, template.on_close_modal, template.on_draw_parameters, template.default_parameters, template.multi_block));
    new_execution_block.palette_index = palette_index;
    if(typeof index === "undefined"){
      if(!parent_block)return;
      parent_block.blocks.push(new_execution_block);
    }
    else{
      dropped.attr("dropped", true);
      parent_block.blocks.splice(index, 0, new_execution_block);
    }
  }
  draw_execution_pane();
}

execution_pane = {
  blocks: [],
  init: init_execution_pane,
  run : run_execution,
  draw: draw_execution_pane,
  clear: clear
};

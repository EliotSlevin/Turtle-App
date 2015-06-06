//Block Defintions
var CodeBlock = function(name, palette_id, modal_id, action, multi_block){
  this.name = name;
  this.palette_index = -1;
  this.action = action;
  this.self = this;
  this.multi_block = multi_block || false;//Quick hack to turn undefined -> false
  this.palette_id = palette_id;
  this.modal_id = modal_id;
  if(this.multi_block){
    this.blocks = [];//Initialise the contents if we are a multiblocks
  }
}

/**
  * CODE BLOCK DEFINITIONS
  **/
var jump = new CodeBlock("jump", "#jump", "jump_modal", function(drawing_context, canvas, next){
  drawing_context.pen_x = 100;
  drawing_context.pen_y = 100;
  next();
});

var move = new CodeBlock("move", "#move", "move_modal", function(drawing_context, canvas, next){
  if(drawing_context.pen_down){
    var start_x = drawing_context.pen_x;
    var start_y = drawing_context.pen_y;
    drawing_context.pen_x += 50 * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
    drawing_context.pen_y += 50 * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
    draw_line(canvas, start_x, start_y, drawing_context.pen_x, drawing_context.pen_y, next, drawing_context);
  }
  else{
    drawing_context.pen_x += 50 * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
    drawing_context.pen_y += 50 * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
    next();
  }
});

var rotate = new CodeBlock("rotate", "#rotate", "rotate_modal", function(drawing_context, canvas, next){
  drawing_context.pen_angle += 72;
  next();
});

var pen_down = new CodeBlock("pen_down", "#pen_down", "__invalid__", function(drawing_context, canvas, next){
  drawing_context.pen_down = true;
  console.log("PenDown!");
  next();
});

var pen_up = new CodeBlock("pen_up", "#pen_up", "__invalid__", function(drawing_context, canvas, next){
  drawing_context.pen_down = false;
  console.log("PenUp!");
  next();
});

var set_stroke = new CodeBlock("set_stroke", "#set_stroke", "stroke_modal", function(drawing_context, canvas, next){
  drawing_context.stroke_color = "white";
  drawing_context.stoke_weight = 5;
  next();
});

var set_fill = new CodeBlock("set_fill", "#set_fill", "fill_modal",  function(drawing_context, canvas, next){
  drawing_context.fill_colour = "white";
  next();
});

//Draw a circle
var circle = new CodeBlock("circle", "#circle", "circle_modal", function(drawing_context, canvas, next){
  draw_ellipse(canvas, drawing_context.pen_x, drawing_context.pen_y, 25, 25, next, drawing_context);
});

//Draw a square
var rectangle = new CodeBlock("rectangle", "#rectangle", "rectangle_modal", function(drawing_context, canvas, next){
  console.log("Rectangle");
  draw_rect(canvas, drawing_context.pen_x, drawing_context.pen_y, 25, 25, next, drawing_context);
});

//Loop 5 times
var loop = new CodeBlock("loop", "#loop", "loop_modal", function(drawing_context, canvas, next){
  var self = this;
  var i = 0;
  var run_count = 0;
  var max_runs = 5;
  function run_next_block(){
    if(self && self.blocks[i])self.blocks[i].dom_element.addClass("running");
    else return;
    self.blocks[i].action(drawing_context, canvas, function(){
      if(self && self.blocks[i])self.blocks[i].dom_element.removeClass("running");
      else return;
      if(++i >= self.blocks.length){
        i = 0;
        if(++run_count == max_runs){
          next();
          return;
        }
      }
      run_next_block();
    });
  }
  console.log("Running loop");
  if(self.blocks.length > i)run_next_block();
  else next();
}, true);

/**
  * Called when the app starts. Does nothing ATM
  **/
function init_palette(){
  //Preload Images
  for(var block = 0;block < palette.blocks.length;block ++){
    var id = palette.blocks[block].palette_id;
    $(id).draggable({zindex: 2500, helper:"clone", revert:"invalid", appendTo:"body", containment: 'window'});
    $(id).attr("code_palette_index", block);
  }
}

/**
  * Constructs the DOM for the code palette. Could possible be done in the
  * HTML but sort of annoying to link back to CodeBlock Objects. (See the code_palette_index attribute)
  **/
function draw_palette(width, height){}

palette = {
  blocks: [
    jump,
    move,
    rotate,
    pen_down,
    pen_up,
    set_stroke,
    set_fill,
    circle,
    rectangle,
    loop
  ],
  init: init_palette
};

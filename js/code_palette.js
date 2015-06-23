//Block Defintions
var CodeBlock = function(name, palette_id, modal_id, action, immediate_action, on_open_modal, on_close_modal, draw_parameters, default_parameters, multi_block){
  this.name = name;
  this.palette_index = -1;
  this.action = action;
  this.self = this;
  this.multi_block = multi_block || false;//Quick hack to turn undefined -> false
  this.palette_id = palette_id;
  this.modal_id = modal_id;

  if(typeof immediate_action === 'undefined'){
    this.immediate_action = action;
  }
  else{
    this.immediate_action = immediate_action;
  }

  this.default_parameters = default_parameters;
  this.parameters = jQuery.extend(true, {}, this.default_parameters);//Deep clone of the default parameters

  this.on_open_modal = on_open_modal;
  this.on_close_modal = on_close_modal;
  this.on_draw_parameters = draw_parameters;

  if(this.multi_block){
    this.blocks = [];//Initialise the contents if we are a multiblocks
  }
}

/**
  * CODE BLOCK DEFINITIONS
  **/
var jump = new CodeBlock("jump", "#jump", "jump_modal", function(drawing_context, canvas, next){
  drawing_context.pen_x = this.parameters.x;
  drawing_context.pen_y = this.parameters.y;
  if(next)next();
}, undefined, function(){
  $("#jump_modal_x").val(this.parameters.x);
  $("#jump_modal_y").val(this.parameters.y);
  $("#jump_x_indic").html(this.parameters.x);
  $("#jump_y_indic").html(this.parameters.y);
}, function(){
  parameters.current_editing.parameters.x = $("#jump_modal_x").val();
  parameters.current_editing.parameters.y = $("#jump_modal_y").val();
}, function(parameter_block){
  parameter_block.html("X: " + this.parameters.x + ", Y: " + this.parameters.y);
}, {x: 100, y: 100});

var move = new CodeBlock("move", "#move", "move_modal", function(drawing_context, canvas, next){
  if(drawing_context.pen_down){
    var start_x = drawing_context.pen_x;
    var start_y = drawing_context.pen_y;
    drawing_context.pen_x += this.parameters.distance * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
    drawing_context.pen_y += this.parameters.distance * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
    draw_line(canvas, start_x, start_y, drawing_context.pen_x, drawing_context.pen_y, next, drawing_context);
  }
  else{
    var change = 0;
    var current_x = drawing_context.pen_x, current_y = drawing_context.pen_y;
    var self = this;
    paper.view.turtle.onFrame = function(){
      if(change >= self.parameters.distance){
        change = self.parameters.distance;
        paper.view.turtle.onFrame = undefined;
        drawing_context.pen_x += self.parameters.distance * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
        drawing_context.pen_y += self.parameters.distance * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
        if(next)next();
      }
      else{
        var adj_dist = (self.parameters.distance / 100) * drawing_context.speed;
        change += adj_dist;
        current_x += adj_dist * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
        current_y += adj_dist * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
        move_turtle(current_x, current_y);
      }
    }
  }
}, function(drawing_context, canvas){
  if(drawing_context.pen_down){
    var start_x = drawing_context.pen_x;
    var start_y = drawing_context.pen_y;
    drawing_context.pen_x += this.parameters.distance * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
    drawing_context.pen_y += this.parameters.distance * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
    draw_line(canvas, start_x, start_y, drawing_context.pen_x, drawing_context.pen_y, undefined, drawing_context);
  }
  else{
    drawing_context.pen_x += this.parameters.distance * Math.sin(drawing_context.pen_angle * (Math.PI / 180));
    drawing_context.pen_y += this.parameters.distance * Math.cos(drawing_context.pen_angle * (Math.PI / 180));
  }
},function(){
  $("#move_dist_indic").html(this.parameters.distance);
  $("#move_modal_dist").val(this.parameters.distance);
}, function(){
  this.parameters.distance = $("#move_modal_dist").val();
},
function(parameter_block){
  parameter_block.html(this.parameters.distance + " px");
}, {distance: 50});

var rotate = new CodeBlock("rotate", "#rotate", "rotate_modal", function(drawing_context, canvas, next){
  drawing_context.pen_angle += this.parameters.theta;
  var change = 0;
  var self = this;
  var oldRotation = (paper.view.turtle.rotation < 0 ? 360 + paper.view.turtle.rotation : paper.view.turtle.rotation);
  paper.view.turtle.onFrame = function(){
    if(change >= self.parameters.theta){
      change = self.parameters.theta;
      var norm_rotation = (paper.view.turtle.rotation < 0 ? 360 + paper.view.turtle.rotation : paper.view.turtle.rotation);
      console.log("Error: " + (norm_rotation - oldRotation - self.parameters.theta));
      rotate_turtle(-(norm_rotation - oldRotation - self.parameters.theta));
      paper.view.turtle.onFrame = undefined;
      if(next)next();
    }
    else{
      change += drawing_context.speed * (self.parameters.theta / 100);
      rotate_turtle(drawing_context.speed * (self.parameters.theta / 100));
    }
  }
}, function(drawing_context, canvas){
  drawing_context.pen_angle += this.parameters.theta;
}, function(){//On Open Modal
  $("#rotate_angle_indic").html(this.parameters.theta);
  $("#rotate_modal_theta").val(this.parameters.theta);
}, function(){//On Close Modal
    this.parameters.theta = Number($("#rotate_modal_theta").val());
}, function(parameter_block){//On Draw Parameters
  parameter_block.html(this.parameters.theta + "°");
}, {theta: 0});

var pen_down = new CodeBlock("pen_down", "#pen_down", "__invalid__", function(drawing_context, canvas, next){
  drawing_context.pen_down = true;
  if(next)next();
}, undefined, undefined, undefined, undefined, {});

var pen_up = new CodeBlock("pen_up", "#pen_up", "__invalid__", function(drawing_context, canvas, next){
  drawing_context.pen_down = false;
  if(next)next();
}, undefined, undefined, undefined, undefined, {});

var set_stroke = new CodeBlock("set_stroke", "#set_stroke", "stroke_modal", function(drawing_context, canvas, next){
  drawing_context.stroke_colour = new paper.Color(this.parameters.colour);
  drawing_context.stroke_weight = this.parameters.width;
  if(next)next();
}, undefined, function(){
  $("#stroke_modal_width").val(this.parameters.width);
  $("#stroke_modal_colour").val(this.parameters.colour);
}, function(){
  this.parameters.width = Number($("#stroke_modal_width").val());
  this.parameters.colour = $("#stroke_modal_colour").val();
}, function(parameter_block){
  parameter_block.html("Colour: " + this.parameters.colour + ", Width: " + this.parameters.width);
}, {width: 2, colour: "#FFFFFF"});

var set_fill = new CodeBlock("set_fill", "#set_fill", "fill_modal",  function(drawing_context, canvas, next){
  drawing_context.fill_colour = new paper.Color(this.parameters.colour);
  if(next)next();
}, undefined, function(){
  $("#fill_modal_colour_picker").val(parameters.current_editing.parameters.colour);
}, function(){
  parameters.current_editing.parameters.colour = $("#fill_modal_colour_picker").val();
}, function(parameter_block){
  parameter_block.html(this.parameters.colour);
}, {colour: "#FFFFFF"});

//Draw a circle
var circle = new CodeBlock("circle", "#circle", "circle_modal", function(drawing_context, canvas, next){
  draw_ellipse(canvas, drawing_context.pen_x, drawing_context.pen_y, this.parameters.width, this.parameters.width, next, drawing_context);
}, function(drawing_context, canvas){
  var circ = new paper.Path.Circle(new paper.Point(drawing_context.pen_x, drawing_context.pen_y), this.parameters.width);
  circ.strokeColor = drawing_context.stroke_colour;
  circ.strokeWidth = drawing_context.stroke_weight;
  var color = drawing_context.fill_colour._components;
  circ.fillColor = new paper.Color(color[0], color[1], color[2], 255);
}, function(){
  $("#circle_rad_indic").html(this.parameters.width);
  $("#circle_modal_radius").val(this.parameters.width);
}, function(){
  this.parameters.width = Number($("#circle_modal_radius").val());
}, function(parameter_block){
  parameter_block.html("Radius: " + this.parameters.width + " px");
}, {width: 100});

//Draw a rectangle
var rectangle = new CodeBlock("rectangle", "#rectangle", "rectangle_modal", function(drawing_context, canvas, next){
  draw_rect(canvas, drawing_context.pen_x, drawing_context.pen_y, this.parameters.width, this.parameters.height, next, drawing_context);
}, function(drawing_context, canvas){
  var rect = new paper.Path();
  rect.moveTo(new paper.Point(drawing_context.pen_x, drawing_context.pen_y));
  var current_x = drawing_context.pen_x;
  var current_y = drawing_context.pen_y;

  for(var i = 0;i < 4;i ++){
    var dist = (i % 2 == 0) ? this.parameters.height : this.parameters.width;
    var angle = ((drawing_context.pen_angle + 90 * (i+1)) % 360) * (Math.PI / 180);
    var dist_x = Math.cos(angle) * dist;
    var dist_y = Math.sin(angle) * dist;
    rect.lineTo(new paper.Point(current_x - dist_x, current_y + dist_y));
    current_x -= dist_x;
    current_y += dist_y;
  }

  rect.strokeColor = drawing_context.stroke_colour;
  rect.strokeWidth = drawing_context.stroke_weight;
  var color = drawing_context.fill_colour._components;
  rect.fillColor = new paper.Color(color[0], color[1], color[2], 255);
}, function(){
  $("#rect_modal_width").val(this.parameters.width);
  $("#rect_modal_height").val(this.parameters.height);
  $("#rect_width_indic").html(this.parameters.width);
  $("#rect_height_indic").html(this.parameters.height);
}, function(){
  this.parameters.width = Number($("#rect_modal_width").val());
  this.parameters.height = Number($("#rect_modal_height").val());
}, function(parameter_block){
  parameter_block.html("Width: " + this.parameters.width + ", Height: " + this.parameters.height);
}, {width: 100, height: 100});

//Draw a triangle
var triangle = new CodeBlock("triangle", "#triangle", "triangle_modal", function(drawing_context, canvas, next){
  draw_triangle(canvas, drawing_context.pen_x, drawing_context.pen_y, this.parameters.radius, next, drawing_context);
}, function(drawing_context, canvas){
  path.moveTo(new paper.Point(x, y));
  for(var i = 0;i < 3;i ++){
    var angle = ((image_context.pen_angle + i * 120) % 360) * (Math.PI / 180);
    var dist_x = Math.sin(angle) * radius;
    var dist_y = Math.cos(angle) * radius;
    path.lineTo(x + dist_x, y + dist_y);
    x += dist_x;
    y += dist_y;
  }
}, function(){
  $("#triangle_modal_radius").val(this.parameters.radius);
  $("#triangle_rad_indic").html(this.parameters.radius);
}, function(){
  this.parameters.radius = $("#triangle_modal_radius").val();
}, function(parameter_block){
  parameter_block.html("Radius: " + this.parameters.radius);
}, {radius: 100});

//Loop 5 times
var loop = new CodeBlock("loop", "#loop", "loop_modal", function(drawing_context, canvas, next){
  var self = this;
  var i = 0;
  var run_count = 0;
  var max_runs = this.parameters.max;
  function run_next_block(){
    if(!self || !self.blocks[i])return;
    self.blocks[i].action(drawing_context, canvas, function(){
      if(!self || !self.blocks[i])return;
      if(++i >= self.blocks.length){
        i = 0;
        if(++run_count == max_runs){
          if(next)next();
          return;
        }
      }
      run_next_block();
    });
  }
  if(this.blocks.length > i)run_next_block();
  else if(next)next();
}, function(drawing_context, canvas){
  var run_count = 0;
  var max_runs = this.parameters.max;
  for(var i = 0;i < this.parameters.max;i ++){
    for (var j = 0;j < this.blocks.length;j ++){
      this.blocks[j].immediate_action(drawing_context, canvas);
    }
  }
}, function(){
  $("#loop_times_indic").html(this.parameters.max);
  $("#loop_modal_times").val(this.parameters.max);
}, function(){
  this.parameters.max = Number($("#loop_modal_times").val());
}, function(parameter_block){
  parameter_block.html(this.parameters.max + " times");
}, {max: 5}, true);

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
    loop,
    triangle
  ],
  init: init_palette
};

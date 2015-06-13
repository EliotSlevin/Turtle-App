function init_drawing(canvas){}

/**
  * Returns the default state of the sketch,
  * position, angle, colours + speed information about how fast to draw
  **/
function make_default_context(){
  return {
    pen_x: 200, //The x position of the pen
    pen_y: 100, //The y position of the pen
    pen_angle: 0, //The angle of the pen
    fill_colour: new paper.Color(1, 1, 1, 1), //The current fill folour
    stroke_colour: new paper.Color(1, 1, 1, 1), //The current stroke colour
    stroke_weight: 2, //The thickness of borders around shapes
    pen_down: true, //Whether then pen will draw on move or not
    speed: 10, //The speed to draw the outline of shapes (Out of 100)
    alpha_speed: 255 //The speed to draw the inside of shapes (Out of 255)
  };
}

/**
  * Draws a line on the given canvas from (start_x, start_y) to (end_x, end_y)
  * Calls next() when complete
  **/
function draw_line(canvas, start_x, start_y, end_x, end_y, next, image_context){

  /**
    * Draws a partial line between (start_x, start_y) and (end_x, end_y)
    * The percentage of the line to draw is given by amount
    **/
  function make_line_path(path, start_x, start_y, end_x, end_y, amount){
    path.moveTo(new paper.Point(start_x, start_y));
    var dist_x = (end_x - start_x);
    var dist_y = (end_y - start_y);
    var total_dist = Math.sqrt(dist_x * dist_x + dist_y * dist_y) * (amount / 100);
    var angle = Math.atan2(dist_x, dist_y);
    var dist_x = Math.sin(angle) * total_dist;
    var dist_y = Math.cos(angle) * total_dist;

    path.lineTo(start_x + dist_x, start_y + dist_y);
  }

  var path = new paper.Path();
  path.strokeColor = image_context.stroke_colour;
  path.strokeWidth = image_context.stroke_weight;
  path.fillColor = image_context.fill_colour;
  path.amount = 0;
  path.alpha = 0;
  path.completed = false;
  make_line_path(path, start_x, start_y, end_x, end_y, 0);//Draw line with 0 size to begin
  path.onFrame = function(){
    //If we haven't full drawn the line yet
    if(path.amount < 100){
      path.removeSegments();//Destroy the previous line
      make_line_path(path, start_x, start_y, end_x, end_y, path.amount += image_context.speed);
      paper.view.draw();
    }
    if(!path.completed && path.amount >= 100){
      //Call next when done, and mark us as done
      path.amount = 100;
      path.completed = true;
      if(next)next();
    }
  }
}

/**
  * Draws and fills in a rectangle with top left corner (x, y)
  * and size (w, h)
  **/
function draw_rect(canvas, x, y, w, h, next, image_context){

  /**
    * Draws a partial border of a rectangle with top left corner (x, y)
    * and size (w, h). The percentage to draw is given by amount
    **/
  function make_rect_path(path, x, y, w, h, amount){
      path.moveTo(new paper.Point(x, y));
      var total_dist = (w * 2 + h * 2) * amount / 100.;

      //Top side
      if(w > total_dist){
        path.lineTo(x + total_dist, y);
        return;
      }
      else{
        path.lineTo(x + w, y);
        total_dist -= w;
      }

      //Right Side
      if(h > total_dist){
        path.lineTo(x + w, y + total_dist);
        return;
      }
      else{
        path.lineTo(x + w, y + h);
        total_dist -= h;
      }

      //Bottom Side
      if(w > total_dist){
        path.lineTo(x + w - total_dist, y + h);
        return;
      }
      else{
        path.lineTo(x, y + h);
        total_dist -= w;
      }

      //Left Side
      if(h > total_dist){
        path.lineTo(x, y + h - total_dist );
        return;
      }
      else{
        path.lineTo(x, y);
        total_dist -= h;
      }
    }

    var path = new paper.Path();
    path.strokeColor = image_context.stroke_colour;
    path.strokeWidth = image_context.stroke_weight;
    make_rect_path(path, x, y, w, h, 0);
    path.amount = 0;
    path.alpha = 0;
    path.completed = false;
    path.onFrame = function(){
      //If we are still drawing the outline
      if(path.amount < 100){
        path.removeSegments();
        make_rect_path(path, x, y, w, h, path.amount += image_context.speed);
        paper.view.draw();
      }

      //If we have completed the outline but not the filling in
      if(!path.completed && path.amount >= 100){
        path.alpha += image_context.alpha_speed;
        path.alpha = Math.min(path.alpha, 255);
	      var color = image_context.fill_colour._components;
        path.fillColor = new paper.Color(color[0], color[1], color[2], path.alpha / 255.);

        //Call next when we are done
        if(path.alpha == 255){
          if(next)next();
          path.completed = true;
        }
      }
    }
  }

/**
  * Draws the outline and inside of an ellipse, centered on (x, y), with size (w, h).
  * NOTE: Only looks ok with w === h, i.e. circles. Turns out drawing part of an ellipse is annoying
  **/
function draw_ellipse(canvas, x, y, w, h, next, image_context){
  /**
    * Draws a partial border of an ellipse, centered on (x, y), with size (w, h).
    * The percentage to draw is given by amount
    **/
  function make_ellipse_path(path, x, y, w, h, amount){
    var a = (360 * (amount / 100.)) * Math.PI / 180;
    if(amount == 100)a = Math.PI * 2 - 0.001;//Quick hack because paper doesn't like arcs starting and ending in the same place
    var ha = a / 2;

    var midx = x + w * Math.sin(ha);
    var midy = y - h * Math.cos(ha);

    var endx = x + w * Math.sin(a);
    var endy = y - h * Math.cos(a);

    path.moveTo(x, y - h);
    path.arcTo(new paper.Point(midx, midy), new paper.Point(endx, endy));
  }

  var path = new paper.Path();
  path.strokeColor = image_context.stroke_colour;
  path.strokeWidth = image_context.stroke_weight;
  make_ellipse_path(path, x, y, w, h, 0);
  path.amount = 0;
  path.completed = false;
  path.alpha = 0;
  path.onFrame = function(){
    //If we are still drawing the outside
    if(path.amount < 100){
      path.removeSegments();
      make_ellipse_path(path, x, y, w, h, path.amount += image_context.speed);
      paper.view.draw();
    }
    //If we are drawing the inside
    if(!path.completed && path.amount >= 100){
      path.alpha += image_context.speed * 5;
      path.alpha = Math.min(path.alpha, 255);
      var color = image_context.fill_colour._components;
      path.fillColor = new paper.Color(color[0], color[1], color[2], path.alpha / 255.);

      //Call next when done
      if(path.alpha == 255){
        if(next)next();
        path.completed = true;
      }
    }
  }
}


/**
  * Draws the outline and inside of an ellipse, centered on (x, y), with size (w, h).
  * NOTE: Only looks ok with w === h, i.e. circles. Turns out drawing part of an ellipse is annoying
  **/
function draw_triangle(canvas, x, y, radius, next, image_context){
  /**
    * Draws a partial border of an ellipse, centered on (x, y), with size (w, h).
    * The percentage to draw is given by amount
    **/
  function make_triangle_path(path, x, y, radius, amount){
    var total_length = (radius * 3) * (amount / 100);
    path.moveTo(new paper.Point(x, y));

    if(total_length < radius){
      var angle = image_context.pen_angle * (Math.PI / 180);
      var dist_x = Math.sin(angle) * total_length;
      var dist_y = Math.cos(angle) * total_length;
      path.lineTo(x + dist_x, y + dist_y);
      return;
    }
    else{
      var angle = image_context.pen_angle * (Math.PI / 180);
      var dist_x = Math.sin(angle) * radius;
      var dist_y = Math.cos(angle) * radius;
      path.lineTo(x + dist_x, y + dist_y);
      x += dist_x;
      y += dist_y;
      total_length -= radius;
    }

    if(total_length < radius){
      var angle = ((image_context.pen_angle + 120) % 360) * (Math.PI / 180);
      var dist_x = Math.sin(angle) * total_length;
      var dist_y = Math.cos(angle) * total_length;
      path.lineTo(x + dist_x, y + dist_y);
      return;
    }
    else{
      var angle = ((image_context.pen_angle + 120) % 360) * (Math.PI / 180);
      var dist_x = Math.sin(angle) * radius;
      var dist_y = Math.cos(angle) * radius;
      path.lineTo(x + dist_x, y + dist_y);
      x += dist_x;
      y += dist_y;
      total_length -= radius;
    }

    if(total_length < radius){
      var angle = ((image_context.pen_angle + 240) % 360) * (Math.PI / 180);
      var dist_x = Math.sin(angle) * total_length;
      var dist_y = Math.cos(angle) * total_length;
      path.lineTo(x + dist_x, y + dist_y);
      return;
    }
    else{
      var angle = ((image_context.pen_angle + 240) % 360) * (Math.PI / 180);
      var dist_x = Math.sin(angle) * radius;
      var dist_y = Math.cos(angle) * radius;
      path.lineTo(x + dist_x, y + dist_y);
    }
  }

  var path = new paper.Path();
  path.strokeColor = image_context.stroke_colour;
  path.strokeWidth = image_context.stroke_weight;
  make_triangle_path(path, x, y, radius, 0);
  path.amount = 0;
  path.completed = false;
  path.alpha = 0;
  path.onFrame = function(){
    //If we are still drawing the outside
    if(path.amount < 100){
      path.removeSegments();
      make_triangle_path(path, x, y, radius, path.amount += image_context.speed);
      paper.view.draw();
    }
    //If we are drawing the inside
    if(!path.completed && path.amount >= 100){
      path.alpha += image_context.speed * 5;
      path.alpha = Math.min(path.alpha, 255);
      var color = image_context.fill_colour._components;
      path.fillColor = new paper.Color(color[0], color[1], color[2], path.alpha / 255.);

      //Call next when done
      if(path.alpha == 255){
        if(next)next();
        path.completed = true;
      }
    }
  }
}

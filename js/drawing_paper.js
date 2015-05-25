function init_drawing(canvas){}

function make_default_context(){
  return {
    pen_x: 200,
    pen_y: 100,
    pen_angle: 0,
    fill_color: "white",
    stroke_color: "white",
    stroke_weight: 2,
    pen_down: true,
    speed: 10,
    alpha_speed: 255
  };
}

function draw_line(canvas, start_x, start_y, end_x, end_y, next, image_context){
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
  path.strokeColor = 'white';
  //path.fillColor = 'white';
  make_line_path(path, start_x, start_y, end_x, end_y, 0);
  path.amount = 0;
  path.completed = false;
  paper.view.draw();
  path.alpha = 0;
  path.onFrame = function(){
    if(path.amount < 100){
      path.removeSegments();
      make_line_path(path, start_x, start_y, end_x, end_y, path.amount += image_context.speed);
      paper.view.draw();
    }
    if(!path.completed && path.amount >= 100){
      path.amount = 100;
      path.completed = true;
      if(next)next();
    }
  }
}

function draw_rect(canvas, x, y, w, h, next, image_context){
  function make_rect_path(path, x, y, w, h, amount){
      path.moveTo(new paper.Point(x, y));
      var total_dist = (w * 2 + h * 2) * amount / 100.;
      if(w > total_dist){
        path.lineTo(x + total_dist, y);
        return;
      }
      else{
        path.lineTo(x + w, y);
        total_dist -= w;
      }

      if(h > total_dist){
        path.lineTo(x + w, y + total_dist);
        return;
      }
      else{
        path.lineTo(x + w, y + h);
        total_dist -= h;
      }

      if(w > total_dist){
        path.lineTo(x + w - total_dist, y + h);
        return;
      }
      else{
        path.lineTo(x, y + h);
        total_dist -= w;
      }

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
    path.strokeColor = 'white';
    make_rect_path(path, x, y, w, h, 0);
    path.amount = 0;
    path.alpha = 0;
    path.completed = false;
    paper.view.draw();
    path.onFrame = function(){
      if(path.amount < 100){
        path.removeSegments();
        make_rect_path(path, x, y, w, h, path.amount += image_context.speed);
        paper.view.draw();
      }

      if(!path.completed && path.amount >= 100){
        path.alpha += image_context.alpha_speed;
        path.alpha = Math.min(path.alpha, 255);
        path.fillColor = new paper.Color(1, 1, 1, path.alpha / 255.);
        if(path.alpha == 255){
          if(next)next();
          path.completed = true;
        }
      }
    }
  }

function draw_ellipse(canvas, x, y, w, h, next, image_context){
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
  path.strokeColor = 'white';
  //path.fillColor = 'white';
  make_ellipse_path(path, x, y, w, h, 0);
  path.amount = 0;
  path.completed = false;
  paper.view.draw();
  path.alpha = 0;
  path.onFrame = function(){
    if(path.amount < 100){
      path.removeSegments();
      make_ellipse_path(path, x, y, w, h, path.amount += image_context.speed);
      paper.view.draw();
    }
    if(!path.completed && path.amount >= 100){
      path.alpha += image_context.speed * 5;
      path.alpha = Math.min(path.alpha, 255);
      path.fillColor = new paper.Color(1, 1, 1, path.alpha / 255.);
      if(path.alpha == 255){
        if(next)next();
        path.completed = true;
      }
    }
  }
}

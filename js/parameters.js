parameters = {};

parameters.init_parameters = function(){
  $(".modal_save").click(function(){
    parameters.current_editing.on_close_modal();
    parameters.current_editing = null;
    execution_pane.draw();
  });

  var links = {};
  links["#move_modal_dist"] = "#move_dist_indic";
  links["#rotate_modal_theta"] = "#rotate_angle_indic";
  links["#loop_modal_times"] = "#loop_times_indic";
  links["#jump_modal_x"] = "#jump_x_indic";
  links["#jump_modal_y"] = "#jump_y_indic";
  links["#rect_modal_width"] = "#rect_width_indic";
  links["#rect_modal_height"] = "#rect_height_indic";
  links["#circle_modal_radius"] = "#circle_rad_indic";
  links["#triangle_modal_radius"] = "#triangle_rad_indic";

  for(var i in links){
    $(i).attr('link', links[i]);
    $(i)[0].oninput = function(){
      $($(this).attr('link')).html($(this).val());
    }
  }

  var values = $(".fill_color");
  values[0].oninput = values[1].oninput = values[2].oninput = function(){
    var red = $("#fill_color_red").val();
    var green = $("#fill_color_green").val();
    var blue = $("#fill_color_blue").val();

    var val = parseInt(red) << 16 | parseInt(green) << 8 | parseInt(blue);
    $("#fill_colour_indic").html("#" + val.toString(16).toUpperCase().padZero(6));
    $("#fill_colour_indic").css('color', "#" + val.toString(16).padZero(6));
  };
}

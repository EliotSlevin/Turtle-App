parameters = {};

parameters.init_parameters = function(){
  $(".modal_save").click(function(){
    parameters.current_editing.on_close_modal();
    parameters.current_editing = null;
    execution_pane.draw();
  });

  $("#move_modal_dist")[0].oninput = function(){
    $("#move_dist_indic").html($(this).val());
  };

  $("#rotate_modal_theta")[0].oninput = function(){
    $("#rotate_angle_indic").html($(this).val());
  }

  $("#loop_modal_times")[0].oninput = function(){
    $("#loop_times_indic").html($(this).val());
  }
}

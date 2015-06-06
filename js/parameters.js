parameters = {};

parameters.init_parameters = function(){
  $(".fill_modal_save").click(function(){
    parameters.current_editing.colour = $("#fill_modal_colour_picker").val();
    console.log(parameters.current_editing.colour);
    parameters.current_editing = null;
  });
}

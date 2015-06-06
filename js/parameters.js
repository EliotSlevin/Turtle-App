parameters = {};

parameters.init_parameters = function(){
  $(".modal_save").click(function(){
    parameters.current_editing.events.on_close_modal();
    parameters.current_editing = null;
  });
}

window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

current_sketch = {
  name: "this-is-a-sketch"
};

/* Maybe lets start the app from here */
$(document).ready(function() {
    palette.init();
    execution_pane.init();

    var canvas = paper.setup(document.getElementById("paper_canvas"));
    init_drawing(canvas);

    $("#play_button").click(function(){
      execution_pane.run(canvas);
    });
});

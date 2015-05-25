window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

current_sketch = {
  name: "this-is-a-sketch",
  author: "colin"
};

/* Maybe lets start the app from here */
$(document).ready(function() {
    palette.init();
    execution_pane.init();

    var canvas = paper.setup(document.getElementById("paper_canvas"));
    init_drawing(canvas);

    console.log($(".play_button"));

    $("#play_button").click(function(){
      console.log("Running Execution");
      execution_pane.run(canvas);
    });

    var source   = $("#sketch-browser-template").html();
    var template = Handlebars.compile(source);

    var context = {
      sketch: [
        "First Sketch",
        "Demo Program",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example",
        "Sketch example"
      ]
    }

    var html = template(context);
    $(".sketch-browser").html(html);
});

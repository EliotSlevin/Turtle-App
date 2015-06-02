browser = {};
browser.renderSketches = function() {
    console.log("success");

    var source   = $("#sketch-browser-template").html();
    var template = Handlebars.compile(source);

    var dataContext = {
      sketches: []
    };

    for(var sketch_id in local_sketches){
      console.log(sketch);
      if(local_sketches.hasOwnProperty(sketch_id)){
        var sketch = local_sketches[sketch_id];
        dataContext.sketches.push({
          name: sketch.sketch_name,
          preview: "data:image/png;base64," + sketch.sketch_demo_blob,
          sketchid: sketch.local_sketch_id
        });
      }
    }

    var html = template(dataContext);
    $(".sketch-browser").html(html);
    $(".sketch-file").click(function(){
      storage.load_local_sketch($(this).attr("data-id"));
      $( "#forward" ).click();
    });
};

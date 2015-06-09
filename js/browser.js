browser = {};

/**
  * Renders the my sketches pane of the browser from
  * the sketches stored in local_sketches
  **/
browser.renderSketches = function() {
    var source   = $("#sketch-browser-template").html();
    var template = Handlebars.compile(source);

    var dataContext = {
      sketches: []
    };

    //Iterate through local sketches. They are indexed by local id so we cant
    //use naive for loop
    for(var sketch_id in local_sketches){
      if(local_sketches.hasOwnProperty(sketch_id)){
        var sketch = local_sketches[sketch_id];
        //Just translation from storage names to useful names
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
      PageTransitions.nextPage({animation:1});
    });
};

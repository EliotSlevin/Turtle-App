browser = {};

function renderSketches(data, online){
  var source   = $("#sketch-browser-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $(".sketch-browser").html(html);
  $(".sketch-file").click(function(){
    if(online)storage.load_local_sketch($(this).attr("data-id"));
    else serverside.load_sketch($(this).attr("data-id"));
    PageTransitions.nextPage({animation:1});
  });
}

browser.load_external_sketches = function(offset){
  serverside.load_popular_sketches(9, offset, "popular", function(data){
    var dataContext = {sketches:[]};
    for(var i = 0;i < data.sketches.length;i ++){
      var sketch = data.sketches[i];
      dataContext.sketches.push({
        name: sketch.name,
        preview: sketch.preview,
        sketchid: sketch.sketchid
      });
    }

    console.log(data.sketches);
    renderSketches(dataContext, true);
  });

}

browser.load_local_sketches = function(offset){
  var dataContext = {sketches:[]};
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
  renderSketches(dataContext, false);
}

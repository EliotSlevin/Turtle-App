browser = {};

browser.online = {};
browser.online.last_fetch_time = 0;
browser.online.last_fetched_sketches = null;

function renderSketches(data, online){
  var source   = $("#sketch-browser-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $(".sketch-browser").html(html);
  $(".meta-bar").click(function(){
	browser.load_userpage($(this).children(".username").html(),0);	
  });
  $(".open-sketch").click(function(){
    if(online)serverside.load_sketch($(this).parent().attr("data-id"));
    else storage.load_local_sketch($(this).parent().attr("data-id"));
    PageTransitions.nextPage({animation:1});
  });
}

function renderUserSketches(userName,data, online){
  var source   = $("#sketch-browser-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $(".sketch-browser").html(html);
  $(".sketch-browser").prepend("<div></div><div class=\"user-title-bar\"><h2>"+userName+"'s Sketches</h2><i class=\"fa fa-arrow-left\"></i></div><div></div>");
  $(".open-sketch").click(function(){
    if(online)serverside.load_sketch($(this).parent().attr("data-id"));
    else storage.load_local_sketch($(this).parent().attr("data-id"));
    PageTransitions.nextPage({animation:1});
  });
}

browser.load_external_sketches = function(offset){
  if(browser.online.last_fetched_sketches){
    var diff = Math.floor(Date.now() / 1000) - browser.online.last_fetch_time;
    if(diff < 300){
      //If we have fetched in the last 5 minutes, use the cached result
      renderSketches(browser.online.last_fetched_sketches, true);
      return;
    }
  }

  serverside.load_popular_sketches(9, offset, "popular", function(data){
    var dataContext = {sketches:[]};
    for(var i = 0;i < data.sketches.length;i ++){
      var sketch = data.sketches[i];
      dataContext.sketches.push({
        name: sketch.name,
        preview: sketch.preview,
        sketchid: sketch.sketchid,
        username: sketch.username
      });
    }

    browser.online.last_fetch_time = Math.floor(Date.now() / 1000);
    browser.online.last_fetched_sketches = dataContext;

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
        sketchid: sketch.local_sketch_id,
        username: ""
      });
    }
  }
  renderSketches(dataContext, false);
}


browser.load_userpage = function(userName,offset){
 
 serverside.load_sketches_by_user(userName,offset,function(data){
    var dataContext = {sketches:[]};
    for(var i = 0;i < data.sketches.length;i ++){
      var sketch = data.sketches[i];
      dataContext.sketches.push({
        name: sketch.name,
        preview: sketch.preview,
        sketchid: sketch.sketchid,
	username: "" 
      });
    }
	 renderUserSketches(userName,dataContext, true);
  });

}

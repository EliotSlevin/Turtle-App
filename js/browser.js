browser = {};

browser.online = {};
browser.online.last_fetch_time = 0;
browser.online.last_fetched_sketches = null;

function renderSketches(data, online){
  var source;

  if(online){
    source = $("#sketch-browser-template-popular").html();
  }else{
    source = $("#sketch-browser-template-local").html();
  } 

  var template = Handlebars.compile(source);
  var html = template(data);


  $(".sketch-browser").html(html);

  $(".open-userpage").click(function(){
       browser.load_userpage($(this).children(".username").html(),0);
  });

  $(".open-settings").click(function(){
    if(online)throw Error("Can't change settings of online sketches");
    else{
      var sketch = local_sketches[Number($(this).parent().attr("data-id"))];
      load_settings_modal(sketch);
    }
  });

  $(".open-sketch").click(function(){
    if(online)serverside.load_sketch($(this).parent().attr("data-id"));
    else storage.load_local_sketch($(this).parent().attr("data-id"));
    PageTransitions.nextPage({animation:1});
    paper.sketch_layer.removeChildren();
  });


}

function load_settings_modal(sketch){
  var name_input = $("#settings_modal_name");
  var published_button = $("#settings_modal_published");
  var delete_button = $("#settings_modal_delete");

  name_input.val(sketch.sketch_name);
  delete_button.removeClass("sure").html('<i class="fa fa-trash-o"></i>Delete');

  name_input.on('keyup change', function() {
    sketch.sketch_name = $(this).val();
    localStorage.sketches = JSON.stringify(local_sketches);
    browser.load_local_sketches(0);
  });

  if(sketch.online_sketch_id !== null){
    published_button.removeClass("button-off").addClass("button-on");
    published_button.html('<i class="fa fa-cloud-upload"></i>Published');
  }
  else{
    published_button.removeClass("button-on").addClass("button-off");
    published_button.html('<i class="fa fa-cloud-upload"></i>Not Published');
  }

  published_button.off('click').click(function(){
    if(sketch.online_sketch_id === null){
      published_button.removeClass("button-off").addClass("button-on");
      published_button.html('<i class="fa fa-cloud-upload"></i>Published');
      serverside.save_local_sketch(sketch);
    }
    else{
      published_button.removeClass("button-on").addClass("button-off");
      published_button.html('<i class="fa fa-cloud-upload"></i>Not Published');
      serverside.delete_local_sketch(sketch);
    }
  });

  delete_button.off('click').click(function(){
    if(!delete_button.hasClass("sure")){
      delete_button.addClass("sure");
      delete_button.html("<i class='fa fa-trash-o'></i>Sure?");
    }
    else{
      if(sketch.online_sketch_id !== null){
        serverside.delete_local_sketch(sketch);
      }
      delete local_sketches[sketch.local_sketch_id];
      localStorage.sketches = JSON.stringify(local_sketches);
      window.location.hash = "#!";
      browser.load_local_sketches(0);
    }
  });
  window.location.hash = "settings_modal";
}

function renderUserSketches(userName,data, online){
  var source   = $("#sketch-browser-template-plain").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $(".sketch-browser").html(html);
  $(".sketch-browser").prepend("<div></div><div class=\"user-title-bar\"><h2>"+userName+"'s Sketches</h2><h2 class=\"return\"><i class=\"fa fa-arrow-left\"></i></h2></div><div></div>");
  $(".open-sketch").click(function(){
    if(online)serverside.load_sketch($(this).parent().attr("data-id"));
    else storage.load_local_sketch($(this).parent().attr("data-id"));
    PageTransitions.nextPage({animation:1});
  });
  $(".settings_cog").hide();
  $(".return").click(function(){
    browser.load_external_sketches(0);
  });
}

function renderSearchSketches(search, data, online){
  var source   = $("#sketch-browser-template-plain").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $(".sketch-browser").html(html);
  $(".sketch-browser").prepend("<div></div><div class=\"user-title-bar\"><h2>Search results for \""+search+"\"</h2><h2 class=\"return\"><i class=\"fa fa-arrow-left\"></i></h2></div><div></div>");
  $(".open-sketch").click(function(){
    if(online)serverside.load_sketch($(this).parent().attr("data-id"));
    else storage.load_local_sketch($(this).parent().attr("data-id"));
    PageTransitions.nextPage({animation:1});
  });
  $(".settings_cog").hide();
  $(".return").click(function(){
    browser.load_external_sketches(0);
  });
}

browser.load_search_results = function(search, offset){
  serverside.search_sketches(search, 20, offset, function(data){
    var dataContext = {sketches:[]};
    for(var i = 0;i < data.sketches.length;i ++){
      var sketch = data.sketches[i];
      dataContext.sketches.push({
        name: sketch.sketch_name,
        preview: sketch.preview,
        sketchid: sketch.sketchid,
        username: sketch.by
      });
    }

    renderSearchSketches(search, dataContext, true);
  }, function(err){
    console.log(err);
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
      if(local_sketches[sketch_id] === null)continue;
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

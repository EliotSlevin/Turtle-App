var renderSketches = function(data) {
    console.log("success");

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

    var dataContext = data;

    console.log(context);
    console.log(dataContext);

    var html = template(dataContext);
    $(".sketch-browser").html(html);
    $(".sketch-file").click(function(){
      serverside.load_sketch($(this).attr("data-id"));
      $( "#forward" ).click();
    });
};

var fail = function() {
    console.log("fail");
};

serverside.load_sketches_by_user("586240", "all", renderSketches, fail);

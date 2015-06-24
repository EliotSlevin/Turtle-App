window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

//Some local data
current_sketch = {
  name: "this-is-a-sketch",
  online_sketch_id: null
};

local_sketches = [];
paper_contexts = [];

/* Maybe lets start the app from here */
$(document).ready(function() {
    palette.init();
    execution_pane.init();

    //Do some first time run setup
    if(typeof localStorage.sketches === "undefined"){
      //Totally secure way of generating a uuid if we dont have one (i.e. not running on device)
      localStorage.uuid = (typeof device !== 'undefined') ? device.uuid : Math.floor(Math.random() * 1000000);
      localStorage.sketches = JSON.stringify(local_sketches);
      localStorage.sketch_counter = 0;
      current_sketch.local_sketch_id = 0;
      localStorage.username = generate_random_name();
    }
    else{
      //De-serialize the local sketches to save parsing them every time
      local_sketches = JSON.parse(localStorage.sketches);
      current_sketch.local_sketch_id = Number(localStorage.sketch_counter);
    }

    $("#search_form").submit(function(){
      if($("#search_input").val() === "")return;
      browser.load_search_results($("#search_input").val(), 0);
    });

    browser.load_local_sketches(0);

    paper_contexts[0] = new paper.PaperScope();
    paper_contexts[1] = new paper.PaperScope();

    var canvas = paper_contexts[0].setup(document.getElementById("paper_canvas"));
    init_drawing(canvas);

    paper_contexts[1].setup(document.getElementById("big_canvas"));
    $("#big_canvas").hide();

    paper = paper_contexts[0];

    $("#play_button").click(function(){
      $("#paper_canvas").addClass("shown");
      $(".right-side").addClass("hidden");
      $("#paper_canvas").css('width', '200%');
      $("#paper_canvas").css('height', '100%');
      execution_pane.run(canvas, true);
    });

    $("#debug_button").click(function(){
      execution_pane.run(canvas);
    });

    $("#popular_button").click(function(){
      $(".tab_selected").removeClass("tab_selected");
      $(this).addClass("tab_selected");
      browser.load_external_sketches(0);
      $('#search').show();
    });

    $("#my_pins_button").click(function(){
      $(".tab_selected").removeClass("tab_selected");
      $(this).addClass("tab_selected");
      browser.load_local_sketches(0);
      $('#search').hide();
    });

    $('#search').hide();

    window.location.hash = ''
    $("#paper_canvas").removeClass("shown");

    //Needed for a webkit bug which causes the above to not force a redraw sometimes
    $("#paper_canvas").css('width', '100%');
    $("#paper_canvas").css('height', '50%');

    $("#paper_canvas").addClass("active");
    $("#paper_canvas").click(function(){
      $(this).removeClass("shown");
      //Needed for a webkit bug which causes the above to not force a redraw sometimes
      $("#paper_canvas").css('width', '100%');
      $("#paper_canvas").css('height', '50%');
      $(".right-side").removeClass("hidden");
    });
    parameters.init_parameters();
});

/**
  * Generates a random heroku-style name for a username.
  * @return The generated user name
  **/
function generate_random_name(){
  var adjectives = ["windy", "rainy", "flimsy", "cold", "bright", "smart", "bouncy", "tranquil", "cute", "silent", "silent", "complex",
                    "cheerful", "blue", "orange", "pink", "yellow", "fluffy", "smooth", "catty", "adorable", "fast", "strong", "better"];

  var nouns = ["button", "yak", "cat", "lamp", "bed", "towel", "book", "shirt", "phone", "duck", "tortoise", "cherry", "pickle",
               "donkey", "flower", "badger", "cake", "hook"];

  var randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  var randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdj + "-" + randomNoun + "-" + Math.floor((Math.random() * 1000));
}

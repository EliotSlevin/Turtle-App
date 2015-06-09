window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

//Some local data
current_sketch = {
  name: "this-is-a-sketch",
  online_sketch_id: null
};

local_sketches = [];

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

    browser.load_local_sketches(0);

    var canvas = paper.setup(document.getElementById("paper_canvas"));
    init_drawing(canvas);

    $("#play_button").click(function(){
      execution_pane.run(canvas);
    });

    $("#popular_button").click(function(){
      $(".tab_selected").removeClass("tab_selected");
      $(this).addClass("tab_selected");
      browser.load_external_sketches(0);
    });

    $("#my_pins_button").click(function(){
      $(".tab_selected").removeClass("tab_selected");
      $(this).addClass("tab_selected");
      browser.load_local_sketches(0);
    })

    window.location.hash = ''
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

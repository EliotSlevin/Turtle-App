window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

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
    }
    else{
      local_sketches = JSON.parse(localStorage.sketches);
    }

    var canvas = paper.setup(document.getElementById("paper_canvas"));
    init_drawing(canvas);

    $("#play_button").click(function(){
      execution_pane.run(canvas);
    });
});

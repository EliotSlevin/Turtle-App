window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);

// The dynamically built HTML pages. In a real-life app, In a real-life app, use Handlerbar.js, Mustache.js or another template engine
var detailsPage = '<div><div class="left-side"> <div class="viewport"> <canvas id="paper_canvas"></canvas></div><div class="palette"> <div class="ui buttons command" id="loop"> <div class="ui button active">Loop</div><div class="ui button">Times</div></div><div class="ui buttons command" id="jump"> <div class="ui button active">Jump to</div><div class="ui button">Position</div></div><div class="ui divider"></div><div class="ui buttons command" id="move"> <div class="ui button green">Move</div><div class="ui button">Distance</div></div><div class="ui buttons command" id="rotate"> <div class="ui button green">Rotate</div><div class="ui button">Angle</div></div><div class="ui divider"></div><div class="ui buttons command"  id="pen_down"> <div class="ui button blue">Pen Down</div></div><div class="ui buttons command" id="pen_up"> <div class="ui button blue">Pen Up</div></div><div class="ui buttons command" id="circle"> <div class="ui button blue">Draw Circle</div><div class="ui button">Radius</div></div><div class="ui buttons command" id="triangle"> <div class="ui button blue">Draw Triangle</div><div class="ui button">Radius</div></div><div class="ui buttons command" id="rectangle"> <div class="ui button blue">Draw Rectangle</div><div class="ui button">Radius</div></div><div class="ui divider"></div><div class="ui buttons command" id="set_stroke"> <div class="ui button yellow">Set Stroke</div><div class="ui button">Color, Weight</div></div><div class="ui buttons command" id="set_fill"> <div class="ui button yellow">Set fill</div><div class="ui button">Color</div></div></div></div><div class="right-side"> <div class="ui inverted main menu editor-menu"> <a class="item play_button"> <i class="play icon"></i>Run Sketch </a> <a class="item"> <i class="bug icon"></i> </a> <a class="item"> <i class="expand icon"></i> </a> <a class="item"> Change Sketch Name </a> <a href="#" class="item push-right"> <i class="arrow right icon"></i> </a> </div><div class="program"> </div></div></div>';

var homePage = '<div><div class="menu"> <div class="ui grid"> <div class="three column row"> <div class="column">  <div class="ui huge labeled basic button"><a href="#page1"> <i class="file outline icon"></i> New Sketch</a> </div></div><div class="column text-center"> <div class="ui huge buttons"> <div class="ui button active">My Sketches</div><div class="ui button">Popular</div></div></div><div class="column text-right"> <div class="ui huge basic icon button"> <i class="setting icon"></i> </div></div></div></div></div><div class="page-content"><div class="ui three column grid"> <div class="column"> <div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div></div><div class="column"> <div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div></div><div class="column"> <div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div><div class="ui fluid card"> <div class="image"> <img src="img/viewport.png"> </div><div class="content"> <a class="header">Sketch Name</a> </div></div></div></div></div></div>';


var slider = new PageSlider($("#container"));
$(window).on('hashchange', route);

// Basic page routing
function route(event) {
    var page,
        hash = window.location.hash;

    if (hash === "#page1") {
        page = merge(detailsPage, {img: "buildbot.jpg", name: "Build Bot", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."});
        slider.slidePage($(page));
        palette.init();
        execution_pane.init();

        var canvas = paper.setup(document.getElementById("paper_canvas"));
        init_drawing(canvas);

        console.log($(".play_button"));

        $(".play_button").click(function(){
          console.log("Running Execution");
          execution_pane.run(canvas);
        });
    }

    else {
        page = homePage;
        slider.slidePage($(page));
//        slider.slide($(homePage), "right");
    }


}

// Primitive template processing. In a real-life app, use Handlerbar.js, Mustache.js or another template engine
function merge(tpl, data) {
    return tpl.replace("{{img}}", data.img)
              .replace("{{name}}", data.name)
              .replace("{{description}}", data.description);
}

route();

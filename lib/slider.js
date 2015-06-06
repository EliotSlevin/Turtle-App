slider = function(dom, min, max, value){
  this.min = min;
  this.max = max;
  this.value = ((typeof value !== "undefined") ? value : min);

  this.canvas = $(document.createElement('canvas')).attr({});
  this.c = this.$c[0].getContext ? this.$c[0].getContext('2d') : null;

}

slider.draw = function(){

}

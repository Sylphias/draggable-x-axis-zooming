($function(H){
    var start_extreme_min, start_extreme_max,
      start_x_pos,
      start_min_timestamp, start_max_timestamp,
      old_dist,
      xAxis,
      your_chart;

  H.wrap(H.Chart.prototype,'init', function(proceed){
    // run original proceed method
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    console.log(this);
    //Assign chart variables
    your_chart = this;
    xAxis = this.xAxis[0];
  });

  //This method wraps highchart's onContainerClick event
  H.wrap(H.Pointer.prototype,'onContainerMouseDown',function(proceed){

    //Check if first click falls under the chart plot area
    if( arguments[1].chartY > your_chart.plotSizeY && arguments[1].chartY < your_chart.chartHeight){
      //Assign the extreme ends of the xAxis to variables and get the first click location;
      var extremes = xAxis.getExtremes();
      start_extreme_max = xAxis.toPixels(extremes.max);
      start_extreme_min = xAxis.toPixels(extremes.min);
      start_max_timestamp = extremes.max;
      start_min_timestamp = extremes.min;
      start_x_pos = arguments[1].chartX;

      //get the distance between the first click X position and the max of the xAxis
      old_dist = start_extreme_max - start_x_pos;
    }
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
  });


  //This method wraps highchart's drag event
  H.wrap(H.Pointer.prototype,'drag',function(proceed){
     //Check if user is draggin within the series range
     if( arguments[1].chartY > your_chart.plotSizeY && arguments[1].chartY < your_chart.chartHeight){
      /*
        Scaling Logic
        -------------
        1. Get distance of current mouse position from the current chart's leftmost pixel value
        2. calculate a ratio based off the original click distance and the new click distance
        3. Apply the ratio to the distance in time values and substract from the current view's max
      */
      var new_x_pos = arguments[1].chartX;
      var new_dist = start_extreme_max - new_x_pos;
      var ratio = old_dist / new_dist ;
      var new_min_timestamp = start_max_timestamp - (start_max_timestamp -start_min_timestamp) * ratio;


      //Set new extremes of the chart
      xAxis.setExtremes(new_min_timestamp,start_max_timestamp);

     }
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
  });

}(Highcharts));
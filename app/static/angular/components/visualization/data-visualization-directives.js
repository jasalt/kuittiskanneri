"use strict";

angular.module("dataVisualizationDirectives", [])
  .directive('fsDateHisto', [function() {
    /*
     * Datehistogram directive from dangle library.
     * http://www.fullscale.co/dangle/
     * TODO move to own module for easier use in other controllers.
     */
    return {
      restrict: 'E',

      // sets up the isolate scope so that we don't clobber parent scope
      scope: {
        onClick:   '=',
        width:     '=',
        height:    '=',
        bind:      '=',
        label:     '@',
        field:     '@',
        duration:  '@',
        delay:     '@',
        interval:  '@',
        barwidth:  '@'
      },

      // angular directives return a link fn
      link: function(scope, element, attrs) {

        var margin = {
          top:20,
          right: 20,
          bottom: 30,
          left: 80
        };

        // default width/height - mainly to create initial aspect ratio
        var width = scope.width || 1280;
        var height = scope.height || 300;

        var label = attrs.label || 'Price';
        var klass = attrs.class || '';

        // add margin (make room for x,y labels)
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        // create x,y scales (x is inferred as time)
        var x = d3.time.scale()
              .range([0, width]);

        var y = d3.scale.linear()
              .range([height, 0]);

        // create x,y axis
        var xAxis = d3.svg.axis()
              .scale(x)
              .orient('bottom');

        var yAxis = d3.svg.axis()
              .scale(y)
              .orient('left');

        // create the root svg node
        var svg = d3.select(element[0])
              .append('svg')
              .attr('preserveAspectRatio', 'xMinYMin')
              .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // insert the x axis (no data yet)
        svg.append('g')
          .attr('class', 'histo x axis ' + klass)
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        // insert the y axis (no data yet)
        svg.append('g')
          .attr('class', 'histo y axis ' + klass)
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.51em')
          .style('text-anchor', 'end')
          .text(label);


        // mainer observer fn called when scope is updated. Data and scope vars are npw bound
        scope.$watch('bind', function(data) {

          // pull info from scope
          var duration = scope.duration || 0;
          var delay = scope.delay || 0;
          var field = scope.field || attrs.bind.split('.').pop().toLowerCase();
          var interval = scope.interval || 'day';

          // just because scope is bound doesn't imply we have data
          if (data) {

            // pull the data array from the facet
            data = data.entries || [];

            // calculate the bar width based on the data length leaving
            // a 2 pixel "gap" between bars.
            var barWidth = scope.barwidth || 10; //width/data.length - 2;

            var intervalMsecs = 86400000;

            // workaround until this pull request is merged
            // the user can pass in an appropriate interval
            // https://github.com/elasticsearch/elasticsearch/pull/2559
            switch(interval.toLowerCase()) {
            case 'minute':
              intervalMsecs = 60000;
              break;
            case 'hour':
              intervalMsecs = 3600000;
              break;
            case 'day':
              intervalMsecs = 86400000;
              break;
            case 'week':
              intervalMsecs = 604800000;
              break;
            case 'month':
              intervalMsecs = 2630000000;
              break;
            case 'year':
              intervalMsecs = 31560000000;
              break;
            }

            // recalculate the x and y domains based on the new data.
            // we have to add our "interval" to the max otherwise
            // we don't have enough room to draw the last bar.
            x.domain([
              d3.min(data, function(d) {
                return d.time;
              }),
              d3.max(data, function(d) {
                return d.time;
              }) + intervalMsecs
            ]);
            y.domain([0, d3.max(data, function(d) { return d.count; })]);

            // create transition (x,y axis)
            var t = svg.transition().duration(duration);

            // using a random key function here will cause all nodes to update
            var bars = svg.selectAll('rect')
                  .data(data, function(d) { return Math.random(); });

            // d3 enter fn binds each new value to a rect
            bars.enter()
              .append('rect')
              .attr('class', 'histo rect ' + klass)
              .attr('cursor', 'pointer')
              .attr('x', function(d) { return x(d.time); })
              .attr("y", function(d) { return height; })
              .attr('width', barWidth)
              .transition()
              .delay(function (d,i){ return i * delay; })
              .duration(duration)
              .attr('height', function(d) { return height - y(d.count); })
              .attr('y', function(d) { return y(d.count); });

            // wire up event listeners - (registers filter callback)
            bars.on('mousedown', function(d) {
              scope.$apply(function() {
                (scope.onClick || angular.noop)(field, d.time);
              });
            });

            // d3 exit/remove flushes old values (removes old rects)
            bars.exit().remove();

            // update our x,y axis based on new data values
            t.select('.x').call(xAxis);
            t.select('.y').call(yAxis);
          }
        }, true);
      }
    };
  }])
  .directive('fsArea', [function() {
    'use strict';

    return {
      restrict: 'E',

      // set up the isolate scope so that we don't clobber parent scope
      scope: {
        onClick:     '=',
        width:       '=',
        height:      '=',
        bind:        '=',
        label:       '@',
        field:       '@',
        duration:    '@',
        delay:       '@',
        plot:        '@',
        pointRadius: '@'
      },

      link: function(scope, element, attrs) {

        var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 80
        };

        // default width/height - mainly to create initial aspect ratio
        var width = scope.width || 1280;
        var height = scope.height || 300;

        // are we using interpolation
        var interpolate = attrs.interpolate || 'false';

        var label = attrs.label || 'Frequency';
        var klass = attrs.class || '';

        // add margins (make room for x,y labels)
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        // create x,y sclaes (x is inferred as time)
        var x = d3.time.scale()
              .range([0, width]);

        var y = d3.scale.linear()
              .range([height, 0]);

        // create x,y axis
        var xAxis = d3.svg.axis()
              .scale(x)
              .orient('bottom');

        var yAxis = d3.svg.axis()
              .scale(y)
              .orient('left');

        // create line generator
        var line = d3.svg.line()
              .x(function(d) { return x(d.time); })
              .y(function(d) { return y(d.count); });

        // create area generator
        var area = d3.svg.area()
              .x(function(d) { return x(d.time); })
              .y0(height)
              .y1(function(d) { return y(d.count); });

        // enable interpolation if specified
        if (attrs.interpolate == 'true') {
          line.interpolate('cardinal');
          area.interpolate('cardinal');
        }

        // create the root SVG node
        var svg = d3.select(element[0])
              .append('svg')
              .attr('preserveAspectRatio', 'xMinYMin')
              .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // generate the area. Data is empty at link time
        svg.append('path')
          .datum([])
          .attr('class', 'area fill ' + klass)
          .attr('d', area);

        // insert the x axis (no data yet)
        svg.append('g')
          .attr('class', 'area x axis ' + klass)
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        // insert the x axis (no data yet)
        svg.append('g')
          .attr('class', 'area y axis ' + klass)
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(label);

        // generate the line. Data is empty at link time
        svg.append('path')
          .datum([])
          .attr('class', 'area line ' + klass)
          .attr("d", line);


        // main observer fn called when scope is updated. Data and scope vars are now bound
        scope.$watch('bind', function(data) {

          // pull info from scope
          var duration = scope.duration || 0;
          var delay = scope.delay || 0;
          var dataPoints = scope.plot || 'true';
          var pointRadius = scope.pointRadius || 8;
          var field = scope.field || attrs.bind.split('.').pop().toLowerCase();

          // just because scope is bound doesn't imply we have data.
          if (data) {

            // pull the data array from the facet
            data = data.entries || [];

            // use that data to build valid x,y ranges
            x.domain(d3.extent(data, function(d) { return d.time; }));
            y.domain([0, d3.max(data, function(d) { return d.count; })]);

            // create the transition
            var t = svg.transition().duration(duration);

            // feed the current data to our area/line generators
            t.select('.area').attr('d', area(data));
            t.select('.line').attr('d', line(data));

            // does the user want data points to be plotted
            if (dataPoints == 'true') {

              // create svg circle for each data point
              // using Math.random as (optional) key fn ensures old
              // data values are flushed and all new values inserted
              var points = svg.selectAll('circle')
                    .data(data.filter(function(d) {
                      return d.count;
                    }), function(d) {
                      return Math.random();
                    });

              // d3 enter fn binds each new value to a circle
              points.enter()
                .append('circle')
                .attr('class', 'area line points ' + klass)
                .attr('cursor', 'pointer')
                .attr("cx", line.x())
                .attr("cy", line.y())
                .style("opacity", 0)
                .transition()
                .duration(duration)
                .style("opacity", 1)
                .attr("cx", line.x())
                .attr("cy", line.y())
                .attr("r", pointRadius);

              // wire up any events (registers filter callback)
              points.on('mousedown', function(d) {
                scope.$apply(function() {
                  (scope.onClick || angular.noop)(field, d.time);
                });
              });

              // d3 exit/remove flushes old values (removes old circles)
              points.exit().remove();
            }

            // update our x,y axis based on new data values
            t.select('.x').call(xAxis);
            t.select('.y').call(yAxis);

          }
        })
      }
    };
  }])
  .directive('fsDonut', [function() {
    'use strict';

    return {
      restrict: 'E',

      // sets up the isolate scope so that we don't clobber parent scope
      scope: {
        outerRadius: '=',
        innerRadius: '=',
        fontSize: '=',
        domain: '=',
        colorMap: '=',
        onClick: '=',
        bind: '=',
        duration: '@'
      },

      link: function(scope, element, attrs) {

        // Setup default parameters.
        var outerRadius = scope.outerRadius || 200;
        var innerRadius = scope.innerRadius || 0;
        var fontSize = scope.fontSize || 14;
        var fontColor = attrs.fontColor || "#fff";
        var color = undefined;

        // if no field param is set, use the facet name but normalize the case
        if (attrs.field == undefined) {
          attrs.field = attrs.bind.split('.').pop().toLowerCase();
        }

        // User can define a color-map so use look for one.
        // If none is found, then use built-in color pallete
        // but see if user has defined a domain of values.
        if (scope.colorMap === undefined) {
          color = d3.scale.category20c();
          if (scope.domain !== undefined) {
            color.domain(scope.domain);
          }
        } else {
          color = function(term) {
            return scope.colorMap[term];
          }
        }

        // width/height (based on giveb radius)
        var w = (outerRadius * 3) + 30;
        var h = outerRadius * 3;

        // arc generator
        var arc = d3.svg.arc()
              .outerRadius(outerRadius - 10)
              .innerRadius(innerRadius);

        // d3 utility for creating pie charts
        var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { return d.count; });

        // root svg element
        var svg = d3.select(element[0])
              .append('svg')
              .attr('preserveAspectRatio', 'xMinYMin meet')
              .attr('viewBox', '0 0 ' + w + ' ' + h);

        // group for arcs
        var arcs = svg.append('g')
              .attr('transform', 'translate(' + w/2 + ',' + h/2 + ') rotate(180) scale(-1, -1)');

        // group for labels
        var labels = svg.append("g")
              .attr("class", "label_group")
              .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");


        // Wrap the main drawing logic in an Angular watch function.
        // This will get called whenever our data attribute changes.
        scope.$watch('bind', function(data) {

          var duration = scope.duration || 0;

          // arc tweening
          function arcTween(d, i) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) {
              return arc(i(t));
            };
          }

          // label tweening
          function textTween(d, i) {
            var a = (this._current.startAngle + this._current.endAngle - Math.PI)/2;
            var b = (d.startAngle + d.endAngle - Math.PI)/2;

            var fn = d3.interpolateNumber(a, b);
            return function(t) {
              var val = fn(t);
              return "translate(" +
                Math.cos(val) * (outerRadius + textOffset) + "," +
                Math.sin(val) * (outerRadius + textOffset) + ")";
            };
          }

          // determines the anchor point of a label
          var findAnchor = function(d) {
            if ((d.startAngle + d.endAngle)/2 < Math.PI ) {
              return "beginning";
            } else {
              return "end";
            }
          };

          var textOffset = 14;

          // if data is not null
          if (data) {

            // pull out the terms array from the facet
            data = data.terms || [];
            var pieData = pie(data);

            // calculate the sum of the counts for this facet
            var sum = 0;
            for (var ii=0; ii < data.length; ii++) {
              sum += data[ii].count;
            }

            // if the sum is 0 then this facet has no valid entries (all counts were zero)
            if (sum > 0) {

              // update the arcs
              var path = arcs.selectAll('path').data(pieData);
              path.enter()
                .append('path')
                .attr('d', arc)
                .attr('stroke', '#fff')
                .attr('stroke-width', '1.5')
                .attr('cursor', 'pointer')
                .style('fill', function(d) { return color(d.data.term); })
                .each(function(d) { this._current = d; })
                .on('mousedown', function(d) {
                  scope.$apply(function() {
                    (scope.onClick || angular.noop)(attrs.field, d.data.term);
                  });
                });

              // run the transition
              path
                .style('fill', function(d) { return color(d.data.term); })
                .transition()
                .duration(duration)
                .attrTween('d', arcTween)
                .style('fill', function(d) { return color(d.data.term); });

              // remove arcs not in the dataset
              path.exit().remove();

              // update the label ticks
              var ticks = labels.selectAll('line').data(pieData);
              ticks.enter().append('line')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', -outerRadius-3)
                .attr('y2', -outerRadius-8)
                .attr('stroke', 'grey')
                .attr('stroke-width', 2.0)
                .attr('transform', function(d) {
                  return 'rotate(' + (d.startAngle + d.endAngle)/2 * (180/Math.PI) + ')'; // radians to degrees
                })
                .each(function(d) {this._current = d;});

              // run the transition
              ticks.transition()
                .duration(750)
                .attr("transform", function(d) {
                  return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
                });

              // flush old entries
              ticks.exit().remove();

              // update the percent labels
              var percentLabels = labels.selectAll("text.value").data(pieData)
                    .attr("dy", function(d) {
                      if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                        return 17;
                      } else {
                        return -17;
                      }
                    })
                    .attr('text-anchor', findAnchor)
                    .text(function(d) {
                      var percentage = (d.value/sum)*100;
                      return percentage.toFixed(1) + "%";
                    });

              percentLabels.enter().append("text")
                .attr("class", "value")
                .attr('font-size', 20)
                .attr('font-weight', 'bold')
                .attr("transform", function(d) {
                  return "translate(" +
                    Math.cos(((d.startAngle + d.endAngle - Math.PI)/2)) * (outerRadius + textOffset) + "," +
                    Math.sin((d.startAngle + d.endAngle - Math.PI)/2) * (outerRadius + textOffset) + ")";
                })
                .attr("dy", function(d) {
                  if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                    return 17;
                  } else {
                    return -17;
                  }
                })
                .attr('text-anchor', findAnchor)
                .text(function(d){
                  var percentage = (d.value/sum)*100;
                  return percentage.toFixed(1) + "%";
                })
                .each(function(d) {this._current = d;});

              // run the transition
              percentLabels.transition().duration(duration).attrTween("transform", textTween);

              // flush old entries
              percentLabels.exit().remove();

              // update the value labels
              var nameLabels = labels.selectAll("text.units").data(pieData)
                    .attr("dy", function(d){
                      if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                        return 36;
                      } else {
                        return 2;
                      }
                    })
                    .attr("text-anchor", function(d){
                      if ((d.startAngle + d.endAngle)/2 < Math.PI ) {
                        return "beginning";
                      } else {
                        return "end";
                      }
                    }).text(function(d) {
                      if (d.data.term === 'T') {
                        return 'TRUE' + ' (' + d.value + ')';
                      } else if (d.data.term === 'F') {
                        return 'FALSE'+ ' (' + d.value + ')';
                      } else {
                        return d.data.term + ' (' + d.value + ')';
                      }
                    });

              nameLabels.enter().append("text")
                .attr("class", "units")
                .attr('font-size', 16)
                .attr('stroke', 'none')
                .attr('fill', '#000')
                .attr("transform", function(d) {
                  return "translate(" +
                    Math.cos(((d.startAngle + d.endAngle - Math.PI)/2)) * (outerRadius + textOffset) + "," +
                    Math.sin((d.startAngle + d.endAngle - Math.PI)/2) * (outerRadius + textOffset) + ")";
                })
                .attr("dy", function(d){
                  if ((d.startAngle + d.endAngle)/2 > Math.PI/2 && (d.startAngle + d.endAngle)/2 < Math.PI*1.5 ) {
                    return 36;
                  } else {
                    return 2;
                  }
                })
                .attr('text-anchor', findAnchor)
                .text(function(d){
                  if (d.data.term === 'T') {
                    return 'TRUE' + ' (' + d.value + ')';
                  } else if (d.data.term === 'F') {
                    return 'FALSE' + ' (' + d.value + ')';
                  } else {
                    return d.data.term + ' (' + d.value + ')';
                  }
                })
                .each(function(d) {this._current = d;});

              // run the transition
              nameLabels.transition().duration(duration).attrTween("transform", textTween);

              // flush old entries
              nameLabels.exit().remove();

            } else {
              // if the facet had no valid entries then remove the chart
              svg.selectAll('path').remove();
              labels.selectAll('line').remove();
              labels.selectAll("text.value").remove();
              labels.selectAll("text.units").remove();
            }

          }
        })

      }
    };
  }])
;

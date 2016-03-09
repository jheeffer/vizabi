/*!
 * VIZABI DONUT CHART
 */

import * as utils from 'base/utils';
import Component from 'base/component';


//DONUT CHART COMPONENT
var DonutComponent = Component.extend('donut', {

      init: function(config, context) {
        var _this = this;

        this.name = 'donutchart';
        this.template = '<div class="vzb-donutchart"><svg class="vzb-donutchart-svg"></svg></div>';

        //define expected models for this component
        this.model_expects = [{
          name: "time",
          type: "time"
        }, {
          name: "marker",
          type: "model"
        }];

        //bind the function updateTime() to the change of time value in the model
        this.model_binds = {
          "change:time:value": function(evt) {
            //fetch the time from the model and update the text on screen
            _this.time = _this.model.time.value;
            _this.yearEl.text(_this.timeFormatter(_this.time));
            _this.redraw();
          }
        };

        //call the prototype constructor of the component
        this._super(config, context);

        //init variables for d3 pie layout
        this.colorScale = null;
        this.arc = d3.svg.arc();
        this.pie = d3.layout.pie()
          .sort(null)
          .value(function(d) {
            return d.pop;
          });
      },

      /**
       * DOM is ready and the model is ready -- happens once on the load and never again
       */
      readyOnce: function() {
        var _this = this;

        //link DOM elements to the variables
        this.element = d3.select(this.element)
        this.svgEl = this.element.select("svg").append("g");
        this.yearEl = this.svgEl.append("text").attr("class", "year").style({'font-size':'4em'});
        this.titleEl = this.svgEl.append("text").attr("class", "title").style({'font-size':'2em'});

        //bind the resize() and updateTime() events to container resize
        this.on("resize", function() {
          _this.resize();
          _this.redraw();
        });

        //run a startup sequence
        this.resize();
        this.update();
        this.redraw();
      },

      /**
       * Populate the visuals according to the number of entities
       */
      update: function() {
        this.timeFormatter = d3.time.format("%Y");
        this.colorScale = this.model.marker.color.getScale();

        this.titleEl.text("Population");
        this.keys = this.model.marker.getKeys();

        this.entities = this.svgEl.selectAll('.vzb-dc-entity')
          .data(this.keys);

        //exit selection
        this.entities.exit().remove();

        //enter selection
        this.entities
          .enter().append("g")
          .attr("class", "vzb-dc-entity")
          .each(function() {
            d3.select(this).append("path");
            d3.select(this).append("text").attr("class", "label").style({'font-size':'1.2em'});
          });
      },

      /**
       * Updates the visuals
       */
      redraw: function() {
        var _this = this;

        //request the values for the current time from the model
        this.values = this.model.marker.getValues({time: _this.time}, ["geo"]);

        //prepare the data
        var data = this.keys.map(function(d) { return {
            geo: d.geo,
            pop: _this.values.axis[d.geo],
            color: _this.values.color[d.geo],
            label: _this.values.label[d.geo]
        }});

        data = this.pie(data);

        //set the properties of the donuts and text labels
        this.entities
          .data(data)
          .select("path")
          .attr("d", this.arc)
          .style("fill", function(d) {
            return _this.colorScale(d.data.color)
          })
          .style("stroke", "white");

        this.entities
          .select("text")
          .style({
            'text-transform': 'capitalize'
          })
          .attr("transform", function(d) {
            return "translate(" + _this.arc.centroid(d) + ")";
          })
          .text(function(d) {
            return d.data.geo;
          });
      },

      /**
       * Executes every time the container or vizabi is resized
       */
      resize: function() {

        var height = parseInt(this.element.style("height"));
        var width = parseInt(this.element.style("width"));
        var min = Math.min(height, width);

        this.svgEl.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
        this.titleEl.attr("y", "-0.1em");
        this.yearEl.attr("y", "0.1em");

        this.arc
          .outerRadius(min / 2 * 0.9)
          .innerRadius(min / 2 - min * 0.1)
      }

        

});



export default DonutComponent;

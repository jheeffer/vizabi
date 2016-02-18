import * as utils from 'base/utils';
import Tool from 'base/tool';

import MountainChartComponent from './mountainchart-component';
import {
  timeslider,
  dialogs,
  buttonlist,
  treemenu,
  datawarning
}
from 'components/_index';

//MOUNTAIN CHART TOOL
var MountainChart = Tool.extend('MountainChart', {

  /**
   * Initializes the tool (MountainChart Tool).
   * Executed once before any template is rendered.
   * @param {Object} placeholder Placeholder element for the tool
   * @param {Object} external_model Model as given by the external page
   */
  init: function(placeholder, external_model) {

    this.name = "mountainchart";

    //specifying components
    this.components = [{
      component: MountainChartComponent,
      placeholder: '.vzb-tool-viz',
      model: ["state.time", "state.entities", "state.marker", "language"] //pass models to component
    }, {
      component: timeslider,
      placeholder: '.vzb-tool-timeslider',
      model: ["state.time"]
    }, {
      component: dialogs,
      placeholder: '.vzb-tool-dialogs',
      model: ['state', 'ui', 'language']
    }, {
      component: buttonlist,
      placeholder: '.vzb-tool-buttonlist',
      model: ['state', 'ui', 'language']
    }, {
      component: treemenu,
      placeholder: '.vzb-tool-treemenu',
      model: ['state.marker', 'language']
    }, {
      component: datawarning,
      placeholder: '.vzb-tool-datawarning',
      model: ['language']
    }];

    //constructor is the same as any tool
    this._super(placeholder, external_model);
  }
});

export default MountainChart;
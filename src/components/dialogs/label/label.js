import * as utils from 'base/utils';
import Component from 'base/component';
import Dialog from '../_dialog';

import { sizeslider, indicatorpicker, simplecheckbox } from 'components/_index'
/*
 * Size dialog
 */

var Label = Dialog.extend({

/**
 * Initializes the dialog component
 * @param config component configuration
 * @param context component context (parent)
 */
init: function(config, parent) {
  this.name = 'label';

  // in dialog, this.model_expects = ["state", "data"];

  this.components = [
  {
    component: sizeslider,
    placeholder: '.vzb-dialog-sizeslider',
    model: ["state.marker.size_label",  "language"],
    propertyname: 'LabelTextSize',
    ui: {
      constantUnit: "unit/pixels"
    }
  },
  {
    component: indicatorpicker,
    placeholder: '.vzb-saxis-selector',
    model: ["state.marker", "language"],
    markerID: "size_label"
  },
  {
    component: simplecheckbox,
    placeholder: '.vzb-removelabelbox-switch',
    model: ["ui.chart", "language"],
    checkbox: 'removeLabelBox',
    submodel: 'labels'
  }
  ];

  this._super(config, parent);
}
});

export default Label;
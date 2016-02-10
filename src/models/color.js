import * as utils from 'base/utils';
import globals from 'base/globals';
import Model from 'base/model';

/*!
 * VIZABI Color Model (hook)
 */

var defaultPalettes = {
  "_continuous": {
    "0": "#F77481",
    "1": "#E1CE00",
    "2": "#B4DE79"
  },
  "_discrete": {
    "0": "#bcfa83",
    "1": "#4cd843",
    "2": "#ff8684",
    "3": "#e83739",
    "4": "#ffb04b",
    "5": "#ff7f00",
    "6": "#f599f5",
    "7": "#c027d4",
    "8": "#f4f459",
    "9": "#d66425",
    "10": "#7fb5ed",
    "11": "#0ab8d8"
  },
  "_default": {
    "_default": "#fa5ed6"
  }
};

var ColorModel = Model.extend({

  /**
   * Default values for this model
   */
  _defaults: {
    use: null,
    palette: {},
    scaleType: null,
    which: null
  },

  /**
   * Initializes the color hook
   * @param {Object} values The initial values of this model
   * @param parent A reference to the parent model
   * @param {Object} bind Initial events to bind
   */
  init: function(name, values, parent, bind) {

    this._type = "color";
    //TODO: add defaults extend to super
    var defaults = utils.deepClone(this._defaults);
    values = utils.extend(defaults, values);

    this._original_palette = values.palette;

    this._super(name, values, parent, bind);

    this._palettes = defaultPalettes;
    this._firstLoad = true;
    this._hasDefaultColor = false;
  },

  getColorShade: function(args){
    var palettes = globals.metadata.color.palettes;
    var shades = globals.metadata.color.shades;
      
    if(!palettes) return utils.warn("getColorShade() is missing globals.metadata.color.palettes");
    if(!shades) return utils.warn("getColorShade() is missing globals.metadata.color.shades");
    if(!args) return utils.warn("getColorShade() is missing arguments");
      
    if(!args.paletteID) args.paletteID = this.which;
    if(!shades[args.paletteID] || !palettes[args.paletteID]) args.paletteID = "_default";
    if(!args.shadeID || !shades[args.paletteID][args.shadeID]) args.shadeID = "_default";
    if(!args.colorID || !palettes[args.paletteID][args.colorID]) args.colorID = "_default";
    
    return palettes[args.paletteID][args.colorID][ shades[args.paletteID][args.shadeID] ];
  },
    
  /**
   * Get the above constants
   */
  getPalettes: function() {
    if (globals.metadata && globals.metadata.color && globals.metadata.color.palettes){
        this._palettes = utils.extend(this._palettes, globals.metadata.color.palettes);
    } else {
        utils.warn("Color.js AfterPreload: palletes not found in metadata");
    }
      
    return this._palettes;
  },

  afterPreload: function() {
    //TODO: extending this._palettes with the ones from metadata should actually be here, but metadats is undefined      
    this._super();
  },
  
  /**
   * Get the above constants
   */
  isUserSelectable: function(whichPalette) {

    var userSelectable = (globals.metadata) ? globals.metadata.color.selectable : {};

    if(userSelectable[whichPalette] == null) return true;
    return userSelectable[whichPalette];
  },

  /**
   * Validates a color hook
   */
  validate: function() {

    var possibleScales = ["log", "genericLog", "linear", "time", "pow"];
    if(!this.scaleType || (this.use === "indicator" && possibleScales.indexOf(this.scaleType) === -1)) {
      this.scaleType = 'linear';
    }
    if(this.use !== "indicator" && this.scaleType !== "ordinal") {
      this.scaleType = "ordinal";
    }

    // reset palette and scale in the following cases: indicator or scale type changed
    if(this._firstLoad === false && (this.which_1 != this.which || this.scaleType_1 != this.scaleType)) {

      //TODO a hack that kills the scale and palette, it will be rebuild upon getScale request in model.js
      if(this.palette) this.palette._data = {};
      this.scale = null;
    }

    this.which_1 = this.which;
    this.scaleType_1 = this.scaleType;
    this._firstLoad = false;
  },

  /**
   * set color
   */
  setColor: function(value, pointer) {
    var temp = this.getPalette();
    temp[pointer] = value;
    this.scale.range(utils.values(temp));
    this.palette[pointer] = value;
  },


  /**
   * maps the value to this hook's specifications
   * @param value Original value
   * @returns hooked value
   */
  mapValue: function(value) {
    //if the property value does not exist, supply the _default
    // otherwise the missing value would be added to the domain
    if(this.scale != null && this.use == "property" && this._hasDefaultColor && this.scale.domain().indexOf(value) == -1) value = "_default";
    return this._super(value);
  },


  buildPalette: function() {
      var palettes = this.getPalettes();
      
      if(palettes[this.which]) {
        this.palette = utils.clone(palettes[this.which]);
      } else if(this.use === "constant") {
        this.palette = {"_default": this.which};
      } else if(this.use === "indicator") {
        this.palette = utils.clone(palettes["_continuous"]);
      } else if(this.use === "property") {
        this.palette = utils.clone(palettes["_discrete"]);
      } else {
        this.palette = utils.clone(palettes["_default"]);
      }
      
      return this.palette;
  },
    
  getPalette: function(){
    return (this.palette && Object.keys(this.palette._data).length>0? this.palette : this.buildPalette()).getPlainObject();
  },

  /**
   * Gets the domain for this hook
   * @returns {Array} domain
   */
  buildScale: function() {
    var _this = this;

    var indicatorsDB = globals.metadata.indicatorsDB;

    var paletteObject = _this.getPalette();
    var domain = Object.keys(paletteObject);
    var range = utils.values(paletteObject);

    this._hasDefaultColor = domain.indexOf("_default") > -1;

    if(this.scaleType == "time") {
      
      var timeMdl = this._parent._parent.time;
      var limits = timeMdl.beyondSplash ? 
          {min: timeMdl.beyondSplash.start, max: timeMdl.beyondSplash.end}
          :
          {min: timeMdl.start, max: timeMdl.end};
        
      var step = ((limits.max.valueOf() - limits.min.valueOf()) / (range.length - 1));
      domain = d3.range(limits.min.valueOf(), limits.max.valueOf(), step).concat(limits.max.valueOf());

      if(step === 0) {
        domain.push(domain[0]);
        range = [range[range.length - 1]];             
      }
      
      this.scale = d3.time.scale.utc()
        .domain(domain)
        .range(range)
        .interpolate(d3.interpolateRgb);
      return;
    }

    switch(this.use) {
      case "indicator":
        var limits = this.getLimits(this.which);
        //default domain is based on limits
        domain = [limits.min, limits.max];
        //domain from metadata can override it if defined
        domain = indicatorsDB[this.which].domain ? indicatorsDB[this.which].domain : domain;
          
        var limitMin = domain[0];
        var limitMax = domain[1];
        var step = (limitMax - limitMin) / (range.length - 1);
        domain = d3.range(limitMin, limitMax, step).concat(limitMax);
        if (domain.length > range.length) domain.pop();
        domain = domain.reverse();
        if(this.scaleType == "log") {
          var s = d3.scale.log()
            .domain([limitMin === 0 ? 1 : limitMin, limitMax])
            .range([limitMin, limitMax]);
          domain = domain.map(function(d) {
            return s.invert(d)
          });
        }

        this.scale = d3.scale[this.scaleType]()
          .domain(domain)
          .range(range)
          .interpolate(d3.interpolateRgb);
        return;

      default:
        range = range.map(function(m){ return utils.isArray(m)? m[0] : m; });
            
        this.scale = d3.scale["ordinal"]()
          .domain(domain)
          .range(range);
        return;
    }
  }

});

export default ColorModel;
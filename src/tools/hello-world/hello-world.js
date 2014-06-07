define([
    'underscore',
    'tools/tool'
], function(_, Tool) {

    var helloWorld = Tool.extend({
        init: function(context, options) {
            this.name = 'hello-world';
            this.placeholder = options.placeholder;
            this.state = _.extend({
                show: {
                    'world': {

                    }
                },
                time: '1980',
                timeRange: [1800, 2000],
                yaxis: {
                    indicator: 'gdp'
                },
                waffle: {
                    path: '../src/tools/hello-world/waffles/'
                },
                stats: {
                    path: '../src/tools/hello-world/waffles/stats/'
                }
            }, options.state);

            //todo: refactor the way we pass the state forward
            options.state = this.state;

            //todo: selectors should be improved
            this.components = {
                "barchart": ".vizabi-tool-viz",
                'timeslider': '.vizabi-tool-timeslider',
                'buttonlist': '.vizabi-tool-buttonlist'
                // "title": ".vizabi-tool-title",
            };

            this._super(context, options);
        },

        // At tool level, we only pass the callback and return the defered
        // from super to vizabi.js
        render: function() {
            return this._super(function() {
            });
        }

    });

    return helloWorld;
});
'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', './css/flow-panel.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, _createClass, FlowChartCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_cssFlowPanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('FlowChartCtrl', FlowChartCtrl = function (_MetricsPanelCtrl) {
        _inherits(FlowChartCtrl, _MetricsPanelCtrl);

        function FlowChartCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, FlowChartCtrl);

          var _this = _possibleConstructorReturn(this, (FlowChartCtrl.__proto__ || Object.getPrototypeOf(FlowChartCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;
          _this.hiddenSeries = {};

          var panelDefaults = {
            forward: {
              label: '流入',
              unit: 'N/A',
              value: '',
              format: 'short',
              extendUnit: '',
              show: true
            },
            opposite: {
              label: '流出',
              unit: 'N/A',
              value: '',
              format: 'short',
              extendUnit: '',
              show: true
            }
          };

          _.defaults(_this.panel, panelDefaults);

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(FlowChartCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/grafana-flow-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem, type) {
            if (type == 'forward') {
              this.panel.forward.format = subItem.value;
              this.panel.forward.value = this.formatValue(this.panel.forward.value, subItem.value);
            } else {
              this.panel.opposite.format = subItem.value;
              this.panel.opposite.value = this.formatValue(this.panel.opposite.value, subItem.value);
            }
            this.render();
          }
        }, {
          key: 'getDecimalsForValue',
          value: function getDecimalsForValue(value) {
            if (_.isNumber(this.panel.decimals)) {
              return { decimals: this.panel.decimals, scaledDecimals: null };
            }

            var delta = value / 2;
            var dec = -Math.floor(Math.log(delta) / Math.LN10);

            var magn = Math.pow(10, -dec);
            var norm = delta / magn; // norm is between 1.0 and 10.0
            var size;

            if (norm < 1.5) {
              size = 1;
            } else if (norm < 3) {
              size = 2;
              // special case for 2.5, requires an extra decimal
              if (norm > 2.25) {
                size = 2.5;
                ++dec;
              }
            } else if (norm < 7.5) {
              size = 5;
            } else {
              size = 10;
            }

            size *= magn;

            // reduce starting decimals if not needed
            if (Math.floor(value) === value) {
              dec = 0;
            }

            var result = {};
            result.decimals = Math.max(0, dec);
            result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

            return result;
          }
        }, {
          key: 'formatValue',
          value: function formatValue(value, format) {
            var decimalInfo = this.getDecimalsForValue(value);
            var formatFunc = kbn.valueFormats[format];
            if (formatFunc) {
              return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
            }
            return value;
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.data = this.parseSeries(this.series);
          }
        }, {
          key: 'checkSeries',
          value: function checkSeries(targets, series) {
            var seriesFull = [];
            if (targets.length == series.length) {
              return seriesFull = series;
            } else {
              var fillFlag = false;
              for (var i = 0, length = targets.length; i < length; i++) {
                for (var j = 0, sLen = series.length; j < sLen; j++) {
                  if (targets[i].item.filter == series[j].target) {
                    seriesFull.push(series[j]);
                    fillFlag = false;
                    break;
                  } else {
                    fillFlag = true;
                  }
                }
                if (fillFlag) {
                  if (targets[i].item && targets[i].item.filter) {
                    seriesFull.splice(i, 0, { 'target': targets[i].item.filter, datapoints: [] });
                  } else {
                    seriesFull.splice(i, 0, { 'target': '', datapoints: [] });
                  }
                }
              }
            }
            return seriesFull;
          }
        }, {
          key: 'setData',
          value: function setData(datapoints, panel) {
            if (datapoints.length > 0) {
              panel.value = datapoints[datapoints.length - 1][0];
              panel.value = this.formatValue(panel.value, panel.format);
            } else {
              panel.value = 'N/A';
            }
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            if (series && series.length > 0) {
              series = this.checkSeries(this.panel.targets, series);
              if (this.panel.forward.show) {
                var datapointsF = series[0].datapoints;
                this.setData(datapointsF, this.panel.forward);
              }
              if (this.panel.forward.show && this.panel.opposite.show) {
                if (series[1] && series[1].datapoints) {
                  var datapointsO = series[1].datapoints;
                  this.setData(datapointsO, this.panel.opposite);
                }
              }
              if (!this.panel.forward.show && this.panel.opposite.show) {
                var _datapointsO = series[0].datapoints;
                this.setData(_datapointsO, this.panel.opposite);
              }
            }
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            return seriesData;
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.data = this.parseSeries(this.series);
            this.render(this.data);
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            this.events.on('render', function () {
              var $panelContainer = elem.find('.panel-container');
              var $flowPanel = elem.find('.flow-panel');
              var $panelContent = elem.find('.panel-content');
              $panelContent.css('paddingLeft', '0px');
              $panelContent.css('paddingRight', '0px');
              $flowPanel.css('height', $panelContainer[0].offsetHeight - 40 + 'px');
            });
          }
        }]);

        return FlowChartCtrl;
      }(MetricsPanelCtrl));

      _export('FlowChartCtrl', FlowChartCtrl);

      FlowChartCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=flowchart_ctrl.js.map

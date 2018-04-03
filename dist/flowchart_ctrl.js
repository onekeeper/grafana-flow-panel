'use strict';

System.register(['app/plugins/sdk', 'lodash', './unit', 'app/core/utils/kbn', './css/flow-panel.css!'], function (_export, _context) {
	"use strict";

	var MetricsPanelCtrl, _, unit, kbn, _createClass, FlowChartCtrl;

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
		}, function (_unit) {
			unit = _unit.default;
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
							this.panel.forward.value = unit.formatValue(this.panel, this.panel.forward.value, subItem.value);
						} else {
							this.panel.opposite.format = subItem.value;
							this.panel.opposite.value = unit.formatValue(this.panel, this.panel.opposite.value, subItem.value);
						}
						this.render();
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
					key: 'setData',
					value: function setData(datapoints, panel) {
						if (datapoints.length > 0) {
							panel.value = datapoints[datapoints.length - 1][0];
							panel.value = unit.formatValue(panel, panel.value, panel.format);
						} else {
							panel.value = 'N/A';
						}
					}
				}, {
					key: 'parseSeries',
					value: function parseSeries(series) {
						if (series && series.length > 0) {
							series = unit.checkSeries(this.panel.targets, series);
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
						} else {
							this.setData([], this.panel.forward);
							this.setData([], this.panel.opposite);
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

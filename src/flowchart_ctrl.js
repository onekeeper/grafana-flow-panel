import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import unit from './unit';
import kbn from 'app/core/utils/kbn';
import './css/flow-panel.css!';

export class FlowChartCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    this.hiddenSeries = {};

    var panelDefaults = {
			forward:{
				label: '流入',
				unit:'N/A',
				format: 'short',
				extendUnit: '',
				show: true
			},	
			opposite:{
				label: '流出',
				unit:'N/A',
				format: 'short',
				extendUnit: '',
				show: true		  
			}
		};
		
		this.dataTemp = {
			forward:{
				value: ''
			},
			opposite:{
				value: ''
			}
		};

    _.defaults(this.panel, panelDefaults);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-flow-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }
  
  setUnitFormat(subItem, type) {	
	if(type == 'forward'){
		this.panel.forward.format = subItem.value;
		this.dataTemp.forward.value = unit.formatValue(this.panel, this.dataTemp.forward.value, subItem.value);
	}else{
		this.panel.opposite.format = subItem.value;
		this.dataTemp.opposite.value = unit.formatValue(this.panel, this.dataTemp.opposite.value, subItem.value);
	}
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }
  
  setData(datapoints, panel, data){
		if(datapoints.length > 0){
			data.value = datapoints[datapoints.length-1][0];	
			data.value = unit.formatValue(panel, data.value, panel.format);
		}else{
			data.value = 'N/A';
		}
  }

  parseSeries(series) {	  
		if(series && series.length > 0){
			series = unit.checkSeries(this.panel.targets, series);

			if(this.panel.forward.show){ 
				let datapointsF = series[0].datapoints; 
				this.setData(datapointsF, this.panel.forward, this.dataTemp.forward);
			}
			if(this.panel.forward.show && this.panel.opposite.show){
				if(series[1] && series[1].datapoints){
					let datapointsO = series[1].datapoints;  
					this.setData(datapointsO, this.panel.opposite, this.dataTemp.opposite);				
				}
			}
			if(!this.panel.forward.show && this.panel.opposite.show){
				let datapointsO = series[0].datapoints;  
				this.setData(datapointsO, this.panel.opposite, this.dataTemp.opposite);	
			}
		}else{
			this.setData([], this.panel.forward, this.dataTemp.forward);
			this.setData([], this.panel.opposite, this.dataTemp.opposite);
		}
		this.panel.forward.hasOwnProperty("value") && delete this.panel.forward.value;
		this.panel.opposite.hasOwnProperty("value") && delete this.panel.opposite.value;
		return this.dataTemp;	
  }
  
  seriesHandler(seriesData) {
		return seriesData;
  }

  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);
    this.render(this.data);
  }
  
  link(scope, elem) {
		this.events.on('render', () => {
			const $panelContainer = elem.find('.panel-container');
			const $flowPanel = elem.find('.flow-panel');
			const $panelContent = elem.find('.panel-content');
			$panelContent.css('paddingLeft','0px');
			$panelContent.css('paddingRight','0px');
			$flowPanel.css('height', ($panelContainer[0].offsetHeight-40)+'px');
		});
  }
}

FlowChartCtrl.templateUrl = 'module.html';

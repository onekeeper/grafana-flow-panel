import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
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
		  value: '',
		  format: 'short',
		  extendUnit: '',
		  show: true
	  },	
	  opposite:{
		  label: '流出',
		  unit:'N/A',
		  value: '',
		  format: 'short',
		  extendUnit: '',
		  show: true		  
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
		this.panel.forward.value = this.formatValue(this.panel.forward.value, subItem.value);
	}else{
		this.panel.opposite.format = subItem.value;
		this.panel.opposite.value = this.formatValue(this.panel.opposite.value, subItem.value);
	}
    this.render();
  }
  
  getDecimalsForValue(value) {
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
    if (Math.floor(value) === value) { dec = 0; }

    var result = {};
    result.decimals = Math.max(0, dec);
    result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

    return result;
  }

  formatValue(value, format) {
    var decimalInfo = this.getDecimalsForValue(value);
    var formatFunc = kbn.valueFormats[format];
    if (formatFunc) {
      return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }
    return value;
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }
  
  checkSeries(targets, series){
	let seriesFull = [];
	if(targets.length == series.length){
		return seriesFull = series;
	}else{
		let fillFlag = false;
		for(var i=0,length = targets.length; i<length; i++){
			for(var j=0,sLen = series.length; j<sLen; j++){
				if(targets[i].item.filter == series[j].target){
					seriesFull.push(series[j]);
					fillFlag = false;
					break;
				}else{
					fillFlag = true;
				}
			}
			if(fillFlag){
				if(targets[i].item && targets[i].item.filter){
					seriesFull.splice(i, 0, {'target':targets[i].item.filter, datapoints:[]});
				}else{
					seriesFull.splice(i, 0, {'target':'', datapoints:[]});
				}
			}
		}
	}
	return seriesFull;
  }
  
  setData(datapoints, panel){
	if(datapoints.length > 0){
		panel.value = datapoints[datapoints.length-1][0];	
		panel.value = this.formatValue(panel.value, panel.format);
	}else{
		panel.value = 'N/A';
	}
  }

  parseSeries(series) {	  
	if(series && series.length > 0){
		series = this.checkSeries(this.panel.targets, series);
		if(this.panel.forward.show){ 
			let datapointsF = series[0].datapoints; 
			this.setData(datapointsF, this.panel.forward);
		}
		if(this.panel.forward.show && this.panel.opposite.show){
			if(series[1] && series[1].datapoints){
				let datapointsO = series[1].datapoints;  
                this.setData(datapointsO, this.panel.opposite);				
			}
		}
		if(!this.panel.forward.show && this.panel.opposite.show){
			let datapointsO = series[0].datapoints;  
			this.setData(datapointsO, this.panel.opposite);	
		}
	}
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

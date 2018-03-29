import kbn from 'app/core/utils/kbn';

/**
*public unit method
*/
let unitObj = {
	checkSeries: function(targets, series){
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
	},
	getDecimalsForValue: function(panel, value) {
		if (_.isNumber(panel.decimals)) {
		  return { decimals: panel.decimals, scaledDecimals: null };
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
	  },
	  formatValue: function(panel, value, format) {
		var decimalInfo = this.getDecimalsForValue(panel, value);
		var formatFunc = kbn.valueFormats[format];
		if (formatFunc) {
		  return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
		}
		return value;
	  }
};

export default unitObj;


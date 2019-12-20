import { Init, d3Remove, d3, svgCheck, log, svgNotMsg } from '@saramin/ui-d3-helper';
import CLASS from '@saramin/ui-d3-selector';

const CombieBarChart = function(...arg) {
	const plugin = new Init(arg);
	let _this = {},
		targetNodes = _this.targetNodes = Init.setTarget(plugin),
		dataContainer = _this.dataContainer = Init.setData(plugin),
		options = _this.options = Init.setOptions(plugin,{
			w: 450,
			h: 240,
			mTop: 40,
			mRight: 20,
			mBottom: 50,
			mLeft: 50,
			barPadding: 0.55,
			qty: 6,
			dx1: "0.7em",
			dx2: "0.7em",
			barSpacing: 3,
			grouped: null,
			limitValue: null,
			limitGapValue: 50,
			maxShow: true
		}),
		instances = _this.instances = [];

	class BarChart {
		constructor(el, i) {
			this.el = el;
			this.idx = i;
			this.init();
		}
		init() {
			d3Remove(this.el);
			log('b', dataContainer)
			let data = dataContainer.map(i => {
				i.model_name = i.model_name;
				return i;
			});
			log('data', data)
			let realIdx = 0, // realmax
				yAxisTicks = [],
				isoMaxValue = 0;

			data.forEach((item, idx) => {
				if(item['top'] === 'y') {
					realIdx = idx;
				}
			});

			// set width,height
			const width = options.w - (options.mRight + options.mLeft),
				height = options.h - (options.mTop + options.mBottom);

			const g = d3.select(this.el)
				.append('svg')
				.classed(`${CLASS.combieChart}`, true)
				.attr('width', width + options.mLeft + options.mRight)
				.attr('height', height + options.mTop + options.mBottom)
				.attr('viewBox', `0 0 ${width + options.mLeft + options.mRight} ${height + options.mTop + options.mBottom}`)
				.append('g')
				.attr('transform', 'translate(' + options.mLeft + ',' + options.mTop + ')');

			const xScale0 = d3.scaleBand().range([0, width]).padding(options.barPadding);
			const xScale1 = d3.scaleBand();
			const yScale = d3.scaleLinear().range([height , 0]);
			const xAxis = d3.axisBottom(xScale0).tickSizeOuter(0);
			const yAxis = d3.axisLeft(yScale).ticks(options.qty).tickSize(-width);
			xScale0.domain(data.map(d => d.model_name));

			if(options.grouped) {
				xScale1.domain(['field1', 'field2']).range([0, xScale0.bandwidth()]);
				yScale.domain([0, d3.max(data, d => d.field1 > d.field2 ? (d.field1>>0) :(d.field2>>0))]);
				options.limitValue > 100 ? yScale.domain([0, d3.max(data, d => d.field1 > d.field2 ? (d.field1>>0) + options.limitGapValue :(d.field2>>0) + options.limitGapValue)]) : yScale.domain([0, 100]);

			} else {
				xScale1.domain(['field1']).range([0, xScale0.bandwidth()]);
				options.limitValue === 100 ? yScale.domain([0, 100]) : yScale.domain([0, d3.max(data, d => (d.field1>>0))]);
			}

			g.append('g')
				.attr('class', 'xAxis')
				.attr('transform', `translate(0,${height})`)
				.call(xAxis)
				.selectAll('.xAxis > .tick').nodes()[realIdx]
				.setAttribute('class', options.maxShow ? 'tick max' : 'tick');

			g.append('g')
				.attr('class', 'yAxis')
				.call(yAxis);



			const model_name = g.selectAll('.group')
				.data(data)
				.enter().append('g')
				.attr('class', (d, i) => {
					if(options.maxShow) {
						if(i === realIdx) {
							return 'group max';
						}
						return 'group';
					}else {
						return 'group';
					}

				})
				.attr('transform', d => `translate(${xScale0(d.model_name)},0)`);


			model_name.selectAll('.bar.field1')
				.data(d => [d])
				.enter()
				.append('rect')
				.attr('class', 'bar field1')
				.attr('x', d => xScale1('field1') - options.barSpacing)
				.attr('y', d => yScale(d.field1))
				.attr('width', xScale1.bandwidth())
				.attr('height', d => {
					return height - yScale(d.field1)
				});

			model_name.selectAll('.label.field1')
				.data(d => [d])
				.enter()
				.append('text')
				.classed('label field1', true)
				.text(d => d.field1)
				.attr('x', d => xScale1('field1') - options.barSpacing)
				.attr('y', d => yScale(d.field1) - 4)
				.attr('dx', options.dx1)
				.attr('text-anchor', 'middle');


			if(options.grouped) {
				model_name.selectAll('.bar.field2')
					.data(d => [d])
					.enter()
					.append('rect')
					.attr('class', 'bar field2')
					.attr('x', d => xScale1('field2') + options.barSpacing)
					.attr('y', d => yScale(d.field2))
					.attr('width', xScale1.bandwidth())
					.attr('height', d => {
						return height - yScale(d.field2)
					});

				model_name.selectAll('.label.field2')
					.data(d => [d])
					.enter()
					.append('text')
					.classed('label field2', true)
					.text(d => d.field2)
					.attr('x', d => xScale1('field2') + options.barSpacing)
					.attr('y', d => yScale(d.field2) - 4)
					.attr('dx', options.dx2)
					.attr('text-anchor', 'middle');
			}
		}
	}

	Array.from(targetNodes).forEach(exec);

	function exec(el, i) {
		svgCheck.status === true ? new BarChart(el, i) : svgNotMsg(el);
	}
	return _this;

};


export default CombieBarChart;

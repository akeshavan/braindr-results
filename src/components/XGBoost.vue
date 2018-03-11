<template>
  <div class="xgboost">
    <div class="container-fluid">
      <resize-observer @notify="handleResize" />
      <h6 class="text-center"> braindr Rating Distributions </h6>
      <div class="row">
        <div class="col-sm-6">
          <div class="row">
            <div class="col-sm-12" ref="xgImportance">
              <svg id="xgImportance" ></svg>
            </div>
          </div>
        </div>
        <div class="col-sm-6" >
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="xgImportanceNum">
              <svg id="xgImportanceNum"></svg>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <div class="row">
            <div class="col-sm-12" ref="xgROC">
              <svg id="xgROC"></svg>
            </div>
          </div>
        </div>
        <div class="col-sm-6" >
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="xgDist">
              <svg id="xgDist"></svg>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-8 offset-sm-2">
          <strong>Figure 6:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
          Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
          Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
          Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
          Cras vestibulum tincidunt faucibus.
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import _ from 'lodash';
import 'vue-resize/dist/vue-resize.css';
import Vue from 'vue';
import VueResize from 'vue-resize';
import numeral from 'numeral';
import dataset from '../assets/braindr_xgboost_data.json';

Vue.use(VueResize);
Vue.filter('formatNumber', value => numeral(value).format('0.0[0]'));
Vue.filter('formatNumber1', value => numeral(value).format('0.0e+0'));

/*
eslint no-param-reassign: ["error", { "props": true,"ignorePropertyModificationsFor":["ax", "axD"]}]
*/

const highlightOnColor = '#ffc107'; // warning
const highlightOffColor = '#6c757d'; // secondary

const d3 = require('d3');

export default {
  name: 'xgboost',
  data() {
    return {
      data: dataset,
      axes: {
        xgImportance: { ref: 'xgImportance', ax: null, data: dataset.user_importances, xName: 'idx', yName: 'F', legend: false },
        xgImportanceNum: { ref: 'xgImportanceNum', ax: null, data: dataset.user_importances, xName: 'ucounts', yName: 'F', legend: false },
        xgROC: { ref: 'xgROC', ax: null, data: dataset.rocs, legend: true },
        xgDist: { ref: 'xgDist', ax: null, data: null, xKey: 'xgboost_label', dataKey: 'ratings', legend: false },
      },
      colormap: d3.interpolateViridis,
    };
  },
  methods: {
    handleResize() {
      const refs = Object.keys(this.axes);
      for (let i = 0; i < refs.length; i += 1) {
        this.resetRange(this.axes[refs[i]]);
      }
      this.barGraphHist(this.axes.xgDist.ax, 0, 1, this.axes.xgDist.data, 'Aggregate Rating', 'Count', 0.1);
      this.barGraph(this.axes.xgImportance.ax, this.axes.xgImportance.data,
        this.axes.xgImportance.xName, this.axes.xgImportance.yName, 1,
        this.axes.xgImportance.data.length, 1, this.highlightPointOn,
        this.highlightPointOff);
      this.scatterPoints(this.axes.xgImportanceNum.ax, this.axes.xgImportanceNum.data,
        this.axes.xgImportanceNum.xName, this.axes.xgImportanceNum.yName,
        this.highlightPointOn, this.highlightPointOff);
      this.plotROCs(this.axes.xgROC.ax, this.axes.xgROC.data);
    },
    resetRange(axD) {
      const width = this.$refs[axD.ref].clientWidth - axD.ax.margin.left - axD.ax.margin.right;
      axD.ax.xScale.range([0, width]);
      axD.ax.width = width;
      this.resizeAxes(axD.ax);
    },
    initAx(ref, legend) {
      const W = this.$refs[ref].clientWidth;
      this.axes[ref].ax = this.renderAxes(`#${ref}`, W * (2 / 3), W, legend);
    },
    resizeAxes(ax) {
      const newWidth = ax.width + ax.margin.left + ax.margin.right;
      const newHeight = ax.height + ax.margin.top + ax.margin.bottom;
      d3
        .select(ax.elem)
        .attr('width', newWidth)
        .attr('height', newHeight);
      // ax.svg.select('.plotArea')

      ax.svg.select('.x.axis.label')
        .attr('x', newWidth / 2)
        .call(ax.xAxis);

      ax.svg.select('.legend')
        .attr('transform', `translate(${ax.width * (5 / 8)}, ${ax.height * (5 / 8)})`);
    },
    renderAxes(elem, hei, wid, legend) {
      // define margins on the plot -- this will give room for axes labels, titles
      const H = hei || 300;
      const W = wid || 500;
      const margin = { top: 20, right: 20, bottom: 30, left: 60 };

      // total dimensions are 500x300
      const width = W - margin.left - margin.right;
      const height = H - margin.top - margin.bottom;

      // value -> display
      const xScale = d3.scaleLinear().range([0, width]);
      const yScale = d3.scaleLinear().range([height, 0]);
      // in SVG, y=0 is at the top, so we switch the order

      const svg = d3
        .select(elem)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('class', 'plotArea')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      if (legend) {
        svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${width * (5 / 8)}, ${height * (5 / 8)})`);
      }

      const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0); // axis object
      const yAxis = d3.axisLeft(yScale).ticks(5).tickSizeOuter(0);

      // x-axis
      svg
        .append('g')
        .attr('class', 'x axis')
        // take X to bottom of SVG
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .append('text')
        .attr('class', 'label')
        .attr('x', width / 2)
        .attr('y', 25)
        .attr('font-size', '1em')
        .style('text-anchor', 'center')
        .style('fill', 'black')
        .text('X');

      // y-axis
      svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -height / 2)
        .attr('dy', '.71em')
        .attr('font-size', '1em')
        .style('text-anchor', 'center')
        .style('fill', 'black')
        .text('Y');

      return {
        svg,
        xScale,
        yScale,
        xAxis,
        yAxis,
        height,
        width,
        elem,
        margin,
      };
    },
    computeHist(axD, thresholds) {
      const histRating = d3.histogram().domain([thresholds[0], thresholds[thresholds.length - 1]])
        .thresholds(thresholds);
      const data = histRating(_.map(this.data[axD.dataKey], d => d[axD.xKey]));
      this.axes[axD.ref].data = data;
    },
    barGraphHist(ax, xMin, xMax, data, xLabel, yLabel, binSize) {
      const self = this;
      const xValue = function xVal(d) {
        return d.x0;
      };
      const yValue = function yVal(d) {
        return d.length;
      };

      // set domain again in case data changed bounds
      ax.xScale.domain([xMin, xMax]);
      ax.yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]);

      // redraw axis
      ax.svg.selectAll('.x.axis').call(ax.xAxis).selectAll('.label').text(xLabel);

      ax.svg.selectAll('.y.axis').call(ax.yAxis).selectAll('.label').text(yLabel);

      ax.svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar');

      ax.svg.selectAll('.countlabel')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'countlabel');

      ax.svg.selectAll('.bar')
        .attr('x', d => ax.xScale(xValue(d)))
        .attr('width', ax.xScale(binSize) - ax.xScale(0))
        .attr('y', d => ax.yScale(yValue(d)))
        .attr('height', d => ax.height - ax.yScale(yValue(d)))
        .style('fill', self.colormap(0.2));

      ax.svg.selectAll('.countlabel')
        .attr('x', d => ax.xScale(xValue(d)) + ((ax.xScale(binSize) - ax.xScale(0)) / 2))
        .attr('y', d => ax.yScale(yValue(d)) - (ax.height * 0.05))
        .text(d => yValue(d))
        .attr('opacity', 0)
        .attr('dy', '0.75em');

      ax.svg.selectAll('.bar')
        .data(data)
        .exit()
        .remove('rect');

      ax.svg.selectAll('.countlabel')
        .data(data)
        .exit()
        .remove('text');

      ax.svg.selectAll('.bar')
        .on('mouseover', function setColor(d, i) {
          d3.select(this).style('fill', highlightOnColor);
          ax.svg.selectAll('.countlabel').each(function go(dd, ii) {
            if (ii === i) {
              d3.select(this).attr('opacity', 1);
            }
          });
        })
        .on('mouseout', function setColor(d, i) {
          d3.select(this).style('fill', self.colormap(0.2));
          ax.svg.selectAll('.countlabel').each(function go(dd, ii) {
            if (ii === i) {
              d3.select(this).attr('opacity', 0);
            }
          });
        });
    },
    barGraph(ax, data, xName, yName, xMin, xMax,
      binSize, hoverOnCallback, hoverOffCallback) {
      const xValue = function xValue(d) {
        return d[xName];
      };
      const yValue = function yValue(d) {
        return d[yName];
      };

      ax.typeSelector = '.bar';
      ax.xName = xName;
      ax.yName = yName;
      ax.minMax = this.getMinMax(data, ax.yName);

      // set domain again in case data changed bounds
      ax.xScale.domain([xMin, xMax]);
      ax.yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]);

      // redraw axis
      ax.svg.selectAll('.x.axis').call(ax.xAxis).selectAll('.label').text(xName);

      ax.svg.selectAll('.y.axis').call(ax.yAxis).selectAll('.label').text(yName);

      ax.svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar');

      ax.svg.selectAll('.bar')
        .attr('x', d => ax.xScale(xValue(d)))
        .attr('width', ax.xScale(binSize) - ax.xScale(0))
        .attr('y', d => ax.yScale(yValue(d)))
        .attr('height', d => ax.height - ax.yScale(yValue(d)))
        .style('fill', this.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));

      ax.svg.selectAll('.bar')
        .data(data)
        .exit()
        .remove('rect');

      const self = this;
      ax.svg.selectAll('.bar')
        .on('mouseover', function setColor(d, i) {
          d3.select(this).style('fill', highlightOnColor);
          hoverOnCallback(d, i);
        })
        .on('mouseout', function setColor(d, i) {
          d3.select(this).style('fill', self.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));
          hoverOffCallback(d, i);
        });
    },
    scatterPoints(ax, data, xName, yName, hoverOnCallback, hoverOffCallback) {
      const xValue = function xValue(d) {
        return d[xName];
      };
      const yValue = function yValue(d) {
        return d[yName];
      };

      // set domain again in case data changed bounds
      ax.xScale.domain([d3.min(data, xValue), d3.max(data, xValue)]);
      ax.yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]);

      // redraw axis
      ax.svg.selectAll('.x.axis').call(ax.xAxis).selectAll('.label').text(xName);

      ax.svg.selectAll('.y.axis').call(ax.yAxis).selectAll('.label').text(yName);

      // add data
      ax.svg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot');

      ax.typeSelector = '.dot';
      ax.xName = xName;
      ax.yName = yName;
      ax.xValue = xValue;
      ax.yValue = yValue;
      ax.minMax = this.getMinMax(data, ax.yName);
      // update data
      ax.svg
        .selectAll('.dot')
        .attr('cx', d => ax.xScale(xValue(d)))
        .transition()
        .duration(1000)
        .attr('cy', d => ax.yScale(yValue(d)));


      ax.svg
        .selectAll('.dot')
        .style('fill', this.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));

      const self = this;
      // events: when you highlight a dot, highlight the corresponding histogram bar
      ax.svg
        .selectAll('.dot')
        .on('mouseover', function setColor(d, i) {
          d3.select(this).style('fill', highlightOnColor);
          hoverOnCallback(d, i);
        })
        .on('mouseout', function setColor(d, i) {
          d3.select(this).style('fill', self.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));
          hoverOffCallback(d, i);
        });

      // remove dots
      ax.svg
        .selectAll('.dot')
        .data(data)
        .exit()
        .transition()
        .duration(1000)
        .style('opacity', 1e-6)
        .attr('cy', () => 0)
        .remove();
    },
    plotROCs(ax, data) {
      // set domain again in case data changed bounds
      ax.xScale.domain([0, 1]);
      ax.yScale.domain([0, 1]);

      // redraw axis
      ax.svg.selectAll('.x.axis')
        .call(ax.xAxis)
        .selectAll('.label')
        .text('False Positive Rate')
        .style('text-anchor', 'center');
      ax.svg.selectAll('.y.axis')
        .call(ax.yAxis)
        .selectAll('.label')
        .text('True Positive Rate')
        .style('text-anchor', 'center');

      const lines = [];
      const lineData = [];

      for (let i = 0; i < data.length; i += 1) {
        const ld = [];
        const line = d3.line()
          .x(d => ax.xScale(d.x))
          .y(d => ax.yScale(d.y));
        lines.push(line);
        for (let j = 0; j < data[i].fpr.length; j += 1) {
          ld.push({ x: data[i].fpr[j], y: data[i].tpr[j] });
        }
        lineData.push(ld);
        if (i === data.length - 1) {
          const ld2 = [];
          for (let j = 0; j < data[i].fpr_a.length; j += 1) {
            ld2.push({ x: data[i].fpr_a[j], y: data[i].tpr_a[j] });
          }
          lineData.push(ld2);
          lines.push(line);
        }
      }
      const self = this;
      ax.svg.selectAll('.roc')
        .data(lines)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'roc')
        .attr('stroke', (d, i) => self.colormap(i / 5))
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1);

      const highlightCurveOn = function highlightCurve(d, i) {
        ax.svg.selectAll('.roc').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .attr('stroke-width', 3)
              .attr('stroke', highlightOnColor);
          }
        });
        ax.svg.selectAll('.entrylinetext').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .attr('font-weight', 'bold');
          }
        });
        ax.svg.selectAll('.entryline').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .style('stroke-width', 3)
              .style('stroke', highlightOnColor);
          }
        });
      };

      const highlightCurveOff = function highlightCurve(d, i) {
        ax.svg.selectAll('.roc').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .attr('stroke-width', 1)
              .attr('stroke', () => self.colormap(ii / 5));
          }
        });
        ax.svg.selectAll('.entrylinetext').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .attr('font-weight', 'normal');
          }
        });
        ax.svg.selectAll('.entryline').each(function curve(dd, ii) {
          if (ii === i) {
            d3.select(this)
              .style('stroke-width', 1)
              .style('stroke', () => self.colormap(ii / 5));
          }
        });
      };

      ax.svg.select('.legend').selectAll('.entrylinetext')
        .data(lines)
        .enter()
        .append('text')
        .attr('class', 'entrylinetext')
        .text((d, i) => {
          if (i === 4) {
            return `${d3.format('0.3f')(data[0].auc_a)}; avg`;
          }
          return `${d3.format('0.3f')(data[i].auc)}; n=${data[i].train_size}`;
        })
        .attr('y', (d, i) => i * 15)
        .attr('x', 15)
        .attr('font-size', '0.75em')
        .attr('cursor', 'default')
        .on('mouseover', highlightCurveOn)
        .on('mouseout', highlightCurveOff);

      ax.svg.select('.legend').selectAll('.entryline')
        .data(lines)
        .enter()
        .append('line')
        .attr('class', 'entryline')
        .attr('x1', 0)
        .attr('x2', 10)
        .attr('y1', (d, i) => (i * 15) - 5)
        .attr('y2', (d, i) => (i * 15) - 5)
        .attr('cursor', 'default')
        .style('stroke', (d, i) => self.colormap(i / 5))
        .on('mouseover', highlightCurveOn)
        .on('mouseout', highlightCurveOff);

      ax.svg.selectAll('.roc').each(function doLine(d, i) {
        d3.select(this).datum(lineData[i]).attr('d', lines[i]);
      });
    },
    highlightPointOn(d, i) {
      this.axes.xgImportanceNum.ax.svg.selectAll('.dot').each(function h(dd, ii) {
        if (ii === i) {
          d3.select(this).style('fill', highlightOnColor);
        }
      });
    },
    highlightPointOff(d, i) {
      const self = this;
      const ax = this.axes.xgImportanceNum.ax;
      this.axes.xgImportanceNum.ax.svg.selectAll('.dot').each(function h(dd, ii) {
        if (ii === i) {
          d3.select(this).style('fill', self.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));
        }
      });
    },
    highlightBarOn(d, i) {
      this.axes.xgImportance.ax.svg.selectAll('.bar').each(function h(dd, ii) {
        if (ii === i) {
          d3.select(this).style('fill', highlightOnColor);
        }
      });
    },
    highlightBarOff(d, i) {
      const self = this;
      const ax = this.axes.xgImportance.ax;
      this.axes.xgImportance.ax.svg.selectAll('.bar').each(function h(dd, ii) {
        if (ii === i) {
          d3.select(this).style('fill', self.getHighlightOffColorMap(ax.minMax[0], ax.minMax[1], ax.yName));
        }
      });
    },
    getHighlightOffColorMap(minVal, maxVal, xName) {
      const self = this;
      return function cmap(d) {
        return self.colormap((d[xName] - minVal) / (maxVal - minVal));
      };
    },
    getMinMax(data, xName) {
      return [d3.min(data, d => d[xName]), d3.max(data, d => d[xName])];
    },
  },
  mounted() {
    console.log('dataset', dataset);
    this.data = dataset;
    const refs = Object.keys(this.axes);
    for (let i = 0; i < refs.length; i += 1) {
      this.initAx(refs[i], this.axes[refs[i]].legend);
    }
    this.computeHist(this.axes.xgDist, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
    this.barGraphHist(this.axes.xgDist.ax, 0, 1, this.axes.xgDist.data, 'Aggregate Rating', 'Count', 0.1);
    this.barGraph(this.axes.xgImportance.ax, this.axes.xgImportance.data,
      this.axes.xgImportance.xName, this.axes.xgImportance.yName, 1,
      this.axes.xgImportance.data.length, 1,
      this.highlightPointOn, this.highlightPointOff);
    this.scatterPoints(this.axes.xgImportanceNum.ax, this.axes.xgImportanceNum.data,
      this.axes.xgImportanceNum.xName, this.axes.xgImportanceNum.yName,
      this.highlightBarOn, this.highlightBarOff);
    this.plotROCs(this.axes.xgROC.ax, this.axes.xgROC.data);
  },
};
</script>

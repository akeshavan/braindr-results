<template>
  <div class="vggresults">
    <div class="container-fluid">
      <resize-observer @notify="handleResize" />
      <h6 class="text-center"> Transfer Learning Results </h6>
      <div class="row">
        <div class="col-sm-5 offset-sm-1">
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="vggTrain">
              <svg id="vggTrain" ></svg>
            </div>
          </div>
        </div>
        <div class="col-sm-5">
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="vggROC">
              <svg id="vggROC"></svg>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-8 offset-sm-2">
          <strong>Figure 7:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
import Vue from 'vue';
import VueResize from 'vue-resize';
import dataset from '../assets/braindr_vgg_results.json';

const d3 = require('d3');

const highlightOnColor = '#ffc107'; // warning
const highlightOffColor = d3.interpolateViridis(0.2); // '#6c757d'; // secondary

Vue.use(VueResize);

/*
eslint no-param-reassign: ["error", { "props": true,"ignorePropertyModificationsFor":["ax", "axD"]}]
*/

export default {
  name: 'vggresults',
  data() {
    return {
      data: dataset,
      axes: { vggROC: { ref: 'vggROC', ax: null, data: dataset, legend: true },
        vggTrain: { ref: 'vggTrain', ax: null, data: dataset, legend: true } },
      colormap: d3.interpolateViridis,
    };
  },
  methods: {
    handleResize() {
      const refs = Object.keys(this.axes);
      for (let i = 0; i < refs.length; i += 1) {
        this.resetRange(this.axes[refs[i]]);
      }
      this.plotROCs(this.axes.vggROC.ax, this.axes.vggROC.data);
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

      const line = d3.line()
        .x(d => ax.xScale(d.x))
        .y(d => ax.yScale(d.y));

      console.log('data vgg', data.vgg);
      for (let i = 0; i < data.vgg.length; i += 1) {
        const ld = [];
        lines.push(line);
        for (let j = 0; j < data.vgg[i].fpr.length; j += 1) {
          ld.push({ x: data.vgg[i].fpr[j], y: data.vgg[i].tpr[j] });
        }
        lineData.push(ld);
      }

      const ld2 = [];
      for (let j = 0; j < data.crowd.fpr_a.length; j += 1) {
        ld2.push({ x: data.crowd.fpr_a[j], y: data.crowd.tpr_a[j] });
      }
      lineData.push(ld2);
      lines.push(line);

      const ld3 = [];
      for (let j = 0; j < data.crowd.fpr.length; j += 1) {
        ld3.push({ x: data.crowd.fpr[j], y: data.crowd.tpr[j] });
      }
      lineData.push(ld3);
      lines.push(line);

      const self = this;
      ax.svg.selectAll('.roc')
        .data(lines)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'roc')
        .attr('stroke', (d, i) => {
          if (i < 10) {
            return self.colormap(0);
          } else if (i === 10) {
            return self.colormap(0.6);
          }
          return self.colormap(0.8);
        })
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
              .attr('stroke', () => self.colormap(ii / 11));
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
              .style('stroke', () => self.colormap(ii / 11));
          }
        });
      };

      ax.svg.select('.legend').selectAll('.entrylinetext')
        .data(lines.slice(9))
        .enter()
        .append('text')
        .attr('class', 'entrylinetext')
        .text((d, i) => {
          /* if (i === 4) {
            return `${d3.format('0.3f')(data[0].auc_a)}; avg`;
          }
          return `${d3.format('0.3f')(data[i].auc)}; n=${data[i].train_size}`; */
          return 'hi';
        })
        .text('hi')
        .attr('y', (d, i) => i * 15)
        .attr('x', 15)
        .attr('font-size', '0.75em')
        .attr('cursor', 'default')
        .on('mouseover', highlightCurveOn)
        .on('mouseout', highlightCurveOff);

      ax.svg.select('.legend').selectAll('.entryline')
        .data(lines.slice(9))
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
    plotLines(ax, data) {
      // set domain again in case data changed bounds
      ax.xScale.domain([0, 50]);
      ax.yScale.domain([0, 0.1]);

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

      const lineVal = d3.line()
        .x(d => ax.xScale(d.epoch))
        .y(d => ax.yScale(d.loss));

      const lineTrain = d3.line()
        .x(d => ax.xScale(d.epoch))
        .y(d => ax.yScale(d.val_loss));

      const self = this;
      ax.svg.selectAll('.train')
        .data(data.vgg)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'train')
        .attr('stroke', self.colormap(0))
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1);

      ax.svg.selectAll('.val')
        .data(data.vgg)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('class', 'val')
        .attr('stroke', self.colormap(0.5))
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1);

      ax.svg.selectAll('.train').each(function doLine(d) {
        d3.select(this).datum(d.training).attr('d', lineTrain);
      });

      ax.svg.selectAll('.val').each(function doLine(d) {
        d3.select(this).datum(d.training).attr('d', lineVal);
      });
    },
  },
  mounted() {
    this.data.vgg.forEach((val, idx) => {
      this.data.vgg[idx].training = JSON.parse(val.training);
    });
    const refs = Object.keys(this.axes);
    for (let i = 0; i < refs.length; i += 1) {
      this.initAx(refs[i], this.axes[refs[i]].legend);
    }
    console.log('dataset vgg', this.data);
    this.plotROCs(this.axes.vggROC.ax, this.axes.vggROC.data);
    this.plotLines(this.axes.vggTrain.ax, this.axes.vggTrain.data);
  },
};
</script>

<template>
  <div class="mindcontroldistribution mt-3 mb-3 pb-3 pt-3">
    <div class="container-fluid">
      <resize-observer @notify="handleResize" />
      <h6 class="text-center"> 3D Image Inspection Rating Distributions </h6>
      <div class="row">
        <div class="col-sm-4 offset-sm-2">
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="mcRatings">
              <svg id="mcRatings" ></svg>
            </div>
          </div>
        </div>
        <div class="col-sm-4" >
          <div class="row">
            <div class="col-sm-12 pl-0 pr-0" ref="mcCounts">
              <svg id="mcCounts"></svg>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-8 offset-sm-2">
          <strong>Figure 4:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
.countlabel {
  font-size: 0.75em;
  text-anchor: middle;
}
</style>

<script>
import _ from 'lodash';
import 'vue-resize/dist/vue-resize.css';
import Vue from 'vue';
import VueResize from 'vue-resize';
import numeral from 'numeral';
import dataset from '../assets/data_mindcontrol_figure.json';

const d3 = require('d3');

const highlightOnColor = '#ffc107'; // warning
const highlightOffColor = d3.interpolateViridis(0.2); // '#6c757d'; // secondary

Vue.use(VueResize);
Vue.filter('formatNumber', value => numeral(value).format('0.0[0]'));
Vue.filter('formatNumber1', value => numeral(value).format('0.0e+0'));

/*
eslint no-param-reassign: ["error", { "props": true,"ignorePropertyModificationsFor":["ax", "axD"]}]
*/

export default {
  name: 'mcdist',
  data() {
    return {
      data: dataset,
      axes: { mcRatings: { ax: null, data: null, ref: 'mcRatings' },
        mcCounts: { ax: null, data: null, ref: 'mcCounts' } },
    };
  },
  methods: {
    handleResize() {
      this.resetRange(this.axes.mcRatings);
      this.resetRange(this.axes.mcCounts);
      this.barGraph(this.axes.mcRatings.ax, -5, 5, this.axes.mcRatings.data, 'Rating', 'Count', 1);
      this.barGraph(this.axes.mcCounts.ax, 1, 5, this.axes.mcCounts.data, '# Ratings/Image', 'Count', 1);
    },
    resetRange(axD) {
      const width = this.$refs[axD.ref].clientWidth - axD.ax.margin.left - axD.ax.margin.right;
      // const height = (this.$refs[axD.ref].clientWidth * (2 / 3))
      // - axD.ax.margin.top - axD.ax.margin.bottom;
      axD.ax.xScale.range([0, width]);
      // axD.ax.yScale.range([height, 0]);
      axD.ax.width = width;
      // axD.ax.height = height;
      this.resizeAxes(axD.ax);
    },
    resizeAxes(ax) {
      d3
        .select(ax.elem)
        .attr('width', ax.width + ax.margin.left + ax.margin.right)
        .attr('height', ax.height + ax.margin.top + ax.margin.bottom);
      // ax.svg.select('.plotArea')

      ax.svg.select('.x.axis.label')
        .attr('x', ax.width / 2)
        .call(ax.xAxis);
    },
    renderAxes(elem, hei, wid) {
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
        .style('text-anchor', 'end')
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
        .style('text-anchor', 'end')
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
    barGraph(ax, xMin, xMax, data, xLabel, yLabel, binSize) {
      // const self = this;
      const xValue = function xVal(d) {
        return d.x0;
      };
      const yValue = function yVal(d) {
        return d.length;
      };

      // set domain again in case data changed bounds
      ax.xScale.domain([xMin, xMax]);
      ax.yScale.domain([Math.min(0, d3.min(data, yValue)), d3.max(data, yValue)]);

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
        .style('fill', highlightOffColor);

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
          d3.select(this).style('fill', highlightOffColor);
          ax.svg.selectAll('.countlabel').each(function go(dd, ii) {
            if (ii === i) {
              d3.select(this).attr('opacity', 0);
            }
          });
        });
    },
  },
  mounted() {
    const W = this.$refs.mcRatings.clientWidth;
    const ax0 = this.renderAxes('#mcRatings', W * (2 / 3), W);
    this.axes.mcRatings.ax = ax0;
    const W1 = this.$refs.mcCounts.clientWidth;
    const ax1 = this.renderAxes('#mcCounts', W1 * (2 / 3), W1);
    this.axes.mcCounts.ax = ax1;

    const histRating = d3.histogram().domain([d3.min(this.data.average_rating, d => d.score),
      d3.max(this.data.average_rating, d => d.score)]);

    const histCount = d3.histogram().domain([1, 4]).thresholds([1, 2, 3, 4]);

    this.axes.mcRatings.data = histRating(_.map(this.data.average_rating, d => d.score));
    this.axes.mcCounts.data = histCount(_.map(this.data.n_ratings_per_image, d => d.score));

    this.barGraph(this.axes.mcRatings.ax, -5, 5, this.axes.mcRatings.data, 'Rating', 'Count', 1);
    this.barGraph(this.axes.mcCounts.ax, 1, 5, this.axes.mcCounts.data, '# Ratings/Image', 'Count', 1);
  },
};
</script>

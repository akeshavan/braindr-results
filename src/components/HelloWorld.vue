<template>
  <div class="container-fluid" ref="main">
    <resize-observer @notify="handleResize" />
    <div class="row">
      <div class="col-sm-3">
        <div class="row">
          <div class="col-sm-12">
            <div class="chart-wrapper">
              <div class="chart-title">
                Braindr Ratings
              </div>
              <div class="chart-stage" ref="braindr">
                <svg id="scatterBarArea"></svg>
              </div>
              <div class="chart-notes mb-3">
                Notes about this braindr
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div class="chart-wrapper">
              <div class="chart-title">
                Mindcontrol Ratings
              </div>
              <div class="chart-stage" ref="mc">
                <svg id="scatterBarAreaMc"></svg>
              </div>
              <div class="chart-notes mb-3">
                Notes about this mc
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div class="chart-wrapper">
              <div class="chart-title">
                MRIQC Ratings
              </div>
              <div class="chart-stage" ref="mriqc">
                <svg id="scatterBarAreaMriqc"></svg>
              </div>
              <div class="chart-notes">
                Notes about this mriqc
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-7">
        <div class="row">
          <div class="col-sm-12">
            <div class="chart-wrapper">
              <div class="chart-title">
                <h5>Age vs

                  <b-form-select v-model="axes.scatter.yName" style="max-width: 150px;"
                            :options="metricOptions" class="mb-1"/>

                    Volume:
                </h5>
              </div>
              <div class="chart-stage" ref="scatter">
                <svg id="scatterArea"></svg>
              </div>
              <div class="chart-notes mb-3">

              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <!-- Put the Images here!! -->
          <div class="text-center w-100">
            <h5 class="mb-0 pb-0">
              braindr images
              <a class="btn btn-sm btn-outline-info"
                v-if="clickPointIdx !== null"
                :href="'http://mindcontrol-hbn.herokuapp.com/T1w/' + data[clickPointIdx].indi_name + '_T1w'"
                >
                View 3D
              </a>
            </h5>
            <small class="mt-0 pt-0"
              v-if="clickPointIdx === null">
              Click a point above to view slices
            </small>
            <small v-else>Viewing: {{data[clickPointIdx].indi_name}}</small>
          </div>
          <div class="images mx-auto" style="min-height: 150px;"></div>
        </div>
      </div>
      <div class="col-sm-2">


        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 class="mb-0 pb-0">Statistics</h4>
            <small> Results from an OLS model </small>
          </div>
        </div>
        <!-- R2 -->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0"> {{model.R2 | formatNumber}} </h4>
            <span > R<sup>2</sup> </span>
          </div>
        </div>

        <!-- Coef age-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{model.coef[1] | formatNumber}}
            </h4>
            <span > Age Coefficient (mm<sup>3</sup>/yr) </span>
          </div>
        </div>

        <!-- T age-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{model.t.t[1] | formatNumber}}
            </h4>
            <span > t(Age) </span>
          </div>
        </div>

        <!-- Coef intercept-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{model.coef[0] | formatNumber}}
            </h4>
            <span > Intercept (mm<sup>3</sup>) </span>
          </div>
        </div>


        <!-- T intercept-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{model.t.t[0] | formatNumber}}
            </h4>
            <span > t(Intercept) </span>
          </div>
        </div>

        <!-- p(Age)-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{model.t.p[1] | formatNumber1}}
            </h4>
            <span > p(Age) </span>
          </div>
        </div>

        <!-- n comparisons-->
        <div class="row mb-3">
          <div class="col-sm-12">
            <h4 v-if="model.R2" class="mb-0 pb-0">
              {{nComparisons}}
            </h4>
            <span > Number of Comparisons </span>
          </div>
        </div>

        <hr>

        <div class="row mb-0">
          <div class="col-sm-12">
            <b-form-group label="Split by Sex">
              <b-form-radio-group id="btnradios2"
                                  buttons
                                  button-variant="outline-info"
                                  size="sm"
                                  v-model="selectedType"
                                  :options="typeOptions"
                                  class="mb-0"
                                  name="radioBtnOutline" />
            </b-form-group>
          </div>
        </div>

        <div class="row mb-0">
          <div class="col-sm-12">
            <b-form-group label="Polynomial Fit">
              <b-form-radio-group id="btnradios3"
                                  buttons
                                  button-variant="outline-primary"
                                  size="sm"
                                  v-model="selectedPolyType"
                                  :options="polytypeOptions"
                                  class="mb-0"
                                  name="radioBtnOutline" />
            </b-form-group>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import 'vue-resize/dist/vue-resize.css';
import Vue from 'vue';
import VueResize from 'vue-resize';
import numeral from 'numeral';
import dataset from '../assets/braindr_results_final-3-5-18.json';

Vue.use(VueResize);
Vue.filter('formatNumber', value => numeral(value).format('0.0[0]'));
Vue.filter('formatNumber1', value => numeral(value).format('0.0e+0'));

const d3 = require('d3');
const jStat = require('jStat').jStat;

window.d3 = d3;
window.jStat = jStat;
/* eslint func-names: ["error", "as-needed"] */
/*
eslint no-param-reassign: ["error", { "props": true,"ignorePropertyModificationsFor":["ax", "axD"]}]
*/
/* eslint prefer-arrow-callback: [ "error", { "allowNamedFunctions": true } ] */


const highlightOnColor = '#ffc107'; // warning
const highlightOffColor = '#6c757d'; // secondary
const brushOnColor = '#17a2b8'; // info
const lineColor = '#dc3545'; // danger
const confColor = '#dc3545'; // danger again
const clickColor = highlightOnColor; // '#28a745'; // success
// const selectedIndices = [];
// window.selectedIndices = selectedIndices;


export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Brain Volume vs Age',
      data: dataset,
      brushedPoints: [],
      model: {},
      nComparisons: 1,
      globalBrushes: {},
      metricOptions: [{
        value: 'gray_matter',
        text: 'gray matter',
      },
      {
        value: 'white_matter',
        text: 'white matter',
      },
      {
        value: 'csf',
        text: 'CSF',
      },
      ],
      selectedType: false,
      typeOptions: [
        { text: 'Off', value: false },
        { text: 'On', value: true },
      ],
      selectedPolyType: false,
      polytypeOptions: [
        { text: 'Off', value: false },
        { text: 'On', value: true },
      ],
      clickPointIdx: null,
      selectedBarIndices: [],
      selectedBarMetric: null,
      axes: {
        scatter: { data: dataset, ax: null, xName: 'age', yName: 'gray_matter', ref: 'scatter' },
        braindr: { data: null,
          ref: 'braindr',
          ax: null,
          xMin: 0,
          xMax: 1,
          binSize: 0.1,
          xName: 'x0',
          yName: 'length',
          mName: 'label_3D_avg' },
        mc: { data: null,
          ref: 'mc',
          ax: null,
          xMin: -5,
          xMax: 5,
          binSize: 1,
          xName: 'x0',
          yName: 'length',
          mName: 'mc_rating' },
        mriqc: { data: null,
          ref: 'mriqc',
          ax: null,
          xMin: 0,
          xMax: 1,
          binSize: 0.1,
          xName: 'x0',
          yName: 'length',
          mName: 'mriqc_pred_xg' },
      },
    };
  },
  computed: {
    selectedPointIndices() {
      if (!this.selectedBarIndices) {
        return [];
      }

      const ax = _.filter(this.axes, v => v.mName === this.selectedBarMetric)[0];
      if (ax) {
        const selectedPointIndices = [];

        // loop over all points in the point dataset (this.data):
        this.data.forEach((val, idx) => {
          // loop over all bins (ax.data)
          ax.data.forEach((bin, bidx) => {
            if (this.selectedBarIndices.indexOf(bidx) >= 0) {
              // this bin is selected. Does the point live inside it?
              if (val[this.selectedBarMetric] <= bin.x1 && val[this.selectedBarMetric] > bin.x0) {
                // The point lives in the selected bin! append it
                selectedPointIndices.push(idx);
              }
            }
          });
        });
        return selectedPointIndices;
      }

      return [];
    },
    pointArrays() {
      const xName = this.axes.scatter.xName;
      const yName = this.axes.scatter.yName;
      const X = [];
      const y = [];
      /* eslint vue/no-side-effects-in-computed-properties: 0 */
      if (this.selectedPointIndices.length) {
        this.selectedPointIndices.forEach((val) => {
          const Xvec = [1, this.data[val][xName]];
          const yvec = this.data[val][yName];
          X.push(Xvec);
          y.push(yvec);
        });
      } else {
        this.data.forEach((val, idx) => {
          const Xvec = [1, this.data[idx][xName]];
          const yvec = this.data[idx][yName];
          X.push(Xvec);
          y.push(yvec);
        });
      }

      return { X, y };
    },
  },
  watch: {
    'axes.scatter.yName': function replot() {
      this.plotMetric();
    },
  },
  created() {
    this.data.forEach((val, idx) => {
      this.data[idx].age = val.metrics.Age;
    });
  },
  methods: {
    handleResize() {
      this.resetRange(this.axes.scatter);
      this.scatterPoints(this.axes.scatter.ax, this.axes.scatter.data,
        this.axes.scatter.xName, this.axes.scatter.yName,
        (p) => {
          this.barSelectorOn(this.axes.braindr.ax, p);
          this.barSelectorOn(this.axes.mc.ax, p);
          this.barSelectorOn(this.axes.mriqc.ax, p);
        },
        (p) => {
          this.barSelectorOff(this.axes.braindr.ax, p);
          this.barSelectorOff(this.axes.mc.ax, p);
          this.barSelectorOff(this.axes.mriqc.ax, p);
        });

      this.resetRange(this.axes.braindr);
      this.barGraph(this.axes.braindr.ax, this.axes.braindr.data,
        this.axes.braindr.xName, this.axes.braindr.yName,
        this.axes.braindr.xMin, this.axes.braindr.xMax,
        this.axes.braindr.binSize,
        (p) => {
          this.pointSelectorOn(this.axes.scatter.ax, this.axes.braindr.mName, p);
        },
        (p) => {
          this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
        });

      this.resetRange(this.axes.mc);
      this.barGraph(this.axes.mc.ax, this.axes.mc.data,
        this.axes.mc.xName, this.axes.mc.yName,
        this.axes.mc.xMin, this.axes.mc.xMax, this.axes.mc.binSize,
        (p) => {
          this.pointSelectorOn(this.axes.scatter.ax, this.axes.mc.mName, p);
        },
        (p) => {
          this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
        });

      this.resetRange(this.axes.mriqc);
      this.barGraph(this.axes.mriqc.ax, this.axes.mriqc.data,
        this.axes.mriqc.xName, this.axes.mriqc.yName,
        this.axes.mriqc.xMin, this.axes.mriqc.xMax, this.axes.mriqc.binSize,
        (p) => {
          this.pointSelectorOn(this.axes.scatter.ax, this.axes.mriqc.mName, p);
        },
        (p) => {
          this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
        });
    },
    resetRange(axD) {
      const width = this.$refs[axD.ref].clientWidth - axD.ax.margin.left - axD.ax.margin.right;
      axD.ax.xScale.range([0, width]);
      axD.ax.width = width;
      this.resizeAxes(axD.ax);
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

      const xAxis = d3.axisBottom(xScale); // axis object
      const yAxis = d3.axisLeft(yScale);

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
        .attr('y', -50)
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
    scatterPoints(ax, data, xName, yName, hoverOnCallback, hoverOffCallback) {
      const xValue = function (d) {
        return d[xName];
      };
      const yValue = function (d) {
        return d[yName];
      };

      const self = this;

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
      // update data
      ax.svg
        .selectAll('.dot')
        .attr('cx', d => ax.xScale(xValue(d)))
        .transition()
        .duration(1000)
        .attr('cy', d => ax.yScale(yValue(d)));

      // events: when you highlight a dot, highlight the corresponding histogram bar
      ax.svg
        .selectAll('.dot')
        .on('mouseover', function setColor(d, i) {
          d3.select(this).style('fill', () => highlightOnColor);
          hoverOnCallback(d, i);
        })
        .on('mouseout', function setColor(d, i) {
          // ax.svg.selectAll('.dot').style('fill', highlightOffColor);
          let color = highlightOffColor;
          if (self.selectedPointIndices.indexOf(i) >= 0) {
            color = brushOnColor;
          }
          d3.select(this).style('fill', color);
          hoverOffCallback(d, i);
        })
        .on('click', function setClick(d, i) {
          let color = clickColor;
          let swidth = 3;
          if (!self.clickPointIdx) {
            self.clickPointIdx = i;
          } else if (self.clickPointIdx !== i) {
            ax.svg.selectAll('.dot').each(function unSet(dd, ii) {
              if (ii === self.clickPointIdx) {
                // fix the color
                let color2 = 'lightgray'; // highlightOffColor;
                if (self.selectedPointIndices.indexOf(ii) >= 0) {
                  color2 = brushOnColor;
                }
                d3.select(this).style('stroke', color2);
                d3.select(this).style('stroke-width', 1);
              }
            });
            self.clickPointIdx = i;
          } else {
            color = 'lightgray'; // highlightOffColor;
            swidth = 1;
            self.clickPointIdx = null;
          }
          d3.select(this).style('stroke', color);
          d3.select(this).style('stroke-width', swidth);
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
    barGraph(ax, data, xName, yName, xMin, xMax,
      binSize, hoverOnCallback, hoverOffCallback) {
      const self = this;
      const xValue = function (d) {
        return d[xName];
      };
      const yValue = function (d) {
        return d[yName];
      };

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
        .attr('height', d => ax.height - ax.yScale(yValue(d)));

      ax.typeSelector = '.bar';
      ax.xName = xName;
      ax.yName = yName;

      ax.svg.selectAll('.bar')
        .data(data)
        .exit()
        .remove('rect');

      ax.svg.selectAll('.bar')
        .on('mouseover', function setColor(d, i) {
          d3.select(this).style('fill', highlightOnColor);
          hoverOnCallback(d, i);
        })
        .on('mouseout', function setColor(d, i) {
          d3.select(this).style('fill', highlightOffColor);
          hoverOffCallback(d, i);
        });

      /* The brush */
      const brush = d3.brushX()
        .extent([[0, 0], [ax.width, ax.height]])
        .on('brush end', function brushend() {
          d3.selectAll('.brush').each(function clearOthers() {
            if (this.parentNode.parentNode.id !== ax.elem.replace('#', '')) {
              /* eslint no-underscore-dangle: ["error", { "allow": ["__brush"] }] */
              if (this.__brush.selection != null) {
                d3.select(this).call(self.globalBrushes[this.parentNode.parentNode.id].move, null);
              }
            }
          });
          const selection = d3.event.selection;
          if (selection) {
            // selectedIndices = [];
            self.selectedBarMetric = ax.mName;
            const extent = selection.map(ax.xScale.invert);
            ax.svg.selectAll('.bar').each(function highlight(d, i) {
              if ((d.x1 <= extent[1] && d.x1 > extent[0]) ||
                  (d.x0 <= extent[1] && d.x0 > extent[0])) {
                d3.select(this).style('fill', brushOnColor);
                const toadd = self.selectedBarIndices.indexOf(i);
                if (toadd === -1) {
                  self.selectedBarIndices.push(i);
                }

                hoverOnCallback(d, i);
              } else {
                d3.select(this).style('fill', highlightOffColor);
                const toremove = self.selectedBarIndices.indexOf(i);
                if (toremove >= 0) {
                  self.selectedBarIndices.splice(toremove, 1);
                }
                hoverOffCallback(d, i);
              }
            });
          } else {
            // you've undone selection
            ax.svg.selectAll('.bar').each(function highlight(d, i) {
              d3.select(this).style('fill', highlightOffColor);
              self.selectedBarIndices = [];
              self.selectedBarMetric = null;
              hoverOffCallback(d, i);
            });
          }
        })
        .on('end', function brushended() {
          const selection = d3.event.selection;
          if (!selection) {
            ax.svg.selectAll('.bar').each(function highlight(d, i) {
              d3.select(this).style('fill', highlightOffColor);
              self.selectedBarIndices = [];
              self.selectedBarMetric = null;
              hoverOffCallback(d, i);
            });
          }
          self.runModel();
          self.lineGraph();
          self.nComparisons += 1;
        });

      if (!ax.svg.select('.brush').length) {
        ax.svg.append('g')
          .attr('class', 'brush')
          .call(brush);
        /* .call(brush.move, x.range()); */
      }

      self.globalBrushes[ax.elem.replace('#', '')] = brush;
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

      this.lineGraph();
    },
    pointSelectorOn(ax, mName, points) {
      ax.svg.selectAll(ax.typeSelector)
        .each(function getItem(d) {
          if (d[mName] > points.x0 && d[mName] <= points.x1) {
            d3.select(this).style('fill', brushOnColor);
          }
        });
    },
    pointSelectorOff(ax, mName, points) {
      ax.svg.selectAll(ax.typeSelector)
        .each(function getItem(d) {
          if (d[mName] > points.x0 && d[mName] <= points.x1) {
            d3.select(this).style('fill', highlightOffColor);
          }
        });
    },
    barSelectorOn(ax, point) {
      ax.svg.selectAll(ax.typeSelector)
        .each(function getItem(d) {
          if (point[ax.mName] <= d.x1 && point[ax.mName] > d.x0) {
            d3.select(this).style('fill', highlightOnColor);
          }
        });

      d3.select('.images').selectAll('.image')
        .data(point.braindr_images)
        .enter()
        .append('img')
        .attr('class', 'image');

      d3.select('.images').selectAll('.image')
        .attr('src', d => `https://dxugxjm290185.cloudfront.net/braindr/${d}.jpg`);

      d3.select('.images').selectAll('.image')
        .data(point.braindr_images)
        .exit()
        .remove('img');
    },
    barSelectorOff(ax, point) {
      /* ax.svg.selectAll(ax.typeSelector)
        .style('fill', '#6c757d'); */
      const self = this;
      ax.svg.selectAll(ax.typeSelector)
        .each(function getItem(d, i) {
          if (point[ax.mName] <= d.x1 && point[ax.mName] > d.x0) {
            let color = highlightOffColor;
            if (self.selectedBarIndices.indexOf(i) >= 0) {
              if (ax.mName === self.selectedBarMetric) {
                color = brushOnColor;
              }
            }
            d3.select(this).style('fill', color);
          }
        });

      if (self.clickPointIdx == null) {
        d3.select('.images').selectAll('.image')
          .data([])
          .exit()
          .remove('img');
      }
    },
    lineGraph() {
      const ax = this.axes.scatter;
      const model = this.model;
      const linspace = function (start, stop, nsteps) {
        const delta = (stop - start) / (nsteps - 1);
        return d3.range(start, stop + delta, delta).slice(0, nsteps);
      };
      const minD = d3.min(ax.data, ax.ax.xValue);
      const maxD = d3.max(ax.data, ax.ax.xValue);

      const X = linspace(minD, maxD, 100);
      const lineData = _.map(X, (x) => {
        const y = model.coef[0] + (model.coef[1] * x);
        return { x, y };
      });

      const confData = _.map(X, (x) => {
        const y0 = model.t.interval95[0][0] + (model.t.interval95[1][0] * x);
        const y = model.coef[0] + (model.coef[1] * x);
        const y1 = model.t.interval95[0][1] + (model.t.interval95[1][1] * x);
        return { x, y, y0, y1 };
      });


      const line = d3.line()
        .x(function getX(d) { return ax.ax.xScale(d.x); })
        .y(function getY(d) { return ax.ax.yScale(d.y); });

      const confidenceArea = d3.area()
        .x(function getX(d) { return ax.ax.xScale(d.x); })
        .y0(function getY0(d) {
          return ax.ax.yScale(d.y0);
        })
        .y1(function getY1(d) {
          return ax.ax.yScale(d.y1);
        });

      /* eslint no-underscore-dangle: ["error", { "allow": ["__brush", "_groups"] }] */
      if (!ax.ax.svg.select('.fit')._groups[0][0]) {
        ax.ax.svg.append('path')
          .attr('class', 'fit')
          .attr('fill', 'none')
          .attr('stroke', lineColor)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 5);
      }
      if (!ax.ax.svg.select('.fitconf')._groups[0][0]) {
        ax.ax.svg.append('path')
          .attr('class', 'fitconf')
          .attr('fill', confColor)
          .attr('opacity', 0.25);
      }

      ax.ax.svg.select('.fit')
        .datum(lineData)
        .attr('d', line);

      ax.ax.svg.select('.fitconf')
        .datum(confData)
        .attr('d', confidenceArea);
    },
    plotMetric() {
      this.scatterPoints(this.axes.scatter.ax, this.data,
        this.axes.scatter.xName, this.axes.scatter.yName,
        (p) => {
          this.barSelectorOn(this.axes.braindr.ax, p);
          this.barSelectorOn(this.axes.mc.ax, p);
          this.barSelectorOn(this.axes.mriqc.ax, p);
        },
        (p) => {
          this.barSelectorOff(this.axes.braindr.ax, p);
          this.barSelectorOff(this.axes.mc.ax, p);
          this.barSelectorOff(this.axes.mriqc.ax, p);
        });

      this.runModel();
      this.lineGraph();
    },
    runModel() {
      this.model = jStat.models.ols(this.pointArrays.y, this.pointArrays.X);
    },
  },
  mounted() {
    const W = this.$refs.scatter.clientWidth;
    const ax = this.renderAxes('#scatterArea', 400, W);
    this.axes.scatter.ax = ax;

    // console.log(this.data)

    const ax2 = this.renderAxes('#scatterBarArea', 150, this.$refs.braindr.clientWidth);
    this.axes.braindr.ax = ax2;
    const ax3 = this.renderAxes('#scatterBarAreaMc', 150, this.$refs.mc.clientWidth);
    this.axes.mc.ax = ax3;
    const ax4 = this.renderAxes('#scatterBarAreaMriqc', 150, this.$refs.mriqc.clientWidth);
    this.axes.mriqc.ax = ax4;

    const hist = d3.histogram().domain([0, 1]);
    const hist2 = d3.histogram().domain([-5, 5]);

    const histDataBraindr = hist(_.map(this.data, d => d.label_3D_avg));
    this.axes.braindr.data = histDataBraindr;
    this.axes.braindr.ax.mName = this.axes.braindr.mName;
    this.barGraph(ax2, histDataBraindr, 'x0', 'length', 0, 1, 0.1,
      (p) => {
        this.pointSelectorOn(this.axes.scatter.ax, this.axes.braindr.mName, p);
      },
      (p) => {
        this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
      });

    const histDataMc = hist2(_.map(this.data, d => d.mc_rating));
    this.axes.mc.data = histDataMc;
    this.axes.mc.ax.mName = this.axes.mc.mName;
    this.barGraph(ax3, histDataMc, 'x0', 'length', -5, 5, 1,
      (p) => {
        this.pointSelectorOn(this.axes.scatter.ax, this.axes.mc.mName, p);
      },
      (p) => {
        this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
      });

    const histDataMriqc = hist(_.map(this.data, d => d.mriqc_pred_xg));
    this.axes.mriqc.data = histDataMriqc;
    this.axes.mriqc.ax.mName = this.axes.mriqc.mName;
    this.barGraph(ax4, histDataMriqc, 'x0', 'length', 0, 1, 0.1,
      (p) => {
        this.pointSelectorOn(this.axes.scatter.ax, this.axes.mriqc.mName, p);
      },
      (p) => {
        this.pointSelectorOff(this.axes.scatter.ax, this.axes.braindr.mName, p);
      });

    this.scatterPoints(ax, this.data, this.axes.scatter.xName, this.axes.scatter.yName,
      (p) => {
        this.barSelectorOn(this.axes.braindr.ax, p);
        this.barSelectorOn(this.axes.mc.ax, p);
        this.barSelectorOn(this.axes.mriqc.ax, p);
      },
      (p) => {
        this.barSelectorOff(this.axes.braindr.ax, p);
        this.barSelectorOff(this.axes.mc.ax, p);
        this.barSelectorOff(this.axes.mriqc.ax, p);
      });

    this.runModel();
    this.lineGraph();
  },
};
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.dot {
  stroke: lightgray; /*circle border*/
  fill: #6c757d; /*circle color*/
  r: 7; /*circle radius*/
}

.bar {
  stroke: lightgray; /*circle border*/
  fill: #6c757d; /*circle color*/
}

.chart-notes {
  font-size: 0.75em;
}

.image {
  max-width: 150px;
}

h5 {
  font-weight: 300;
}

</style>

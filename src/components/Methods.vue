<template>
  <div class="methods text-justify mb-3">
    <b-container>
      <h2 class="mt-3 mb-3 pt-3"> Methods </h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
        Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
        Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
        Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
        Cras vestibulum tincidunt faucibus.
        Nam maximus id lectus et mollis.
        Maecenas sit amet nibh tincidunt, placerat diam id, placerat massa.
        Nulla dictum ultricies quam vel sagittis. Sed at pharetra lorem.
        Nam massa ligula, consequat sit amet nulla sit amet, tristique ultrices metus.
      </p>

      <div class="row mb-3 pb-3 mt-3 pt-3">
        <img src="../assets/ExampleGoldStandardImages.svg" width="100%"/>
        <div class="col-sm-8 offset-sm-2 text-justify mb-3">
          <strong>Figure 3:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
          Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
          Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
          Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
          Cras vestibulum tincidunt faucibus.
        </div>
      </div>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
        Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
        Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
        Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
        Cras vestibulum tincidunt faucibus.
        Nam maximus id lectus et mollis.
        Maecenas sit amet nibh tincidunt, placerat diam id, placerat massa.
        Nulla dictum ultricies quam vel sagittis. Sed at pharetra lorem.
        Nam massa ligula, consequat sit amet nulla sit amet, tristique ultrices metus.
      </p>
    </b-container>

      <mcdist></mcdist>

    <b-container>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
        Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
        Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
        Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
        Cras vestibulum tincidunt faucibus.
        Nam maximus id lectus et mollis.
        Maecenas sit amet nibh tincidunt, placerat diam id, placerat massa.
        Nulla dictum ultricies quam vel sagittis. Sed at pharetra lorem.
        Nam massa ligula, consequat sit amet nulla sit amet, tristique ultrices metus.
      </p>
    </b-container>

      <bdrdist></bdrdist>

    <b-container>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam a eros sit amet turpis laoreet eleifend sed in nisi.
        Proin facilisis dui non ullamcorper lobortis. Nunc eu eleifend mi.
        Aliquam arcu lectus, ultricies non sodales vitae, ultrices nec ex.
        Proin eros nisl, cursus eu risus ut, iaculis blandit nunc.
        Cras vestibulum tincidunt faucibus.
        Nam maximus id lectus et mollis.
        Maecenas sit amet nibh tincidunt, placerat diam id, placerat massa.
        Nulla dictum ultricies quam vel sagittis. Sed at pharetra lorem.
        Nam massa ligula, consequat sit amet nulla sit amet, tristique ultrices metus.
      </p>

    <xgboost></xgboost>

    </b-container>
  </div>
</template>

<style>
</style>

<script>
import MCDist from './MindcontrolDistribution';
import BDRDist from './BraindrDistribution';
import XGBoost from './XGBoost';

export default {
  name: 'methods',
  data() {
    return {

    };
  },
  methods: {

  },
  mounted() {

  },
  components: {
    mcdist: MCDist,
    bdrdist: BDRDist,
    xgboost: XGBoost,
  },
};
</script>

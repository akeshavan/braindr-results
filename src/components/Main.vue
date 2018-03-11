<template>
  <div class="main">
    <b-container>
      <h1 class="text-justify mt-3 pt-3">{{title}}</h1>
      <p class="lead">
        <span v-for="a in authors" :key="a">
          {{a}},
        </span>
      </p>
    </b-container>

    <abstract></abstract>
    <b-container>
      <hr>
    </b-container>
    <introduction></introduction>
    <results></results>
    <discussion></discussion>
    <methods></methods>
    <br>
    <b-container>
      <hr class="pt-3 pb-3 mt-3">
    </b-container>
    <references></references>

  </div>
</template>
<style>

</style>
<script>

import Abstract from './Abstract';
import Introduction from './Introduction';
import Results from './Results';
import Methods from './Methods';
import Discussion from './Discussion';
import References from './References';


export default {
  name: 'paper',
  data() {
    return {
      title: 'Combining citizen science and deep learning for large scale quality control of MRI data',
      authors: ['Anisha Keshavan', 'Jason Yeatman', 'Ariel Rokem'],
    };
  },
  components: {
    Abstract,
    Introduction,
    Results,
    Methods,
    Discussion,
    References,
  },
};
</script>

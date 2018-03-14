<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="info">

  <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

  <b-navbar-brand href="#">braindr-results</b-navbar-brand>

  <!-- If the viewport is small, the navbar collapses.
      Everything in b-collapse is what gets collapsed.
  -->
  <b-collapse is-nav id="nav_collapse">

    <!--  Here are links to different routes  -->
    <b-navbar-nav>
      <b-nav-item to="/" exact>Home</b-nav-item>
    </b-navbar-nav>

  </b-collapse>
</b-navbar>

<!-- The content is in the router view -->
<div class="router">
  <router-view/>
</div>

  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'intro.js/introjs.css';

Vue.use(BootstrapVue);

export default {
  name: 'App',
};
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0px;
  }

  .router {
    margin-top: 20px;
  }
</style>

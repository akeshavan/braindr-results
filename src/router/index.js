import Vue from 'vue';
import Router from 'vue-router';
import Main0 from '@/components/Main0';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main0',
      component: Main0,
    },
  ],
});

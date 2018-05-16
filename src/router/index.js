import Vue from 'vue';
import Router from 'vue-router';
import Main0 from '@/components/Main0';

Vue.use(Router);

export default new Router({
  scrollBehavior: function sB(to) {
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  },
  routes: [
    { path: '*', redirect: '/' },
    {
      path: '/',
      name: 'Main0',
      component: Main0,
    },
  ],
});

/*global __VERSION__*/
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './global.css';
import './customIcons';
import App from './App.svelte';

const hostElement = document.querySelector('#covidcast-classic') || document.body;

const app = new App({
  target: hostElement,
});

console.log('running version:', __VERSION__);
window.COVIDCAST_CLASSIC_VERSION = __VERSION__;

export default app;

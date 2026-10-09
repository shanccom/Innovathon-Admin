import './style.css';
import { initRouter } from './router.js';

const app = document.querySelector('#app');
if (app) {
  initRouter(app);
}

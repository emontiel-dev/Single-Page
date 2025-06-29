// src/app.js
import { initRouter } from './router.js';
import { initNavbar } from './modulos/interfaz/navbar.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initRouter();
});

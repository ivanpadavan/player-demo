import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import './spatial-navigation/geometry-polyfill.js';
import './spatial-navigation/spatial-navigation-polyfill.js';

const resize = () => document.querySelector('html')!.style.fontSize=window.innerWidth/80+'px';
window.addEventListener('resize', resize);
resize();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

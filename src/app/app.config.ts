import {APP_INITIALIZER, ApplicationConfig, inject} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { Auth } from "./misc/auth";
import { PlaybackUrls } from "./misc/playback-urls";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";

const initializerFactory = () => {
  const auth = inject(Auth)
  const playbackUrls = inject(PlaybackUrls)
  return async () => {
    await auth.auth();
    await playbackUrls.init();
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: APP_INITIALIZER, useFactory: initializerFactory, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ]
};

import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class Settings {
  result: { type: 'mse' | 'webos', drm: 'playready' | 'widevine' | 'nodrm' }  = { type: 'mse', drm: 'widevine' };
}

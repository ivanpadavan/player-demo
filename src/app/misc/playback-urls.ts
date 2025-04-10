import {inject, Injectable} from '@angular/core';
import {Auth, physicalDeviceId} from "./auth";
import {WaterBase} from "@kion/waterbase";

@Injectable({ providedIn: 'root' })
export class PlaybackUrls {
  private auth = inject(Auth);

  async init() {
    const wb = new WaterBase()
    wb.init({
      deviceModel: 'PC_Widevine_v3',
      token: '588d6bd0fc5c1f12a1dbb977f5961d14c9a182ae',
      os: 'SmartTV_Samsung',
      appVersion: '0.0.1',
      deviceId: physicalDeviceId,
      apiUrl: 'https://services.kion.ru/waterbase-staging'
    });
    await wb.fetchConfig(true);
    try {
      const urlsString = wb.getValue('demo_playback_urls');
      if (typeof urlsString === 'string') {
        this.urls = JSON.parse(urlsString);
        this.urls.forEach((v) => {
          if (!v.mtsDrm) {
            return;
          }
          if (!v.widevine) {
            v.widevine = this.auth.widevine;
          }
        })
      }
    } catch (e) {
      location.reload();
    }
  }

  lastSelectedIndex = 0;
  urls: { title: string, url: string, playready?: string, widevine?: string, mtsDrm?: boolean }[] = [];
}

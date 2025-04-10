import { inject, Injectable } from '@angular/core';
import { firstValueFrom, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";

declare const process: { env: any };

export const physicalDeviceId = process.env.DEVICE_ID;
const deviceModel = 'SmartTV_Samsung_Widevine';
const login = process.env.LOGIN;
const password = process.env.PASSWORD;

const drmUrls = {
  widevine: {
    local: '/widevine/',
    prod: 'https://htv-wv.mts.ru:443/'
  },
  playready: {
    local: '/playready',
    prod: 'https://htv-prls.mts.ru:443/PlayReady/rightsmanager.asmx'
  }
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  playready = '';
  widevine = '';

  private http = inject(HttpClient);

  auth(): Promise<unknown> {
    const query$ = this.http.get<{ epghttpsurl: string }>('https://htv-eds.mts.ru/EDS/jsp/AuthenticationURL?Action=Login&UserID=mts_guest&return_type=2').pipe(
      switchMap(({ epghttpsurl }) => this.http.post(epghttpsurl + '/VSP/V3/Login', {
        deviceModel,
      }).pipe(
        switchMap(() => this.http.post(epghttpsurl + '/VSP/V3/Authenticate', {
          "authenticateBasic": {
            "userID": login,
            "userType": "1",
            "authType": "0",
            "clientPasswd": password,
            "lang": "RU",
            "needPosterTypes": ["0", "1", "2", "3", "4", "5", "6", "7", "9", "10", "12"]
          },
          "authenticateDevice": {
            "physicalDeviceID": physicalDeviceId,
            "terminalID": physicalDeviceId,
            deviceModel,
            "CADeviceInfos": [
              {
                "CADeviceType": 7,
                "CADeviceID": `${login}.7.${physicalDeviceId}`
              }
            ]
          },
          "authenticateTolerant": {
            "areaCode": "1",
            subnetID: "703",
            "bossID": "TVHouse"
          }
        }))
      ))
    )

    return firstValueFrom(query$).then((r: any) => {
      const flavour = location.href.includes('localhost') ? 'local' : 'prod';
      this.playready = `${drmUrls.playready[flavour]}?deviceId=${r.VUID}`;
      this.widevine = `${drmUrls.widevine[flavour]}?deviceId=${r.VUID}`;
    });
  }
}

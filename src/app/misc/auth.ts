import { inject, Injectable } from '@angular/core';
import { firstValueFrom, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";

declare const process: { env: any };

export const physicalDeviceId = process.env.DEVICE_ID;
const deviceModel = 'SmartTV_Samsung_Widevine';
const login = process.env.LOGIN;
const password = process.env.PASSWORD;

const drmUrls = {
  widevine: '/widevine/',
  playready: '/playready/',
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
      this.playready = `${drmUrls.playready}?deviceId=${r.VUID}`;
      this.widevine = `${drmUrls.widevine}?deviceId=${r.VUID}`;
    });
  }
}

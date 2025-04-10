/// <reference types="webostvjs" />
import { firstValueFrom, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

// @ts-ignore
const agent = window["agent"] = new window.webOSDev.drmAgent('playready');
const methodsToPromisify = ['load', 'unload', 'isLoaded', 'getRightsError', 'sendDrmMessage'];
for (const method of methodsToPromisify) {
  const initialMethod = agent[method].bind(agent);
  agent[method] = function (arg = {}) {
    return new Promise((onSuccess, onFailure) => {
      initialMethod({onSuccess, onFailure, ...arg});
    });
  };
}

let clientId: string;

const urlToMsg = (url: string) => `<?xml version=\\"1.0\\" encoding=\\"utf-8\\"?>\\n        <PlayReadyInitiator xmlns=\\"http://schemas.microsoft.com/DRM/2007/03/protocols/\\">\\n            <LicenseServerUriOverride>\\n                <LA_URL>${url}</LA_URL>\\n            </LicenseServerUriOverride>\\n        </PlayReadyInitiator>`

export async function init(videoEl: HTMLVideoElement) {
  videoEl.addEventListener('canplay', () => {
    videoEl.play();
  });
  return {
    load: async (url: string, drmurlObject?: Record<string, string>) => {
      const drmurl = drmurlObject ? Object.values(drmurlObject)[0] : drmurlObject;
      // await agent.unload().catch();
      if (drmurl) {
        clientId = (await agent.load()).clientId;
        await agent.sendDrmMessage({msg: urlToMsg(drmurl)});
      }
      if (videoEl.firstChild) videoEl.removeChild(videoEl.firstChild);
      const source = document.createElement('source');
      const options = {
        option: {}
      };
      const mediaOptions = encodeURI(JSON.stringify(options));
      const isHlsUrl = url && url.toLowerCase().indexOf('.m3u8') >= 0;
      const isMP4Url = url && url.toLowerCase().indexOf('.mp4') === url.length - 4;
      const isDash = url && url.toLowerCase().indexOf('.mpd') >= 0;
      const mediaType = isHlsUrl ? 'application/x-mpegURL' : isMP4Url ? 'video/mp4' : isDash ? 'application/dash+xml' : null;
      source.setAttribute('type', `${mediaType};mediaOption=${mediaOptions}`);
      source.setAttribute('src', url);
      videoEl.appendChild(source);
      videoEl.load();
    },
    unload() {
      while (videoEl.firstChild) {
        videoEl.firstChild.remove();
      }
      videoEl.load();
    }
  };
}

window.addEventListener('beforeunload', () => agent.unload());

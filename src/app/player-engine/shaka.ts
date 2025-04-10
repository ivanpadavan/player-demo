// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled.debug';

export async function init(videoEl: HTMLVideoElement) {
  console.log(shaka.Player.version);
  videoEl.addEventListener('canplay', () => videoEl.play());
  console.log(shaka);
  shaka.log.setLevel(shaka.log.Level.V1);
  shaka.polyfill.installAll();
  // @ts-ignore
  const player = window['player'] = new shaka.Player();

  player.addEventListener('error', (event: Event) => {
    // @ts-ignore
    console.log(event);
  });

  player.configure({
    streaming: {
      bufferingGoal: 10,
      rebufferingGoal: 3,
      stallEnabled: false,
      bufferBehind: 5,
    },
    manifest: {
      dash: {
        ignoreMinBufferTime: true
      }
    }
  });
  player.attach(videoEl, false);

  return {
    load(url: string, drm: Record<string, string> = {}) {
      player.configure('drm.servers', drm);
      player.load(url);
    },
    unload() {
      player.unload();
      player.detach();
    }
  };
}

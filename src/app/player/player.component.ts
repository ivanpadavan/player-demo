import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { PlaybackUrls } from "../misc/playback-urls";
import { init as initShaka } from "../player-engine/shaka";
import { init as initWebos } from "../player-engine/webos";
import { AsyncPipe, Location, NgIf } from "@angular/common";
import { TimePipe } from "./time.pipe";
import { AutofocusDirective } from '../misc/autofocus.directive';
import {
  BehaviorSubject,
  concat,
  distinctUntilChanged,
  finalize,
  firstValueFrom,
  fromEvent,
  map,
  Observable,
  of,
  race,
  share,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  timer
} from "rxjs";
import { createTween, tweenFunctions } from "../misc/create-tween";
import { BackHandler } from "../misc/back-handler";
import { Settings } from "../misc/settings";

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    TimePipe, AutofocusDirective, AsyncPipe, NgIf
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit {
  @ViewChild('video', {static: true})
  videoRef!: ElementRef<HTMLVideoElement>;
  info = '';

  private player!: { load: () => void, unload: () => void }

  private settings = inject(Settings).result;
  private destroyRef = inject(DestroyRef);

  get video(): HTMLVideoElement {
    return this.videoRef.nativeElement;
  }

  showInfoPanel = false;

  playbackInfo = (() => {
    const id: string = inject(ActivatedRoute).snapshot!.paramMap!.get('id') || '0';
    return inject(PlaybackUrls).urls[+id];
  })();

  timeline$: Observable<string> = of('0%');
  seekTimeline$: Observable<string> = of('0%');

  private showControlsSubject$ = new BehaviorSubject<boolean | number>(5000);
  showControls$ = this.showControlsSubject$.pipe(
    switchMap((value) => {
      if (typeof value === 'boolean') {
        return of(value)
      }
      return concat(
        of(true),
        timer(value).pipe(map(() => false))
      )
    }),
    distinctUntilChanged(),
  );

  get controlsShown() {
    return document.activeElement !== document.body;
  }

  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    this.player = await this.initPlayer();
    this.player.load();
    this.destroyRef.onDestroy(() => this.player.unload());
    this.initInfo(this.videoRef.nativeElement);

    this.timeline$ = fromEvent(this.video, 'timeupdate').pipe(
      map(() => this.video.currentTime / this.video.duration * 100 + '%'),
      shareReplay({bufferSize: 1, refCount: true})
    );
    this.seekTimeline$ = this.timeline$;
  }

  @HostListener(BackHandler.ev, ['$event'])
  goBack(event: CustomEvent): void {
    if (this.showInfoPanel) {
      this.showInfoPanel = false;
      event.preventDefault();
      return;
    }
    if (this.controlsShown) {
      this.showControlsSubject$.next(false);
      event.preventDefault();
      return;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.showInfoPanel === true) {
      return;
    }
    this.showControlsSubject$.next(5000);
    this.cdr.detectChanges();
    if (!this.controlsShown) {
      event.preventDefault();
      document.querySelector<HTMLElement>('.play a')!.focus();
    }
  }

  maybeSeek(event: KeyboardEvent) {
    if (event.keyCode === 37) {
      this.startSeek(-1, event);
    } else if (event.keyCode === 39) {
      this.startSeek(1, event);
    }
  }

  private startSeek(direction: -1 | 1, event: KeyboardEvent) {
    event.preventDefault();
    if (this.seekTimeline$ !== this.timeline$) {
      return;
    }
    const finish$ = firstValueFrom(fromEvent(event.target as HTMLElement, 'keyup').pipe(
      map(() => 'finish' as const),
      share()
    ));

    let lastValue = '';
    this.seekTimeline$ = concat(
      of(this.video.currentTime / this.video.duration * 100 + '%'),
      race(timer(300), finish$).pipe(
        switchMap((value) => {
          if (value === 'finish') {
            return of((this.video.currentTime + 10 * direction) / this.video.duration * 100 + '%');
          } else {
            const start = this.video.currentTime / this.video.duration * 100;
            const end = direction === 1 ? 100 : 0;
            const duration = Math.abs((start - end) * 20);
            return createTween(
              tweenFunctions.easeInSine,
              start,
              end,
              duration,
            ).pipe(
              map((v => v + '%')),
              takeUntil(finish$),
            )
          }
        })
      )
    ).pipe(
      tap((v) => lastValue = v),
      finalize(async () => {
        const time = parseFloat(lastValue) / 100 * this.video.duration;
        this.video.currentTime = time;
        await firstValueFrom(fromEvent(this.video, 'timeupdate'));
        this.seekTimeline$ = this.timeline$;
      })
    )
  }

  back(): void {
    this.location.back();
  }

  replay() {
    this.player.load();
  }

  showInfo() {
    this.showInfoPanel = true;
    this.showControlsSubject$.next(false);
  }

  playPause() {
    this.video.paused
      ? this.video.play()
      : this.video.pause();
  }

  private async initPlayer() {
    const player = await initShaka(this.video);
    const drms = {
      playready: this.playbackInfo.playready ? { 'com.microsoft.playready': this.playbackInfo.playready } : undefined,
      widevine: this.playbackInfo.widevine ? { 'com.widevine.alpha': this.playbackInfo.widevine } : undefined,
      nodrm: {},
    }
    return {
      load: () => player.load(this.playbackInfo.url, drms[this.settings.drm]),
      unload: () => player.unload()
    };
  }

  private initInfo(video: HTMLVideoElement) {
    const videoEventNames = [
      'abort',
      'canplay',
      'canplaythrough',
      'durationchange',
      'emptied',
      'ended',
      'error',
      'loadeddata',
      'loadedmetadata',
      'loadstart',
      'pause',
      'play',
      'playing',
      'ratechange',
      'seeked',
      'seeking',
      'sourceerror',
      'stalled',
      'suspend',
      'resize',
      'encrypted'
    ];
    const events: object[] = [];
    var cb = (event: Event & { target: HTMLVideoElement }) => {
      events.unshift({
        timestamp: Date.now(),
        eventName: event.type,
        currentTime: event.target.currentTime,
        ...(event.target.error ? {error: event.target.error} : {}),
      });
      this.info = JSON.stringify(events).slice(1, -1).replaceAll('},{', '}\n{');
    };
    videoEventNames.forEach((eventName) => {
      video.addEventListener(eventName, cb as unknown as any);
      this.destroyRef.onDestroy(() => video.removeEventListener(eventName, cb as unknown as any));
    });
  }
}

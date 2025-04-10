import { inject, Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { fromEvent } from "rxjs";

@Injectable({providedIn: 'root'})
export class BackHandler {
  static ev = 'goback'

  private location = inject(Location);

  constructor() {
    fromEvent<KeyboardEvent>(document, 'keydown', {
      capture: true,
    }).subscribe((ev) => {
      if (ev.keyCode === 27 || ev.keyCode === 461) {
        const shouldGoBack = ev.target!.dispatchEvent(new CustomEvent(BackHandler.ev, {
          bubbles: true,
          cancelable: true
        }));
        if (shouldGoBack) {
          this.location.back();
        }
        ev.stopPropagation();
      }
    })
  }
}

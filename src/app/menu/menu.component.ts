import { Component, HostListener, inject } from '@angular/core';
import { PlaybackUrls } from "../misc/playback-urls";
import { CommonModule, NgFor } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { AutofocusDirective } from "../misc/autofocus.directive";
import { BackHandler } from "../misc/back-handler";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { startWith, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Settings } from "../misc/settings";

class Alloc {
  static alloc = 0;
  static memoryAllocVariants = [0, 3, 10, 30];
  static setAlloc(alloc: number) {
    const diff = alloc - this.alloc;
    this.alloc = this.alloc = alloc;
    const method = Math.sign(diff) === 1 ? 'push' : 'unshift' as const;
    for (let i = 0; i < Math.abs(alloc) * 1e6; i++) {
      this.allocArr[method]('qwe');
    }
  }
  private static allocArr = ['qwe'];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, AutofocusDirective, NgFor],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  settings = inject(Settings);
  playbackUrls = inject(PlaybackUrls);
  alloc = Alloc;

  @HostListener(BackHandler.ev, ['$event'])
  goBack(event: CustomEvent): void {
    event.preventDefault();
    document.close();
  }
}

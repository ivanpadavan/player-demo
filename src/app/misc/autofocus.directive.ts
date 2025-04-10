import { Directive, effect, ElementRef, input } from '@angular/core';

@Directive({
  selector: '[autofocus]',
  standalone: true
})
export class AutofocusDirective {
  autofocus = input<boolean>();

  constructor(private elementRef: ElementRef<HTMLElement>) {
    effect(() => {
      if (this.autofocus()) {
        this.elementRef.nativeElement.focus();
      }
    });
  }
}

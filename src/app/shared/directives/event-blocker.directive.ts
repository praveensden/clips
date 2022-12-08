import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-event-blocker]',
})
export class EventBlockerDirective {
  constructor() {}

  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleListener(event: Event) {
    event.preventDefault();
  }
}

import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent implements OnInit {
  transform = '';

  ngOnInit() {
    const loop = () => {
      requestAnimationFrame(() => {
        const rad = new Date().getMilliseconds() / 1000 * 2 * Math.PI;
        this.transform = `rotate(${rad}rad)`;
        loop();
      })
    }
    loop();
  }
}

import { Pipe, PipeTransform } from '@angular/core';

const toDigit = (part: number) => Math.floor(part).toString().padStart(2, '0');

@Pipe({
  name: 'time',
  standalone: true
})
export class TimePipe implements PipeTransform {

  transform(time: unknown): unknown {
    if (typeof time !== 'number' || isNaN(time)) {
      return '--:--:--';
    }
    const value = Math.floor(time);
    const seconds = value % 60;
    const minutes = Math.floor(value / 60);
    const hours = Math.floor(value / 60 / 60);
    return `${toDigit(hours)}:${toDigit(minutes)}:${toDigit(seconds)}`;
  }

}

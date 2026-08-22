import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const timeParts = value.split(':');
    if (timeParts.length !== 3) return value; // fallback
    return `${timeParts[0]}:${timeParts[1]}`; // HH:mm
  }
}

@Pipe({
  name: 'TimeFormatAmPm',
  standalone: true
})
export class TimeFormatAmPmPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const [h, m] = value.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
}



import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDifference',
  standalone: true
})
export class TimeDifferencePipe implements PipeTransform {

  transform(value: Date | string): string {
      if (!value) return '';
  
      const currentTime = new Date();
      const messageTime = new Date(value);
      const differenceInMs = currentTime.getTime() - messageTime.getTime();
  
      const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
      const differenceInHours = Math.floor(differenceInMinutes / 60);
      const differenceInDays = Math.floor(differenceInHours / 24);
  
      if (differenceInMinutes < 60) {
        return `${differenceInMinutes} min${differenceInMinutes !== 1 ? 's' : ''} ago`;
      } else if (differenceInHours < 24) {
        return `${differenceInHours} hour${differenceInHours !== 1 ? 's' : ''} ago`;
      } else {
        return `${differenceInDays} day${differenceInDays !== 1 ? 's' : ''} ago`;
      }
    }
  }



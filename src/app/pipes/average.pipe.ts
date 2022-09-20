import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'average'
})
export class AveragePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

    if (value.length > 0)
      return (arrAvg(value) / 1000).toFixed(1) ;
    else return 0.0.toFixed(1);
  }

}

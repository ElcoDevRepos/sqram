import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cumulate'
})
export class CumulatePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let total = 0; 
    for (let i of value) {
      total += i
    }

    return (total / 1000).toFixed(1) ;
  }

}

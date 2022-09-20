import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipes'
})
export class PipesPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {

    return (value / 1000).toFixed(1);
  }

}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
})
export class ProgressIndicatorComponent implements OnInit {
  @Input() active: boolean;
  @Input() solved: boolean;
  @Input() skipped: boolean;
  constructor() { }

  ngOnInit() {}

}

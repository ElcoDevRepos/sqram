import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'scramble-word-letter',
  templateUrl: './scramble-word-letter.component.html',
  styleUrls: ['./scramble-word-letter.component.scss'],
})
export class ScrambleWordLetterComponent implements OnInit {
  @Input() letter: string;
  @Input() locked: boolean;
  @ViewChild('clickableLetter', { read: ElementRef }) clickableLetter: ElementRef;
  @Output() childCreated = new EventEmitter();

  expand;
  wiggle;
  constructor(private animationCtrl: AnimationController) { }

  ngOnInit() {
  
  }

  startWiggle() {
    this.wiggle.play();
  }

  startExpand() {
    this.expand.play();
  }

  ngAfterViewInit() {
    this.expand = this.animationCtrl.create('wiggle-animation')
      .addElement(this.clickableLetter.nativeElement).duration(250)
      .keyframes([
        { offset: 0, transform: 'scale(1)'},
        { offset: 0.5, transform: 'scale(1.25)' },
        { offset: 1, transform: 'scale(1)'}
      ]);

      this.wiggle = this.animationCtrl.create('wiggle-animation')
      .addElement(this.clickableLetter.nativeElement).duration(250).keyframes([
        { offset: 0, transform: 'translateX(0px)'},
        { offset: 0.33, transform: 'translateX(5px)' },
        { offset: 0.66, transform: 'translateX(-5px)' },
        { offset: 1, transform: 'translateX(0px)' }
      ]);
    this.childCreated.emit(this);
  }
}

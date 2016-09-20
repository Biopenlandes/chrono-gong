import { Injectable } from '@angular/core';
import { Observable }       from 'rxjs/Observable';
import { Subject }          from 'rxjs/Subject';

import { ParamsService } from './params.service';
import { SoundService } from './sound.service';

@Injectable()
export class ChronoService {

  private timers = [];  

  stateObservable = new Subject<boolean>();

  constructor(private paramsService : ParamsService,
              private soundService : SoundService) { }

  private beginCycle(): void
  {
    let eyeDelay = this.minutesToMs(this.paramsService.getGong('eye').delay);
    let pauseDelay = this.minutesToMs(this.paramsService.getGong('pause').delay);
    let restartDelay = this.minutesToMs(this.paramsService.getGong('restart').delay);

    if (pauseDelay > 0) 
    {
      if (eyeDelay > 0)
      {
        let eyeTimersLeft = Math.ceil(pauseDelay / eyeDelay) - 1;
        if (eyeTimersLeft > 0) this.timers.push( this.setIntervalX(() => this.soundService.playSound('eye'), eyeDelay, eyeTimersLeft) );
      }  

      this.timers.push( setTimeout(() => this.soundService.playSound('pause'), pauseDelay) );
      
      // si pas de pause, alors on ne prend pas non plus le restart en compte
      if (restartDelay > 0) 
      {
          this.timers.push( setTimeout(() => this.soundService.playSound('restart'), pauseDelay + restartDelay) );
          this.timers.push( setTimeout( () => this.beginCycle(), pauseDelay+restartDelay) );
      }
      else
      {
         // si pas de restart, alorson arrêt le chrono à la pause
         this.timers.push( setTimeout( () => this.stateObservable.next(false), pauseDelay) );
      }
    }
    // si pas de pause, alors on met les yeux en continue
    else if (eyeDelay > 0) this.timers.push( setInterval( () => this.soundService.playSound('eye') , eyeDelay) );
  }

  start() : void
  {
    this.beginCycle();    
  }  

  stop() : void
  {
    for(var timer of this.timers) 
    {
      clearInterval(timer);
      clearTimeout(timer);
    }
    this.timers = [];
  }

  minutesToMs(time : number) : number
  {
    return time*60*1000;
  }

  setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);

    return intervalID;
  }

}

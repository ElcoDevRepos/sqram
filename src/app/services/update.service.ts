import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(public updates: SwUpdate) {
    if (updates.isEnabled) {
      interval(1000).subscribe(() => {
        updates.checkForUpdate();
      });
    }
  }

  public checkForUpdates(): void {
    this.updates.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        if (event.currentVersion !== event.latestVersion) {
          this.promptUser();
        }
      }
    });
  }

  private promptUser(): void {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { hasValue } from '../empty.util';
import { environment } from '../../../environments/environment';
import { AlertType } from '../alert/alert-type';
import { Router } from '@angular/router';

enum MessageType {
  LOADING = 'loading',
  WARNING = 'warning',
  ERROR = 'error'
}

@Component({
  selector: 'ds-loading',
  styleUrls: ['./loading.component.scss'],
  templateUrl: './loading.component.html'
})
export class LoadingComponent implements OnDestroy, OnInit {

  readonly QUERY_PARAM_RELOAD_COUNT = 'reloadCount';

  @Input() message: string;
  @Input() showMessage = true;

  @Input() showFallbackMessages = environment.loader.showFallbackMessagesByDefault;
  @Input() warningMessage: string;
  @Input() warningMessageDelay = environment.loader.warningMessageDelay;
  @Input() errorMessage: string;
  @Input() errorMessageDelay = environment.loader.errorMessageDelay;
  errorTimeoutWithRetriesDelay = environment.loader.errorMessageDelay;


  @Input() numberOfAutomaticPageReloads = environment.loader.numberOfAutomaticPageReloads || 0;

  /**
   * Show a more compact spinner animation instead of the default one
   */
  @Input() spinner = false;

  readonly MessageType = MessageType;
  messageToShow: MessageType = this.showMessage ? MessageType.LOADING : undefined;

  warningTimeout: any;
  errorTimeout: any;

  pageReloadCount = 0;

  readonly AlertTypeEnum = AlertType;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    // get current page reload count from query parameters
    const queryParams = new URLSearchParams(this.router.url.split('?')[1]);
    const reloadCount = queryParams.get(this.QUERY_PARAM_RELOAD_COUNT);
    let currentUrl = this.router.url.split('?')[0];
    if (hasValue(reloadCount)) {
      this.pageReloadCount = +reloadCount;
      // clear reload count from query parameters
      queryParams.delete(this.QUERY_PARAM_RELOAD_COUNT);
      this.router.navigate([currentUrl], {queryParams: queryParams, skipLocationChange: true});
    }
    this.errorTimeoutWithRetriesDelay = this.errorMessageDelay + this.pageReloadCount * (this.errorMessageDelay - this.warningMessageDelay);

    if (this.showMessage) {
      this.message = this.message || this.translate.instant('loading.default');
    }
    if (this.showFallbackMessages) {
      this.warningMessage = this.warningMessage || this.translate.instant('loading.warning');
      this.errorMessage = this.errorMessage || this.translate.instant('loading.error');
      if (this.warningMessageDelay > 0) {
        this.warningTimeout = setTimeout(() => {
          this.messageToShow = MessageType.WARNING;
          this.changeDetectorRef.detectChanges();
        }, this.warningMessageDelay);
      }
      if (this.errorMessageDelay > 0) {
        this.errorTimeout = setTimeout(() => {
          if (this.pageReloadCount < this.numberOfAutomaticPageReloads) {
            this.pageReloadCount++;
            // add reload count to query parameters, then reload the page
            const queryParamsObj = {};
            queryParamsObj[this.QUERY_PARAM_RELOAD_COUNT] = this.pageReloadCount;
            queryParams.forEach((value, key) => {
              queryParamsObj[key] = value;
            });
            this.router.navigateByUrl('/fake-url', { skipLocationChange: true }).then(() => {
              this.router.navigate([currentUrl], { queryParams: queryParamsObj, queryParamsHandling: 'merge', onSameUrlNavigation: 'reload'});
            });
          } else {
            this.messageToShow = MessageType.ERROR;
            this.changeDetectorRef.detectChanges();
          }
        }, this.errorTimeoutWithRetriesDelay);
      }
    }
  }

  ngOnDestroy() {
    if (hasValue(this.warningTimeout)) {
      clearTimeout(this.warningTimeout);
    }
    if (hasValue(this.errorTimeout)) {
      clearTimeout(this.errorTimeout);
    }
  }
}

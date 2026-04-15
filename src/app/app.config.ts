import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http'; // ADD THIS

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient() // ADD THIS HERE
  ]
};
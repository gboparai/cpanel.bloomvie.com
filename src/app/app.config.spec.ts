import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { ApplicationConfig } from '@angular/core';

describe('appConfig', () => {
  it('should be defined', () => {
    expect(appConfig).toBeTruthy();
  });

  it('should have providers array', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBeTrue();
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});

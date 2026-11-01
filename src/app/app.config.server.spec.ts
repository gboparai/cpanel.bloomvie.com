import { config } from './app.config.server';

describe('app.config.server', () => {
  it('should export an ApplicationConfig', () => {
    expect(config).toBeDefined();
    expect(config.providers).toBeDefined();
    expect(Array.isArray(config.providers)).toBeTrue();
  });

  it('should have merged providers from appConfig and serverConfig', () => {
    expect(config.providers.length).toBeGreaterThan(0);
  });
});

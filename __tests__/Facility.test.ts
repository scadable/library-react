import { describe, it, expect } from 'vitest';
import { Facility } from '../src';

describe('Facility', () => {
  it('should create a facility with a valid API key', () => {
    const facility = new Facility('test-api-key');
    expect(facility.getApiKey()).toBe('test-api-key');
    expect(facility.isValid()).toBe(true);
  });

  it('should throw error for empty API key', () => {
    expect(() => new Facility('')).toThrow('API key must be a non-empty string');
  });

  it('should throw error for non-string API key', () => {
    expect(() => new Facility(null as any)).toThrow('API key must be a non-empty string');
    expect(() => new Facility(undefined as any)).toThrow('API key must be a non-empty string');
    expect(() => new Facility(123 as any)).toThrow('API key must be a non-empty string');
  });

  it('should return true for valid facility', () => {
    const facility = new Facility('valid-key');
    expect(facility.isValid()).toBe(true);
  });
});

/**
 * Signal processing utilities for medical telemetry
 * Includes filtering, peak detection, and frequency analysis
 */

/**
 * Simple moving average filter
 * Smooths signal by averaging over a window
 */
export function movingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 1) return data;

  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  return result;
}

/**
 * Simple high-pass filter to remove DC offset
 * Uses difference equation: y[n] = x[n] - x[n-1] + alpha * y[n-1]
 */
export function highPassFilter(data: number[], alpha: number = 0.95): number[] {
  if (data.length === 0) return [];

  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] - data[i - 1] + alpha * result[i - 1]);
  }
  return result;
}

/**
 * Simple low-pass filter to remove high-frequency noise
 * Uses exponential moving average
 */
export function lowPassFilter(data: number[], alpha: number = 0.1): number[] {
  if (data.length === 0) return [];

  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/**
 * Notch filter for removing power line interference (50/60 Hz)
 * Simple implementation using moving average at the notch frequency
 */
export function notchFilter(data: number[], samplingRate: number, notchFreq: number = 60): number[] {
  const period = Math.round(samplingRate / notchFreq);
  if (period <= 1 || data.length < period) return data;

  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(data[i]);
    } else {
      // Remove the frequency component by subtracting delayed signal
      result.push(data[i] - data[i - period]);
    }
  }
  return result;
}

/**
 * Find peaks in a signal using simple threshold and derivative
 * Returns indices of detected peaks
 */
export function findPeaks(data: number[], threshold: number, minDistance: number = 0): number[] {
  if (data.length < 3) return [];

  const peaks: number[] = [];
  for (let i = 1; i < data.length - 1; i++) {
    // Peak if higher than neighbors and above threshold
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
      // Check minimum distance from last peak
      if (minDistance === 0 || peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
        peaks.push(i);
      }
    }
  }
  return peaks;
}

/**
 * Calculate R-R intervals from R-peak positions
 * Returns intervals in milliseconds
 */
export function calculateRRIntervals(peakIndices: number[], samplingRate: number): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < peakIndices.length; i++) {
    const interval = ((peakIndices[i] - peakIndices[i - 1]) / samplingRate) * 1000;
    intervals.push(interval);
  }
  return intervals;
}

/**
 * Calculate heart rate from R-R intervals
 * Returns BPM (beats per minute)
 */
export function calculateHeartRate(rrIntervals: number[]): number {
  if (rrIntervals.length === 0) return 0;

  // Average R-R interval in milliseconds
  const avgRR = rrIntervals.reduce((sum, interval) => sum + interval, 0) / rrIntervals.length;

  // Convert to BPM
  const bpm = 60000 / avgRR;

  // Clamp to reasonable range
  return Math.max(30, Math.min(250, Math.round(bpm)));
}

/**
 * Simple FFT-based spectral analysis
 * Returns power in specified frequency bands
 * Note: This is a simplified version. For production, consider using a library like fft.js
 */
export function calculateSpectralPower(
  data: number[],
  samplingRate: number,
  frequencyBands: { min: number; max: number }[]
): number[] {
  // For simplicity, we'll use a basic DFT for small windows
  // In production, use FFT library for better performance
  const n = data.length;
  const powers: number[] = [];

  for (const band of frequencyBands) {
    let power = 0;
    const freqStep = samplingRate / n;

    // Calculate power in this frequency band
    for (let k = 0; k < n / 2; k++) {
      const freq = k * freqStep;
      if (freq >= band.min && freq <= band.max) {
        // DFT coefficient
        let real = 0;
        let imag = 0;
        for (let t = 0; t < n; t++) {
          const angle = (-2 * Math.PI * k * t) / n;
          real += data[t] * Math.cos(angle);
          imag += data[t] * Math.sin(angle);
        }
        power += (real * real + imag * imag) / (n * n);
      }
    }
    powers.push(power);
  }

  return powers;
}

/**
 * Normalize data to range [0, 1]
 */
export function normalize(data: number[]): number[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) return data.map(() => 0.5);

  return data.map(val => (val - min) / range);
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(data: number[]): number {
  if (data.length === 0) return 0;

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;

  return Math.sqrt(variance);
}

/**
 * Medical visualization constants and standards
 * Following international medical device standards for ECG and EEG displays
 */

// ECG Standards
export const ECG = {
  // Standard sweep speeds (mm/s)
  SWEEP_SPEEDS: [25, 50] as const,
  DEFAULT_SWEEP_SPEED: 25,

  // Standard gain values (mm/mV)
  GAINS: [5, 10, 20] as const,
  DEFAULT_GAIN: 10,

  // Standard sampling rates (Hz)
  SAMPLING_RATES: [250, 500, 1000] as const,
  DEFAULT_SAMPLING_RATE: 250,

  // Grid specifications (medical standard ECG paper)
  GRID: {
    SMALL_SQUARE_MM: 1,  // 1mm small squares
    LARGE_SQUARE_MM: 5,  // 5mm large squares (5 small squares)
    SMALL_SQUARE_TIME_MS: 40,  // 0.04s at 25mm/s
    LARGE_SQUARE_TIME_MS: 200, // 0.2s at 25mm/s
  },

  // Calibration pulse
  CALIBRATION: {
    AMPLITUDE_MV: 1.0,  // 1mV standard calibration
    DURATION_MS: 200,   // 200ms pulse width
  },

  // Normal heart rate ranges
  HEART_RATE: {
    MIN: 40,
    MAX: 200,
    NORMAL_MIN: 60,
    NORMAL_MAX: 100,
  },

  // Default colors (medical standard - pink grid, red waveform)
  COLORS: {
    BACKGROUND: '#ffffff',
    GRID_MAJOR: '#f4c2c2',
    GRID_MINOR: '#fce7e7',
    WAVEFORM: '#dc2626',
    CALIBRATION: '#dc2626',
    TEXT: '#1f2937',
  },
} as const;

// EEG Standards
export const EEG = {
  // Standard sensitivities (µV/mm)
  SENSITIVITIES: [5, 7, 10, 15, 20, 30, 50, 70, 100] as const,
  DEFAULT_SENSITIVITY: 70,

  // Standard time windows (seconds)
  TIME_WINDOWS: [5, 10, 15, 20, 30, 60] as const,
  DEFAULT_TIME_WINDOW: 10,

  // Standard sampling rate (Hz)
  SAMPLING_RATES: [128, 256, 512, 1024] as const,
  DEFAULT_SAMPLING_RATE: 256,

  // Frequency bands (Hz)
  FREQUENCY_BANDS: {
    DELTA: { min: 0.5, max: 4, label: 'δ (Delta)' },
    THETA: { min: 4, max: 8, label: 'θ (Theta)' },
    ALPHA: { min: 8, max: 13, label: 'α (Alpha)' },
    BETA: { min: 13, max: 30, label: 'β (Beta)' },
    GAMMA: { min: 30, max: 100, label: 'γ (Gamma)' },
  } as const,

  // Standard 10-20 electrode positions
  ELECTRODE_POSITIONS: [
    'Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8',
    'T3', 'C3', 'Cz', 'C4', 'T4',
    'T5', 'P3', 'Pz', 'P4', 'T6',
    'O1', 'O2',
  ] as const,

  // Default colors for channels
  COLORS: {
    BACKGROUND: '#ffffff',
    GRID: '#e5e7eb',
    TEXT: '#1f2937',
    CHANNELS: [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ],
  },

  // Impedance thresholds (kΩ)
  IMPEDANCE: {
    GOOD: 5,
    ACCEPTABLE: 10,
    POOR: 20,
  },
} as const;

// Common performance targets
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  BUFFER_DURATION_S: 10, // Keep 10 seconds of data in memory
} as const;

// Canvas rendering constants
export const CANVAS = {
  DPI_SCALE: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  ANTI_ALIAS: true,
} as const;

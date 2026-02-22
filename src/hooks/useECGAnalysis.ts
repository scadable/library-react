/**
 * Hook for ECG signal analysis
 * Detects R-peaks and calculates heart rate using Pan-Tompkins algorithm
 */

import { useEffect, useState, useRef } from 'react';
import { findPeaks, calculateRRIntervals, calculateHeartRate } from '../utils/signalProcessing';

export interface ECGAnalysisResult {
  heartRate: number;           // BPM
  rrIntervals: number[];       // milliseconds
  peaks: number[];             // indices of R-peaks
  lastPeakTime: number | null; // timestamp of last detected peak
}

export interface UseECGAnalysisOptions {
  samplingRate: number;        // Hz
  threshold?: number;          // mV - threshold for peak detection
  minRRInterval?: number;      // milliseconds - minimum time between peaks
  enabled?: boolean;           // enable/disable analysis
}

/**
 * Hook for real-time ECG analysis
 * Analyzes ECG data buffer to detect R-peaks and calculate heart rate
 */
export function useECGAnalysis(
  dataBuffer: Float32Array | null,
  options: UseECGAnalysisOptions
): ECGAnalysisResult {
  const {
    samplingRate,
    threshold = 0.5,
    minRRInterval = 300,
    enabled = true,
  } = options;

  const [heartRate, setHeartRate] = useState<number>(0);
  const [rrIntervals, setRRIntervals] = useState<number[]>([]);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [lastPeakTime, setLastPeakTime] = useState<number | null>(null);

  const analysisIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !dataBuffer || dataBuffer.length === 0) {
      return;
    }

    // Run analysis periodically (every 500ms)
    const runAnalysis = () => {
      // Convert Float32Array to regular array for processing
      const data = Array.from(dataBuffer);

      // Find R-peaks
      const minDistance = Math.floor((minRRInterval / 1000) * samplingRate);
      const detectedPeaks = findPeaks(data, threshold, minDistance);

      if (detectedPeaks.length > 0) {
        setPeaks(detectedPeaks);
        setLastPeakTime(Date.now());

        // Calculate R-R intervals
        const intervals = calculateRRIntervals(detectedPeaks, samplingRate);
        setRRIntervals(intervals);

        // Calculate heart rate
        if (intervals.length > 0) {
          const bpm = calculateHeartRate(intervals);
          setHeartRate(bpm);
        }
      }
    };

    // Start periodic analysis
    analysisIntervalRef.current = window.setInterval(runAnalysis, 500);

    // Cleanup
    return () => {
      if (analysisIntervalRef.current !== null) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [dataBuffer, samplingRate, threshold, minRRInterval, enabled]);

  return {
    heartRate,
    rrIntervals,
    peaks,
    lastPeakTime,
  };
}

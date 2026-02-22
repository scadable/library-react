/**
 * Hook for EEG spectral analysis
 * Calculates power in different frequency bands (delta, theta, alpha, beta, gamma)
 */

import { useEffect, useState, useRef } from 'react';
import { calculateSpectralPower } from '../utils/signalProcessing';
import { EEG } from '../utils/medicalConstants';

export interface FrequencyBandPower {
  delta: number;  // 0.5-4 Hz
  theta: number;  // 4-8 Hz
  alpha: number;  // 8-13 Hz
  beta: number;   // 13-30 Hz
  gamma: number;  // 30-100 Hz
}

export interface ChannelSpectralData {
  channelName: string;
  bands: FrequencyBandPower;
  dominantBand: keyof FrequencyBandPower;
  totalPower: number;
}

export interface UseEEGSpectralAnalysisOptions {
  samplingRate: number;
  enabled?: boolean;
  updateInterval?: number; // milliseconds
}

/**
 * Hook for real-time EEG spectral analysis
 * Analyzes EEG data to extract power in different frequency bands
 */
export function useEEGSpectralAnalysis(
  channelBuffers: Map<string, Float32Array> | null,
  options: UseEEGSpectralAnalysisOptions
): Map<string, ChannelSpectralData> {
  const { samplingRate, enabled = true, updateInterval = 1000 } = options;

  const [spectralData, setSpectralData] = useState<Map<string, ChannelSpectralData>>(
    new Map()
  );

  const analysisIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !channelBuffers || channelBuffers.size === 0) {
      return;
    }

    // Run spectral analysis periodically
    const runAnalysis = () => {
      const newSpectralData = new Map<string, ChannelSpectralData>();

      channelBuffers.forEach((buffer, channelName) => {
        if (buffer.length === 0) return;

        // Convert Float32Array to regular array
        const data = Array.from(buffer);

        // Define frequency bands
        const bands = [
          EEG.FREQUENCY_BANDS.DELTA,
          EEG.FREQUENCY_BANDS.THETA,
          EEG.FREQUENCY_BANDS.ALPHA,
          EEG.FREQUENCY_BANDS.BETA,
          EEG.FREQUENCY_BANDS.GAMMA,
        ];

        // Calculate power in each band
        const powers = calculateSpectralPower(data, samplingRate, bands);

        const bandPower: FrequencyBandPower = {
          delta: powers[0] || 0,
          theta: powers[1] || 0,
          alpha: powers[2] || 0,
          beta: powers[3] || 0,
          gamma: powers[4] || 0,
        };

        // Calculate total power
        const totalPower = Object.values(bandPower).reduce((sum, p) => sum + p, 0);

        // Find dominant band
        let dominantBand: keyof FrequencyBandPower = 'alpha';
        let maxPower = 0;
        (Object.keys(bandPower) as Array<keyof FrequencyBandPower>).forEach(band => {
          if (bandPower[band] > maxPower) {
            maxPower = bandPower[band];
            dominantBand = band;
          }
        });

        newSpectralData.set(channelName, {
          channelName,
          bands: bandPower,
          dominantBand,
          totalPower,
        });
      });

      setSpectralData(newSpectralData);
    };

    // Start periodic analysis
    analysisIntervalRef.current = window.setInterval(runAnalysis, updateInterval);

    // Cleanup
    return () => {
      if (analysisIntervalRef.current !== null) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [channelBuffers, samplingRate, enabled, updateInterval]);

  return spectralData;
}

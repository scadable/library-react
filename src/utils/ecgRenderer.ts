/**
 * Canvas-based ECG renderer
 * Renders ECG waveform with medical-standard grid and calibration pulse
 */

/* eslint-disable no-undef */
import { ECG, CANVAS } from './medicalConstants';

export interface ECGRendererConfig {
  width: number;
  height: number;
  sweepSpeed: number;        // mm/s
  gain: number;              // mm/mV
  samplingRate: number;      // Hz
  showGrid: boolean;
  showCalibration: boolean;
  backgroundColor: string;
  waveformColor: string;
  gridColor: string;
  bufferDuration: number;    // seconds
}

export class ECGRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ECGRendererConfig;
  private dataBuffer: Float32Array;
  private bufferIndex: number = 0;
  private bufferSize: number;
  private pixelsPerMM: number;
  private lastRenderTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, config: ECGRendererConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.config = config;

    // Calculate buffer size based on duration and sampling rate
    this.bufferSize = Math.ceil(config.bufferDuration * config.samplingRate);
    this.dataBuffer = new Float32Array(this.bufferSize);

    // Calculate pixels per millimeter based on canvas size
    // Assume canvas width represents a specific time duration
    const durationSeconds = config.bufferDuration;
    const durationMM = (durationSeconds * config.sweepSpeed * 1000) / 1000; // sweep speed is mm/s
    this.pixelsPerMM = config.width / durationMM;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    const dpr = CANVAS.DPI_SCALE;

    // Set display size
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;

    // Set actual size in memory (scaled for high DPI)
    this.canvas.width = this.config.width * dpr;
    this.canvas.height = this.config.height * dpr;

    // Scale context to match DPI
    this.ctx.scale(dpr, dpr);

    // Enable anti-aliasing
    this.ctx.imageSmoothingEnabled = CANVAS.ANTI_ALIAS;
  }

  /**
   * Add new data point to the buffer
   */
  public addDataPoint(value: number): void {
    this.dataBuffer[this.bufferIndex] = value;
    this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
  }

  /**
   * Add multiple data points
   */
  public addDataPoints(values: number[]): void {
    values.forEach(value => this.addDataPoint(value));
  }

  /**
   * Clear the data buffer
   */
  public clearBuffer(): void {
    this.dataBuffer.fill(0);
    this.bufferIndex = 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ECGRendererConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupCanvas();
  }

  /**
   * Draw the ECG grid (medical standard 1mm and 5mm squares)
   */
  private drawGrid(): void {
    if (!this.config.showGrid) return;

    const { width, height } = this.config;
    const smallSquare = this.pixelsPerMM * ECG.GRID.SMALL_SQUARE_MM;
    const largeSquare = this.pixelsPerMM * ECG.GRID.LARGE_SQUARE_MM;

    // Draw small squares (1mm - light grid)
    this.ctx.strokeStyle = this.config.gridColor + '40'; // 25% opacity
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= width; x += smallSquare) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += smallSquare) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }

    this.ctx.stroke();

    // Draw large squares (5mm - darker grid)
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= width; x += largeSquare) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += largeSquare) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }

    this.ctx.stroke();
  }

  /**
   * Draw calibration pulse (1mV square wave)
   */
  private drawCalibration(): void {
    if (!this.config.showCalibration) return;

    const { height } = this.config;
    const centerY = height / 2;
    const calHeight = this.pixelsPerMM * this.config.gain * ECG.CALIBRATION.AMPLITUDE_MV;
    const calWidth = (ECG.CALIBRATION.DURATION_MS / 1000) * this.config.sweepSpeed * this.pixelsPerMM;
    const startX = 20;

    this.ctx.strokeStyle = this.config.waveformColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, centerY);
    this.ctx.lineTo(startX, centerY - calHeight);
    this.ctx.lineTo(startX + calWidth, centerY - calHeight);
    this.ctx.lineTo(startX + calWidth, centerY);
    this.ctx.stroke();
  }

  /**
   * Draw the ECG waveform
   */
  private drawWaveform(): void {
    const { width, height } = this.config;
    const centerY = height / 2;

    // Calculate how many pixels per sample
    const pixelsPerSample = (this.config.sweepSpeed * this.pixelsPerMM) / this.config.samplingRate;

    this.ctx.strokeStyle = this.config.waveformColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();

    let started = false;
    for (let i = 0; i < this.bufferSize; i++) {
      const bufferIdx = (this.bufferIndex + i) % this.bufferSize;
      const value = this.dataBuffer[bufferIdx];

      const x = i * pixelsPerSample;
      if (x > width) break;

      // Convert mV to pixels using gain
      const y = centerY - (value * this.config.gain * this.pixelsPerMM);

      if (!started) {
        this.ctx.moveTo(x, y);
        started = true;
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Render a single frame
   */
  public render(): void {
    const { width, height } = this.config;

    // Clear canvas
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // Draw layers
    this.drawGrid();
    this.drawCalibration();
    this.drawWaveform();
  }

  /**
   * Start animation loop
   */
  public startAnimation(): void {
    const animate = (timestamp: number) => {
      // Throttle to target FPS
      const elapsed = timestamp - this.lastRenderTime;
      const targetFrameTime = 1000 / 60; // 60 FPS

      if (elapsed >= targetFrameTime) {
        this.render();
        this.lastRenderTime = timestamp;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation loop
   */
  public stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopAnimation();
    this.clearBuffer();
  }
}

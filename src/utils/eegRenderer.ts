/**
 * Canvas-based EEG renderer
 * Renders multi-channel EEG waveforms with stacked or overlay layout
 */

import { EEG, CANVAS } from './medicalConstants';

export interface EEGChannelData {
  name: string;
  color: string;
  data: Float32Array;
  bufferIndex: number;
}

export interface EEGRendererConfig {
  width: number;
  height: number;
  sensitivity: number;       // µV/mm
  timeWindow: number;        // seconds
  samplingRate: number;      // Hz
  layout: 'stacked' | 'overlay';
  showLabels: boolean;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
}

export class EEGRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: EEGRendererConfig;
  private channels: Map<string, EEGChannelData> = new Map();
  private bufferSize: number;
  private pixelsPerMM: number;
  private channelHeight: number;
  private lastRenderTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, config: EEGRendererConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.config = config;

    // Calculate buffer size
    this.bufferSize = Math.ceil(config.timeWindow * config.samplingRate);

    // Calculate pixels per millimeter
    this.pixelsPerMM = config.width / (config.timeWindow * 25); // 25mm/s standard

    // Calculate channel height for stacked layout
    this.channelHeight = config.height;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    const dpr = CANVAS.DPI_SCALE;

    // Set display size
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;

    // Set actual size in memory
    this.canvas.width = this.config.width * dpr;
    this.canvas.height = this.config.height * dpr;

    // Scale context
    this.ctx.scale(dpr, dpr);

    // Enable anti-aliasing
    this.ctx.imageSmoothingEnabled = CANVAS.ANTI_ALIAS;
  }

  /**
   * Add or update a channel
   */
  public addChannel(name: string, color: string): void {
    if (!this.channels.has(name)) {
      this.channels.set(name, {
        name,
        color,
        data: new Float32Array(this.bufferSize),
        bufferIndex: 0,
      });

      // Recalculate channel height for stacked layout
      if (this.config.layout === 'stacked') {
        this.channelHeight = this.config.height / this.channels.size;
      }
    }
  }

  /**
   * Remove a channel
   */
  public removeChannel(name: string): void {
    this.channels.delete(name);

    // Recalculate channel height
    if (this.config.layout === 'stacked' && this.channels.size > 0) {
      this.channelHeight = this.config.height / this.channels.size;
    }
  }

  /**
   * Add data point to a channel
   */
  public addDataPoint(channelName: string, value: number): void {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    channel.data[channel.bufferIndex] = value;
    channel.bufferIndex = (channel.bufferIndex + 1) % this.bufferSize;
  }

  /**
   * Add multiple data points to a channel
   */
  public addDataPoints(channelName: string, values: number[]): void {
    values.forEach(value => this.addDataPoint(channelName, value));
  }

  /**
   * Clear all channel buffers
   */
  public clearBuffers(): void {
    this.channels.forEach(channel => {
      channel.data.fill(0);
      channel.bufferIndex = 0;
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<EEGRendererConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupCanvas();

    // Recalculate channel height if needed
    if (this.config.layout === 'stacked' && this.channels.size > 0) {
      this.channelHeight = this.config.height / this.channels.size;
    }
  }

  /**
   * Draw background grid
   */
  private drawGrid(): void {
    const { width, height } = this.config;

    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    // Vertical time markers (every second)
    const pixelsPerSecond = width / this.config.timeWindow;
    for (let t = 0; t <= this.config.timeWindow; t++) {
      const x = t * pixelsPerSecond;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    // Horizontal lines for stacked layout
    if (this.config.layout === 'stacked') {
      for (let i = 0; i <= this.channels.size; i++) {
        const y = i * this.channelHeight;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw channel labels
   */
  private drawLabels(): void {
    if (!this.config.showLabels || this.config.layout !== 'stacked') return;

    this.ctx.font = '12px sans-serif';
    this.ctx.fillStyle = this.config.textColor;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    let channelIndex = 0;
    this.channels.forEach(channel => {
      const y = channelIndex * this.channelHeight + this.channelHeight / 2;
      this.ctx.fillStyle = channel.color;
      this.ctx.fillText(channel.name, 10, y);
      channelIndex++;
    });
  }

  /**
   * Draw a single channel waveform
   */
  private drawChannel(channel: EEGChannelData, channelIndex: number): void {
    const { width } = this.config;
    const pixelsPerSample = width / this.bufferSize;

    // Calculate center Y based on layout
    let centerY: number;
    if (this.config.layout === 'stacked') {
      centerY = channelIndex * this.channelHeight + this.channelHeight / 2;
    } else {
      centerY = this.config.height / 2;
    }

    this.ctx.strokeStyle = channel.color;
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();

    let started = false;
    for (let i = 0; i < this.bufferSize; i++) {
      const bufferIdx = (channel.bufferIndex + i) % this.bufferSize;
      const value = channel.data[bufferIdx];

      const x = i * pixelsPerSample;
      if (x > width) break;

      // Convert µV to pixels using sensitivity
      const y = centerY - (value * this.pixelsPerMM) / this.config.sensitivity;

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

    // Draw grid
    this.drawGrid();

    // Draw channels
    let channelIndex = 0;
    this.channels.forEach(channel => {
      this.drawChannel(channel, channelIndex);
      channelIndex++;
    });

    // Draw labels last (on top)
    this.drawLabels();
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
    this.clearBuffers();
    this.channels.clear();
  }
}

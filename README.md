# Scadable

A production-ready React library for consuming real-time telemetry data through WebSocket connections. Built for SCADA systems, IoT dashboards, and industrial monitoring applications.

[![npm version](https://img.shields.io/npm/v/scadable.svg)](https://www.npmjs.com/package/scadable)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 📦 Installation

The library is published to npm and can be installed in any React project:

```bash
npm install scadable
```

**Requirements:**
- React 18.0.0 or higher
- React DOM 18.0.0 or higher

## 🚀 Quick Start

### Option 1: Using the LiveTelemetryLineChart Component (Recommended)

The fastest way to visualize real-time data:

```tsx
import { LiveTelemetryLineChart } from 'scadable';

function App() {
  return (
    <LiveTelemetryLineChart
      apiKey="your-api-key"
      deviceId="your-device-id"
      title="Temperature Monitor"
      xAxisLabel="Time"
      yAxisLabel="Temperature (°C)"
      xDataPath=".timestamp"
      yDataPath=".data.temperature"
      yMin={0}
      yMax={50}
      lineColor="#8884d8"
    />
  );
}
```

### Option 2: Using the useLiveTelemetry Hook

For custom implementations with full control:

```tsx
import { Facility, Device, useLiveTelemetry } from 'scadable';

const facility = new Facility("your-api-key");
const device = new Device(facility, "your-device-id");

function App() {
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  return (
    <div>
      <h1>Status: {isConnected ? 'Connected' : 'Disconnected'}</h1>
      {error && <p>Error: {error}</p>}
      {telemetry && <pre>{JSON.stringify(telemetry, null, 2)}</pre>}
    </div>
  );
}
```

## 🎯 Key Features

- 📊 **Real-Time Visualization**: Live line charts with smooth scrolling data
- 🔌 **WebSocket Integration**: Automatic connection management and reconnection
- ⚛️ **React Hooks**: Simple `useLiveTelemetry` hook for custom implementations
- 🛡️ **TypeScript Support**: Full type safety with comprehensive definitions
- 🎨 **Customizable Charts**: Configurable colors, scales, and dimensions
- 🧪 **Production Ready**: Comprehensive tests and error handling
- 📱 **Framework Agnostic**: Works with Next.js, Create React App, Vite, and more

## 📚 Core API

### Facility

Manages API authentication for WebSocket connections.

```tsx
import { Facility } from 'scadable';

const facility = new Facility("your-api-key");
```

**Methods:**
- `connect(deviceId: string): WebSocket` - Creates a WebSocket connection
- `isValid(): boolean` - Validates the API key

### Device

Manages device connections and message handling.

```tsx
import { Facility, Device } from 'scadable';

const facility = new Facility("your-api-key");
const device = new Device(facility, "device-id");

// Connect to WebSocket
device.connect();

// Subscribe to messages
device.onMessage((data) => console.log(data));

// Handle errors
device.onError((error) => console.error(error));

// Monitor connection status
device.onStatusChange((status) => console.log(status));

// Disconnect when done
device.disconnect();
```

**Methods:**
- `connect()` - Establishes WebSocket connection
- `disconnect()` - Closes WebSocket connection
- `onMessage(handler)` - Subscribe to telemetry messages
- `onError(handler)` - Subscribe to connection errors
- `onStatusChange(handler)` - Subscribe to connection status changes
- `getConnectionStatus()` - Get current connection status
- `isConnected()` - Check if currently connected

### useLiveTelemetry Hook

React hook for consuming real-time telemetry data with automatic lifecycle management.

```tsx
import { useLiveTelemetry } from 'scadable';

const { telemetry, isConnected, error } = useLiveTelemetry(device);
```

**Returns:**
- `telemetry` - Latest telemetry data received
- `isConnected` - Connection status (boolean)
- `error` - Error message if connection fails

### LiveTelemetryLineChart Component

Ready-to-use real-time line chart component.

```tsx
import { LiveTelemetryLineChart } from 'scadable';

<LiveTelemetryLineChart
  apiKey="your-api-key"          // API key for authentication
  deviceId="your-device-id"      // Device ID to connect to
  title="Temperature Monitor"     // Chart title
  xAxisLabel="Time"              // X-axis label
  yAxisLabel="Temperature (°C)"  // Y-axis label
  xDataPath=".timestamp"         // JSON path to X value
  yDataPath=".data.temperature"  // JSON path to Y value
  yMin={0}                       // Minimum Y-axis value
  yMax={50}                      // Maximum Y-axis value
  lineColor="#8884d8"            // Optional: line color
  maxDataPoints={20}             // Optional: max data points
  width={600}                    // Optional: chart width
  height={400}                   // Optional: chart height
/>
```

## 📖 Additional Documentation

- **[LiveTelemetryLineChart Documentation](./docs/LiveTelemetryLineChart.md)** - Complete guide to the chart component
- **[useLiveTelemetry Hook Documentation](./docs/useLiveTelemetry.md)** - Advanced hook usage and patterns

## 🌐 Where to Access

- **NPM Package**: [https://www.npmjs.com/package/scadable](https://www.npmjs.com/package/scadable)
- **GitHub Repository**: [https://github.com/scadable/library-react](https://github.com/scadable/library-react)
- **Live Examples**: Run `npm run storybook` locally to see interactive examples

## 🔧 Integration Examples

### Next.js Integration

```tsx
'use client';

import { LiveTelemetryLineChart } from 'scadable';

export default function DashboardPage() {
  return (
    <LiveTelemetryLineChart
      apiKey={process.env.NEXT_PUBLIC_SCADABLE_API_KEY}
      deviceId="sensor-001"
      title="Temperature Monitor"
      xAxisLabel="Time"
      yAxisLabel="Temperature (°C)"
      xDataPath=".timestamp"
      yDataPath=".data.temperature"
      yMin={0}
      yMax={50}
    />
  );
}
```

### Create React App Integration

```tsx
import { LiveTelemetryLineChart } from 'scadable';

function App() {
  return (
    <div className="App">
      <LiveTelemetryLineChart
        apiKey={process.env.REACT_APP_SCADABLE_API_KEY}
        deviceId="sensor-001"
        title="Temperature Monitor"
        xAxisLabel="Time"
        yAxisLabel="Temperature (°C)"
        xDataPath=".timestamp"
        yDataPath=".data.temperature"
        yMin={0}
        yMax={50}
      />
    </div>
  );
}
```

### Vite Integration

```tsx
import { LiveTelemetryLineChart } from 'scadable';

function App() {
  return (
    <LiveTelemetryLineChart
      apiKey={import.meta.env.VITE_SCADABLE_API_KEY}
      deviceId="sensor-001"
      title="Temperature Monitor"
      xAxisLabel="Time"
      yAxisLabel="Temperature (°C)"
      xDataPath=".timestamp"
      yDataPath=".data.temperature"
      yMin={0}
      yMax={50}
    />
  );
}
```

## 🎨 Common Use Cases

### Multiple Sensors Dashboard

```tsx
function Dashboard() {
  return (
    <div>
      <LiveTelemetryLineChart
        apiKey="your-api-key"
        deviceId="temp-sensor-1"
        title="Temperature Sensor 1"
        xAxisLabel="Time"
        yAxisLabel="°C"
        xDataPath=".timestamp"
        yDataPath=".data.temperature"
        yMin={0}
        yMax={50}
        lineColor="#ef4444"
      />
      <LiveTelemetryLineChart
        apiKey="your-api-key"
        deviceId="pressure-sensor-1"
        title="Pressure Sensor 1"
        xAxisLabel="Time"
        yAxisLabel="PSI"
        xDataPath=".timestamp"
        yDataPath=".data.pressure"
        yMin={0}
        yMax={150}
        lineColor="#22c55e"
      />
    </div>
  );
}
```

### Custom UI with Hook

```tsx
function CustomTelemetryDisplay() {
  const facility = new Facility("your-api-key");
  const device = new Device(facility, "your-device-id");
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  return (
    <div className="custom-display">
      <div className="status-bar">
        <span className={isConnected ? 'connected' : 'disconnected'}>
          {isConnected ? '🟢 Live' : '🔴 Offline'}
        </span>
      </div>
      {error && <div className="error">{error}</div>}
      {telemetry && (
        <div className="telemetry-data">
          <h2>Temperature: {telemetry.data?.temperature}°C</h2>
          <p>Last Updated: {telemetry.timestamp}</p>
        </div>
      )}
    </div>
  );
}
```

## 🛠️ Troubleshooting

### Connection Issues

If you're experiencing connection problems:

1. **Verify API Key**: Ensure your API key is valid
2. **Check Device ID**: Confirm the device ID exists in your system
3. **Network**: Verify WebSocket connections aren't blocked by firewall
4. **Browser Console**: Check for error messages in the developer console

### Data Not Displaying

1. **Verify JSON Paths**: Ensure `xDataPath` and `yDataPath` match your data structure
2. **Check Y-axis Range**: Make sure `yMin` and `yMax` encompass your data values
3. **Inspect WebSocket Messages**: Use browser DevTools to inspect WebSocket traffic

### TypeScript Errors

Ensure you have the latest type definitions:

```bash
npm install --save-dev @types/react @types/react-dom
```

---

# Developer Documentation

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v8 or higher
- **Git**: Latest version

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/scadable/library-react.git
   cd library-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Storybook** (interactive development environment):
   ```bash
   npm run storybook
   ```
   This opens at `http://localhost:6006` with live component examples.

4. **Run tests**:
   ```bash
   npm run test        # Watch mode
   npm run test:stories:ci  # CI mode
   ```

5. **Build the library**:
   ```bash
   npm run build
   ```

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│              User's React Application                    │
│       (Next.js / Create React App / Vite)               │
└────────────────────┬────────────────────────────────────┘
                     │ npm install scadable
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Scadable React Library                         │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Components   │  │   Hooks    │  │  Core Classes  │  │
│  │              │  │            │  │                │  │
│  │ • LiveChart  │  │ • useLive  │  │ • Facility     │  │
│  │              │  │   Telemetry│  │ • Device       │  │
│  └──────┬───────┘  └─────┬──────┘  └────────┬───────┘  │
│         │                │                   │          │
│         └────────────────┴───────────────────┘          │
│                          │                              │
│                 ┌────────▼─────────┐                    │
│                 │   WebSocket      │                    │
│                 │   Connection     │                    │
│                 └────────┬─────────┘                    │
└──────────────────────────┼──────────────────────────────┘
                           │ wss://
                           ▼
                ┌──────────────────────┐
                │  Scadable Backend    │
                │  WebSocket Server    │
                └──────────────────────┘
```

### Directory Structure

```
library-react/
├── src/
│   ├── core/                        # Core business logic
│   │   ├── Facility.ts             # API key & authentication
│   │   ├── Device.ts               # WebSocket connection management
│   │   └── types.ts                # TypeScript definitions
│   │
│   ├── hooks/                       # React hooks
│   │   └── useLiveTelemetry.ts     # Main telemetry hook
│   │
│   ├── components/                  # React components
│   │   ├── LiveTelemetryLineChart.tsx
│   │   ├── LiveTelemetryLineChart.stories.tsx
│   │   └── TelemetryDisplay.tsx
│   │
│   ├── utils/                       # Utilities
│   │   ├── jsonPath.ts             # JSON path extraction
│   │   └── parseMessage.ts         # Message parsing
│   │
│   └── index.ts                    # Public API exports
│
├── __tests__/                       # Test files
├── docs/                            # Component documentation
├── .storybook/                      # Storybook config
├── .github/workflows/               # CI/CD pipelines
├── dist/                            # Build output (generated)
├── package.json
├── vite.config.ts                  # Build configuration
└── tsconfig.json                   # TypeScript config
```

### Component Flow

```
LiveTelemetryLineChart
    ↓
useLiveTelemetry Hook
    ↓
Device Class (WebSocket management)
    ↓
Facility Class (Authentication)
    ↓
WebSocket Connection
    ↓
Backend Server
```

### Data Flow

```
1. User creates component with apiKey + deviceId
   ↓
2. Facility validates API key
   ↓
3. Device establishes WebSocket connection
   ↓
4. useLiveTelemetry hook:
   • Connects on mount
   • Subscribes to messages
   • Updates React state
   • Cleans up on unmount
   ↓
5. Backend sends WebSocket message
   ↓
6. parseMessage() validates JSON
   ↓
7. Hook updates state → Component re-renders
   ↓
8. jsonPath extracts X/Y values → Chart renders
```

## 🔧 Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.1 | UI framework (peer dependency) |
| **TypeScript** | Latest | Type safety |
| **Vite** | ^6.3.6 | Build tool and bundler |
| **Vitest** | ^3.2.4 | Testing framework |
| **Recharts** | ^3.3.0 | Chart visualization |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Storybook** | Interactive component development |
| **ESLint** | Code linting |
| **Testing Library** | React testing utilities |
| **vite-plugin-dts** | TypeScript declarations |

### Build Outputs

The library builds to three formats:
- **CommonJS**: `dist/index.js` (older bundlers)
- **ES Modules**: `dist/index.mjs` (modern bundlers)
- **TypeScript**: `dist/index.d.ts` (type definitions)

## 🧪 Testing

### Run Tests

```bash
# Unit tests (watch mode)
npm run test

# Storybook interaction tests
npm run test:stories

# CI mode (all tests)
npm run test:stories:ci
```

### Test Coverage

Tests cover:
- Component rendering
- WebSocket lifecycle (connect, disconnect, reconnect)
- Error handling
- Data parsing and extraction
- Hook behavior

## 🏗️ Building & Publishing

### Local Build

```bash
npm run build
```

Output in `dist/` directory:
- `index.js` (CommonJS)
- `index.mjs` (ES Modules)
- `index.d.ts` (TypeScript types)

### Version Management

```bash
npm version patch   # Bug fixes (1.0.0 → 1.0.1)
npm version minor   # New features (1.0.0 → 1.1.0)
npm version major   # Breaking changes (1.0.0 → 2.0.0)
```

### Publishing to npm

**Automated via GitHub Actions:**

1. Create a GitHub Release:
   - Tag: `v1.0.11` (match package.json version)
   - Title: Same as tag
   - Description: Release notes

2. GitHub Actions automatically:
   - Runs tests
   - Builds package
   - Publishes to npm

3. Verify:
   ```bash
   npm view scadable version
   ```

## 🚀 CI/CD Pipeline

### Workflows

#### 1. **CI Build** (`ci-build.yaml`)
Runs on every push and pull request:
```yaml
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Lint code
5. Run tests
6. Build package
```

#### 2. **Publish** (`react-publish.yaml`)
Runs when GitHub release is created:
```yaml
Steps:
1. Checkout code
2. Setup Node.js with npm registry
3. Install dependencies
4. Build package
5. Publish to npm (with provenance)
```

### GitHub Secrets Required

- `NPM_TOKEN`: npm authentication token with publish permissions

### Deployment Flow

```
Create GitHub Release
    ↓
Trigger GitHub Actions
    ↓
Run CI checks (lint, test, build)
    ↓
Build succeeds?
  ↙         ↘
Yes          No
 ↓            ↓
Publish    Fail
 ↓
npm updated
```

## 🌐 Where to Access & Manage

### For End Users
- **NPM**: [https://www.npmjs.com/package/scadable](https://www.npmjs.com/package/scadable)
- **Install**: `npm install scadable`

### For Developers
- **GitHub**: [https://github.com/scadable/library-react](https://github.com/scadable/library-react)
- **Issues**: [GitHub Issues](https://github.com/scadable/library-react/issues)
- **Storybook**: Run `npm run storybook` locally

### Hosting & Deployment
- **Package Registry**: npm (public)
- **CI/CD**: GitHub Actions
- **Version Control**: GitHub

## 🤝 Contributing

### Contribution Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Make changes** with clear commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
5. **Test** your changes:
   ```bash
   npm run test
   npm run build
   ```
6. **Push** and create a pull request

### Commit Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance
- `refactor:` Code refactoring

### Code Review Process

1. Automated CI checks must pass
2. At least one maintainer review
3. Address feedback
4. Merge when approved

## 🔍 Troubleshooting Development

### Storybook won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run storybook
```

### Build fails
```bash
npx tsc --noEmit  # Check TypeScript errors
rm -rf dist
npm run build
```

### Tests failing
```bash
npm run test -- --reporter=verbose
```

## 📄 License

ISC License - See [LICENSE](./LICENSE) file for details

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/scadable/library-react/issues)
- **Questions**: Open a discussion on GitHub


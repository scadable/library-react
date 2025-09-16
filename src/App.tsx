import React, { useEffect } from "react";
import { Facility, Device, useLiveTelemetry } from "./index";

// Create facility and device instances
const facility = new Facility("secure-key");
const device = new Device(facility, "device-id");

/**
 * Example App component demonstrating useLiveTelemetry usage
 * This matches the example provided in the user story
 */
export default function App() {
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  // Log all incoming data
  useEffect(() => {
    if (telemetry) {
      console.log("Telemetry received:", telemetry);
    }
  }, [telemetry]);

  // Log connection status
  useEffect(() => {
    console.log("Connection status:", isConnected ? "Connected" : "Disconnected");
  }, [isConnected]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error("Telemetry error:", error);
    }
  }, [error]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Scadable Stream</h1>
      
      {/* Connection Status */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          Status: <span style={{ 
            color: isConnected ? "green" : "red",
            fontWeight: "bold"
          }}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          border: "1px solid #f44336",
          borderRadius: "4px"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Telemetry Data Display */}
      <div>
        <h2>Telemetry Data</h2>
        
        {/* Safely render temperature if present */}
        <p>
          Temperature:{" "}
          <span style={{ fontWeight: "bold" }}>
            {telemetry && typeof telemetry === "object" && "temperature" in telemetry 
              ? telemetry.temperature 
              : "--"}
          </span>
        </p>

        {/* Display raw telemetry data */}
        <div style={{ 
          marginTop: "20px", 
          padding: "10px", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px",
          fontFamily: "monospace"
        }}>
          <strong>Raw Data:</strong>
          <pre style={{ margin: "10px 0 0 0", whiteSpace: "pre-wrap" }}>
            {telemetry ? JSON.stringify(telemetry, null, 2) : "No data received"}
          </pre>
        </div>
      </div>
    </div>
  );
}

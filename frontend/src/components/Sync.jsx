// import { useEffect, useState } from "react";
// import {
//   Start,
//   Stop,
//   IsRunning,
//   GetStatus,
// } from "../../wailsjs/go/services/SyncService";
// import { EventsOn } from "../../wailsjs/runtime/runtime";
// import { showToast } from "../utils/toast";

// export default function SyncControl() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [serverIP, setServerIP] = useState("localhost");
//   const [deviceID, setDeviceID] = useState("");
//   const [devicesSynced, setDevicesSynced] = useState(0);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     // Generate a simple device ID
//     const storedDeviceID = localStorage.getItem("device_id");
//     if (storedDeviceID) {
//       setDeviceID(storedDeviceID);
//     } else {
//       const newDeviceID = `device-${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem("device_id", newDeviceID);
//       setDeviceID(newDeviceID);
//     }

//     // Check if already connected
//     checkStatus();

//     // Listen for sync events
//     const offConnected = EventsOn("sync:connected", (status) => {
//       setIsConnected(true);
//       setLastUpdate(new Date());
//       showToast("✅ Sync connected");
//     });

//     const offDisconnected = EventsOn("sync:disconnected", () => {
//       setIsConnected(false);
//       showToast("⚠️ Sync disconnected");
//     });

//     const offProgress = EventsOn("sync:progress", (msg) => {
//       setDevicesSynced(msg.devices_synced);
//       setLastUpdate(new Date());
//     });

//     const offNotify = EventsOn("notify:progress", (data) => {
//       showToast(
//         `📖 ${data.manga_id}: Ch ${data.previous} → ${data.chapter} (${data.devices_synced} devices)`
//       );
//     });

//     const offError = EventsOn("sync:error", (data) => {
//       setIsConnected(false);
//       showToast(`❌ Sync error: ${data.error}`);
//     });

//     return () => {
//       offConnected();
//       offDisconnected();
//       offProgress();
//       offNotify();
//       offError();
//     };
//   }, []);

//   const checkStatus = async () => {
//     try {
//       const running = await IsRunning();
//       setIsConnected(running);
      
//       if (running) {
//         const status = await GetStatus();
//         setDevicesSynced(status.devices_synced || 0);
//         setLastUpdate(status.last_update ? new Date(status.last_update) : null);
//       }
//     } catch (err) {
//       console.error("Failed to check sync status:", err);
//     }
//   };

//   const handleConnect = async () => {
//     if (!serverIP.trim()) {
//       showToast("❌ Please enter server IP");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await Start(serverIP, deviceID);
//       // Status will be updated via events
//     } catch (err) {
//       showToast(`❌ Connection failed: ${err.message}`);
//       setIsConnected(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     setIsLoading(true);
//     try {
//       await Stop();
//       // Status will be updated via events
//     } catch (err) {
//       showToast(`❌ Disconnect failed: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={styles.statusIndicator}>
//           <div
//             style={{
//               ...styles.statusDot,
//               background: isConnected
//                 ? "linear-gradient(135deg, #9ee693 0%, #a0e4cb 100%)"
//                 : "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
//             }}
//           />
//           <span style={styles.statusText}>
//             {isConnected ? "Connected" : "Disconnected"}
//           </span>
//         </div>

//         {isConnected && (
//           <div style={styles.syncInfo}>
//             <span style={styles.syncBadge}>
//               📱 {devicesSynced} device{devicesSynced !== 1 ? "s" : ""}
//             </span>
//             {lastUpdate && (
//               <span style={styles.timeText}>
//                 {lastUpdate.toLocaleTimeString()}
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {!isConnected ? (
//         <div style={styles.connectForm}>
//           <input
//             type="text"
//             placeholder="Server IP (e.g., 192.168.1.100)"
//             value={serverIP}
//             onChange={(e) => setServerIP(e.target.value)}
//             style={styles.input}
//             disabled={isLoading}
//           />
//           <button
//             onClick={handleConnect}
//             disabled={isLoading}
//             style={styles.connectBtn}
//           >
//             {isLoading ? "Connecting..." : "Connect to Sync"}
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={handleDisconnect}
//           disabled={isLoading}
//           style={styles.disconnectBtn}
//         >
//           {isLoading ? "Disconnecting..." : "Disconnect"}
//         </button>
//       )}

//       <div style={styles.deviceInfo}>
//         <span style={styles.deviceLabel}>Device ID:</span>
//         <span style={styles.deviceId}>{deviceID}</span>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     padding: 20,
//     background:
//       "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 240, 245, 0.85) 100%)",
//     backdropFilter: "blur(12px)",
//     border: "2px solid rgba(255, 182, 185, 0.4)",
//     borderRadius: 24,
//     boxShadow:
//       "0 8px 24px rgba(255, 182, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
//     display: "flex",
//     flexDirection: "column",
//     gap: 16,
//   },

//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexWrap: "wrap",
//     gap: 12,
//   },

//   statusIndicator: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   },

//   statusDot: {
//     width: 12,
//     height: 12,
//     borderRadius: "50%",
//     boxShadow: "0 2px 8px rgba(158, 230, 147, 0.4)",
//     animation: "pulse 2s ease-in-out infinite",
//   },

//   statusText: {
//     color: "#ff6b9d",
//     fontSize: 16,
//     fontWeight: 700,
//   },

//   syncInfo: {
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//   },

//   syncBadge: {
//     padding: "6px 14px",
//     borderRadius: 50,
//     background: "rgba(255, 201, 160, 0.3)",
//     border: "1px solid rgba(255, 182, 185, 0.3)",
//     color: "#ff8ba7",
//     fontSize: 13,
//     fontWeight: 600,
//   },

//   timeText: {
//     color: "#ff8ba7",
//     fontSize: 13,
//     fontWeight: 500,
//     opacity: 0.8,
//   },

//   connectForm: {
//     display: "flex",
//     gap: 12,
//     flexDirection: "column",
//   },

//   input: {
//     padding: "12px 18px",
//     borderRadius: 50,
//     border: "2px solid rgba(255, 182, 185, 0.4)",
//     background: "rgba(255, 255, 255, 0.8)",
//     color: "#ff6b9d",
//     fontSize: 14,
//     fontWeight: 500,
//     outline: "none",
//     boxShadow: "inset 0 2px 6px rgba(255, 182, 185, 0.1)",
//   },

//   connectBtn: {
//     padding: "12px 24px",
//     borderRadius: 50,
//     border: "2px solid rgba(255, 255, 255, 0.6)",
//     background: "linear-gradient(135deg, #9ee693 0%, #a0e4cb 100%)",
//     color: "#ffffff",
//     fontSize: 15,
//     fontWeight: 700,
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     boxShadow:
//       "0 6px 20px rgba(158, 230, 147, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
//   },

//   disconnectBtn: {
//     padding: "12px 24px",
//     borderRadius: 50,
//     border: "2px solid rgba(255, 182, 185, 0.4)",
//     background: "linear-gradient(135deg, #ff9a9e 0%, #ffc9a0 100%)",
//     color: "#ffffff",
//     fontSize: 15,
//     fontWeight: 700,
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     boxShadow:
//       "0 6px 20px rgba(255, 154, 158, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
//   },

//   deviceInfo: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     paddingTop: 12,
//     borderTop: "1px solid rgba(255, 182, 185, 0.2)",
//   },

//   deviceLabel: {
//     color: "#ff8ba7",
//     fontSize: 13,
//     fontWeight: 600,
//   },

//   deviceId: {
//     color: "#ff6b9d",
//     fontSize: 12,
//     fontWeight: 500,
//     fontFamily: "monospace",
//     padding: "4px 10px",
//     background: "rgba(255, 201, 160, 0.2)",
//     borderRadius: 6,
//   },
// };
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VpnConfig {
  serverPublicIp: string;
  serverPort: number;
  serverInterface: string;
  serverPrivateRange: string; // e.g. 10.8.0.1/24
  clientPrivateIp: string;    // e.g. 10.8.0.2/32
  dnsPrimary: string;
  dnsSecondary: string;
  mtu: number;
  keepalive: number;
  enableBbr: boolean;
  enableSysctlOptimizations: boolean;
  clientPrivateKey: string;
  clientPublicKey: string;
  serverPrivateKey: string;
  serverPublicKey: string;
  osType: 'ubuntu' | 'debian';
}

export interface MetricSimulation {
  latency: number;
  jitter: number;
  packetLoss: number;
  bufferbloatScore: 'Excellent' | 'Good' | 'Medocre' | 'Severe';
}

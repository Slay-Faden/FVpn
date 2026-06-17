/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VpnConfig } from '../types';
import { generateWireguardKey } from '../utils';
import { RefreshCw, Shield, Server, Network, Wifi, Globe, HelpCircle } from 'lucide-react';

interface VariableInputsProps {
  config: VpnConfig;
  onChange: (updatedConfig: VpnConfig) => void;
}

export default function VariableInputs({ config, onChange }: VariableInputsProps) {
  
  const updateField = (field: keyof VpnConfig, value: any) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  };

  const regenerateKeys = () => {
    // Generate new valid simulated base64 keys
    const serverPrivate = generateWireguardKey();
    const serverPublic = generateWireguardKey();
    const clientPrivate = generateWireguardKey();
    const clientPublic = generateWireguardKey();

    onChange({
      ...config,
      serverPrivateKey: serverPrivate,
      serverPublicKey: serverPublic,
      clientPrivateKey: clientPrivate,
      clientPublicKey: clientPublic,
    });
  };

  // Presets mapping
  const applyDnsPreset = (primary: string, secondary: string) => {
    onChange({
      ...config,
      dnsPrimary: primary,
      dnsSecondary: secondary,
    });
  };

  const applyMtuPreset = (value: number) => {
    updateField('mtu', value);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="vg-variable-inputs">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-sans text-white">Console d'Optimisation</h3>
          <p className="text-xs text-slate-400">Configurez et calibrez vos paramètres réseau en direct.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* System & Network */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Paramètres du Serveur
          </h4>

          {/* OS Type */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Distribution Linux (Serveur)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('osType', 'ubuntu')}
                id="btn-os-ubuntu"
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  config.osType === 'ubuntu'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Ubuntu (20.04 / 22.04 / 24.04)
              </button>
              <button
                type="button"
                onClick={() => updateField('osType', 'debian')}
                id="btn-os-debian"
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  config.osType === 'debian'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Debian (11 / 12 Bookworm)
              </button>
            </div>
          </div>

          {/* Public IP */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Adresse IP Publique du VPS <span className="text-rose-400 font-mono">*</span>
            </label>
            <input
              type="text"
              value={config.serverPublicIp}
              onChange={(e) => updateField('serverPublicIp', e.target.value)}
              id="input-public-ip"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono placeholder:text-slate-700"
              placeholder="Ex: 198.51.100.42"
            />
            <p className="text-[10px] text-slate-500 mt-1">L'IP publique fournie par votre hébergeur Cloud VPS.</p>
          </div>

          {/* Port & Network Card Public Interface */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Port UDP WireGuard</label>
              <input
                type="number"
                value={config.serverPort}
                onChange={(e) => updateField('serverPort', parseInt(e.target.value) || 51820)}
                id="input-server-port"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Interface Réseau Publique</label>
              <input
                type="text"
                value={config.serverInterface}
                onChange={(e) => updateField('serverInterface', e.target.value)}
                id="input-network-iface"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
                placeholder="Ex: eth0, ens3"
              />
            </div>
          </div>

          {/* Private Subnets Setup */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sous-Réseau VPN</label>
              <input
                type="text"
                value={config.serverPrivateRange}
                onChange={(e) => updateField('serverPrivateRange', e.target.value)}
                id="input-subnet-server"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Adresse IP Client</label>
              <input
                type="text"
                value={config.clientPrivateIp}
                onChange={(e) => updateField('clientPrivateIp', e.target.value)}
                id="input-subnet-client"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
              />
            </div>
          </div>

        </div>

        {/* Client Optimizations (DNS, MTU, KeepAlive) */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Optimisation de Latence / Débit
          </h4>

          {/* MTU Calibration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-400">
                Calibrage MTU (Maximum Transmission Unit)
              </label>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                Recommandé : {config.mtu}
              </span>
            </div>
            <input
              type="number"
              value={config.mtu}
              onChange={(e) => updateField('mtu', parseInt(e.target.value) || 1420)}
              id="input-mtu"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
              min="1280"
              max="1500"
            />
            
            {/* Quick MTU presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => applyMtuPreset(1420)}
                id="btn-preset-mtu-1420"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
              >
                Fibre Optique Standard (1420)
              </button>
              <button
                type="button"
                onClick={() => applyMtuPreset(1360)}
                id="btn-preset-mtu-1360"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
              >
                Lignes xDSL / PPPoE (1360)
              </button>
              <button
                type="button"
                onClick={() => applyMtuPreset(1280)}
                id="btn-preset-mtu-1280"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
              >
                Réseaux Mobiles 4G/5G (1280)
              </button>
            </div>
          </div>

          {/* DNS Configuration with fast presets */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-400">
                Serveurs DNS (Résolution à faible latence)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={config.dnsPrimary}
                onChange={(e) => updateField('dnsPrimary', e.target.value)}
                id="input-dns-primary"
                className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-1.5 px-2 text-xs text-white font-mono"
                placeholder="DNS Primaire"
              />
              <input
                type="text"
                value={config.dnsSecondary}
                onChange={(e) => updateField('dnsSecondary', e.target.value)}
                id="input-dns-secondary"
                className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-1.5 px-2 text-xs text-white font-mono"
                placeholder="DNS Secondaire"
              />
            </div>

            {/* Quick DNS presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => applyDnsPreset('1.1.1.1', '1.0.0.1')}
                id="btn-dns-cloudflare"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-2.5 h-2.5 text-orange-400" /> Cloudflare Gaming (1.1.1.1)
              </button>
              <button
                type="button"
                onClick={() => applyDnsPreset('8.8.8.8', '8.8.4.4')}
                id="btn-dns-google"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-2.5 h-2.5 text-blue-400" /> Google Public (8.8.8.8)
              </button>
              <button
                type="button"
                onClick={() => applyDnsPreset('9.9.9.9', '149.112.112.112')}
                id="btn-dns-quad9"
                className="text-[10px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-2.5 h-2.5 text-cyan-400" /> Quad9 Safe Security (9.9.9.9)
              </button>
            </div>
          </div>

          {/* Persistent Keepalive Interval */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Rétention NAT active (Intervalle Keepalive - secondes)
            </label>
            <input
              type="number"
              value={config.keepalive}
              onChange={(e) => updateField('keepalive', parseInt(e.target.value) || 25)}
              id="input-keepalive"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
              min="5"
              max="300"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Envoie un ping discret de maintien réseau. Prévient les coupures de flux durant les moments calmes.
            </p>
          </div>

          {/* Toggles for TCP BBR and low level network kernel parameters */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Algorithme TCP BBR de Google</span>
                <span className="text-[10px] text-slate-400">Empêche les hausses de gigue sous réseau saturé.</span>
              </div>
              <input
                type="checkbox"
                checked={config.enableBbr}
                onChange={(e) => updateField('enableBbr', e.target.checked)}
                id="checkbox-bbr"
                className="w-4 h-4 text-cyan-600 border-slate-700 bg-slate-950 rounded focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Optimisation noyau de bas niveau (Buffers)</span>
                <span className="text-[10px] text-slate-400">Évite les rejets de paquets en gonflant rmem / wmem.</span>
              </div>
              <input
                type="checkbox"
                checked={config.enableSysctlOptimizations}
                onChange={(e) => updateField('enableSysctlOptimizations', e.target.checked)}
                id="checkbox-sysctl"
                className="w-4 h-4 text-cyan-600 border-slate-700 bg-slate-950 rounded focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Key Manager section */}
      <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
              Gestionnaire de Clés Asymétriques
            </span>
          </div>
          <button
            type="button"
            onClick={regenerateKeys}
            id="btn-regenerate-keys"
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs py-1 px-2.5 rounded border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            Régénérer Clés VPN Sécurisées
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="text-slate-400 font-medium">Clés du Serveur (wg0)</div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono break-all text-slate-300 select-all">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Clé Privée (PrivKey)</span>
              {config.serverPrivateKey}
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono break-all text-slate-300 select-all">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Clé Publique (PubKey)</span>
              {config.serverPublicKey}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-slate-400 font-medium font-sans">Clés du Client (Mobile / TV / PC)</div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono break-all text-slate-300 select-all">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Clé Privée (PrivKey)</span>
              {config.clientPrivateKey}
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono break-all text-slate-300 select-all">
              <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Clé Publique (PubKey)</span>
              {config.clientPublicKey}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

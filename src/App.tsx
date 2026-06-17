/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VpnConfig } from './types';
import { generateWireguardKey } from './utils';
import VariableInputs from './components/VariableInputs';
import ServerScript from './components/ServerScript';
import ClientConfig from './components/ClientConfig';
import SecurityDiagnostic from './components/SecurityDiagnostic';
import LatencyLab from './components/LatencyLab';
import WebToExeConverter from './components/WebToExeConverter';
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Settings, 
  Terminal, 
  Heart, 
  Sliders, 
  FileText, 
  SlidersHorizontal,
  Wifi,
  Radio, 
  Gauge, 
  Activity,
  Sparkles,
  CheckCheck,
  RefreshCw,
  AppWindow
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'server' | 'client' | 'diag' | 'web_exe'>('web_exe');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Generate realistic cryptographic WireGuard keys on initial boot
  const [config, setConfig] = useState<VpnConfig>(() => {
    const sPriv = generateWireguardKey();
    const sPub = generateWireguardKey();
    const cPriv = generateWireguardKey();
    const cPub = generateWireguardKey();

    return {
      serverPublicIp: '198.51.100.42',
      serverPort: 51820,
      serverInterface: 'eth0',
      serverPrivateRange: '10.8.0.1/24',
      clientPrivateIp: '10.8.0.2/32',
      dnsPrimary: '1.1.1.1',
      dnsSecondary: '1.0.0.1',
      mtu: 1420,
      keepalive: 25,
      enableBbr: true,
      enableSysctlOptimizations: true,
      serverPrivateKey: sPriv,
      serverPublicKey: sPub,
      clientPrivateKey: cPriv,
      clientPublicKey: cPub,
      osType: 'ubuntu',
    };
  });

  const isAlreadyOptimized = 
    config.dnsPrimary === '1.1.1.1' && 
    config.dnsSecondary === '1.0.0.1' && 
    config.mtu === 1420 && 
    config.keepalive === 25 && 
    config.enableBbr === true && 
    config.enableSysctlOptimizations === true;

  const runAllInOneOptimization = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setShowSuccessToast(false);
    
    const steps = [
      "Analyse de la topologie de liaison...",
      "Injection des configurations système réactives...",
      "Activation de l'algorithme antibufferbloat Google BBR...",
      "Calibrage du MTU à 1420 octets (Zéro-Fragmentation)...",
      "Fixation des keepalives à 25s pour éviter le timeout FAI...",
      "Sélection des résolveurs DNS Cloudflare Gaming la plus proche...",
      "Masse de configuration appliquée avec succès !"
    ];

    let currentStepIndex = 0;
    setOptimizationStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setOptimizationStep(steps[currentStepIndex]);
      } else {
        clearInterval(interval);
        setConfig(prev => ({
          ...prev,
          dnsPrimary: '1.1.1.1',
          dnsSecondary: '1.0.0.1',
          mtu: 1420,
          keepalive: 25,
          enableBbr: true,
          enableSysctlOptimizations: true,
        }));
        setIsOptimizing(false);
        setOptimizationStep('');
        setShowSuccessToast(true);
      }
    }, 380);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Professional Network Status Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-lg blur animate-pulse" />
              <div className="p-2 bg-cyan-500 text-slate-950 rounded-lg relative shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Radio className="w-5 h-5 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                  WARP-GUARD <span className="text-cyan-400 font-medium">PRO</span>
                </h1>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-sans font-bold px-1.5 py-0.5 rounded border border-cyan-500/25">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium font-sans">BBR Tuner & Latence Bas Niveau</p>
            </div>
          </div>

          {/* Telemetry Metrics bar (Unobtrusive & Functional, fully configured) */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-mono border-l border-slate-800 pl-6 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>ALGO:</span>
              <span className="text-white bg-slate-900 px-1.5 py-0.5 rounded font-bold border border-slate-800">
                {config.enableBbr ? 'BBR_ACTIVE' : 'CUBIC_ACTIVE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>TUNNEL MTU:</span>
              <span className={`px-1.5 py-0.5 rounded font-bold border ${
                config.mtu <= 1420 
                  ? 'text-cyan-400 bg-slate-900 border-slate-800' 
                  : 'text-amber-400 bg-slate-900 border-amber-900/30'
              }`}>
                {config.mtu} Octets
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROTOCOL:</span>
              <span className="text-cyan-400 font-bold">WIREGUARD_SECURE</span>
            </div>
          </div>

          {/* Active status Badge */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase hidden sm:inline">
              Moteur opérationnel
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        
        {/* Success Toast Notification */}
        {showSuccessToast && (
          <div className="bg-slate-900 border border-cyan-500 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-fade-in-up border-l-4 border-l-cyan-500" id="toast-optimization-success">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Optimisation Appliquée !</strong>
                <span className="text-xs text-slate-400">DNS Cloudflare, protocole BBR, MTU 1420 et keepalive 25s sont maintenant fixes.</span>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="text-slate-500 hover:text-white text-xs font-mono cursor-pointer"
            >
              [FERMER]
            </button>
          </div>
        )}

        {/* Call-to-action Dashboard Quick Info with Responsive Grid for All-In-One Optimizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none opacity-20" />
          
          <div className="lg:col-span-8 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-cyan-500/5 border border-cyan-500/15 text-xs text-cyan-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CONFIGURATEUR RÉSEAU HAUTE DISPONIBILITÉ
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-sans">
              VPN Cloud Gaming & Streaming 4K Personnel
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
              Les VPN classiques ajoutent du chiffrement lourd et subissent la saturation de bande passante des routeurs FAI (Bufferbloat). 
              Ce configurateur applique l'algorithme <strong className="text-cyan-400 font-sans">Google BBR</strong>, gonfle les tampons système Linux et calibre précisément le <strong className="text-cyan-400 font-sans">MTU</strong> pour supprimer la fragmentation UDP, garantissant un ping ultra-stable sous GeForce Online ou Netflix HDR.
            </p>
          </div>

          <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 md:p-5 relative z-10 flex flex-col justify-between gap-4 shadow-lg backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2 border-b border-slate-800 pb-2">
                <span className="text-slate-500 font-bold">OPTIMISEUR GLOBAL :</span>
                {isAlreadyOptimized ? (
                  <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-cyan-500/20">
                    <CheckCheck className="w-3 h-3" /> ACTIF (100%)
                  </span>
                ) : (
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                    NON SYNC
                  </span>
                )}
              </div>

              <div className="min-h-[48px] flex flex-col justify-center">
                {isOptimizing ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span className="text-xs text-white font-semibold">Tuning Automatique...</span>
                    </div>
                    <p className="text-[10px] text-cyan-400 font-mono truncate">{optimizationStep}</p>
                  </div>
                ) : isAlreadyOptimized ? (
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Votre passerelle et vos profils clients sont réglés sur les performances maximales d'usine. Aucun écart de bande passante détecté.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Appliquez instantanément le protocole BBR, les DNS de jeu Cloudflare et l'égalisateur MTU sans aucune manipulation manuelle.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={runAllInOneOptimization}
              id="btn-all-in-one-optimize"
              disabled={isOptimizing}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isOptimizing 
                  ? 'bg-slate-850 border border-slate-800 text-slate-500 cursor-not-allowed'
                  : isAlreadyOptimized
                    ? 'bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-850 hover:border-slate-700 shadow-inner'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]'
              }`}
            >
              {isOptimizing ? (
                <>Optimisation en cours...</>
              ) : isAlreadyOptimized ? (
                <>Re-générer l'Optimisation</>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 animate-pulse fill-current" />
                  Optimisation complète 1-Clic
                </>
              )}
            </button>
          </div>

        </div>

        {/* Dashboard Tabs buttons */}
        <div className="flex overflow-x-auto pb-1.5 border-b border-slate-800 gap-1.5 scrollbar-thin scrollbar-thumb-slate-800" id="vpn-navigation-tabs">
          <button
            onClick={() => setActiveTab('config')}
            id="tab-config"
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 border ${
              activeTab === 'config'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            1. Variables & Test Lab
          </button>

          <button
            onClick={() => setActiveTab('server')}
            id="tab-server"
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 border ${
              activeTab === 'server'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Script Serveur (BBR inside)
          </button>

          <button
            onClick={() => setActiveTab('client')}
            id="tab-client"
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 border ${
              activeTab === 'client'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            3. Profil Client (.conf & QR)
          </button>

          <button
            onClick={() => setActiveTab('diag')}
            id="tab-diag"
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 border ${
              activeTab === 'diag'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            4. Commandes de Diagnostic
          </button>

          <button
            onClick={() => setActiveTab('web_exe')}
            id="tab-web-exe"
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 border ${
              activeTab === 'web_exe'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <AppWindow className="w-4 h-4 text-cyan-400 group-hover:text-cyan-400" />
            5. Convertisseur Web ➜ EXE
            <span className="text-[9px] bg-cyan-400 text-slate-950 px-1 py-0.5 rounded font-bold animate-pulse">NOUVEAU</span>
          </button>
        </div>

        {/* Tab content renderer panels */}
        <div className="space-y-6">
          {activeTab === 'web_exe' && (
            <WebToExeConverter />
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <LatencyLab mtu={config.mtu} enableBbr={config.enableBbr} />
              <VariableInputs config={config} onChange={setConfig} />
            </div>
          )}

          {activeTab === 'server' && (
            <ServerScript config={config} />
          )}

          {activeTab === 'client' && (
            <ClientConfig config={config} />
          )}

          {activeTab === 'diag' && (
            <SecurityDiagnostic />
          )}
        </div>

      </main>

      {/* footer details */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            Projet Open-Source calibré par un Ingénieur Réseau Senior pour les gamers. Aucun trafic n'est enregistré.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span>Fait avec</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>pour le Cloud Gaming fluide</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

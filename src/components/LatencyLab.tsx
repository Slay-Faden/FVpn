/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, AlertTriangle, CheckCircle2, ShieldAlert, Wifi, Cpu, Info } from 'lucide-react';

interface NetworkPacket {
  id: string;
  type: 'standard' | 'fragmented-1' | 'fragmented-2' | 'bbr-gaming';
  position: number; // 0 to 100
  color: string;
}

export default function LatencyLab({ mtu, enableBbr }: { mtu: number; enableBbr: boolean }) {
  const [activeSimulation, setActiveSimulation] = useState<boolean>(false);
  const [simulatedProtocol, setSimulatedProtocol] = useState<'bbr' | 'cubic'>(enableBbr ? 'bbr' : 'cubic');
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([15, 14, 16, 15, 14, 15]);
  const [jitter, setJitter] = useState<number>(0.8);
  const [fpsDrop, setFpsDrop] = useState<number>(0);
  const [packetCount, setPacketCount] = useState<number>(0);

  // Sync simulated protocol with parent config toggle
  useEffect(() => {
    setSimulatedProtocol(enableBbr ? 'bbr' : 'cubic');
  }, [enableBbr]);

  // Handle packet animations and scoring updates
  useEffect(() => {
    if (!activeSimulation) {
      setPackets([]);
      return;
    }

    const interval = setInterval(() => {
      // Create new packet periodically
      setPacketCount(p => p + 1);
      const isFragmented = mtu > 1420;

      const newPackets: NetworkPacket[] = [];
      if (simulatedProtocol === 'bbr') {
        newPackets.push({
          id: Math.random().toString(),
          type: 'bbr-gaming',
          position: 0,
          color: 'bg-cyan-400',
        });
      } else {
        if (isFragmented) {
          // Fragmentation splits the packet into two, causing jitter and latency spike
          newPackets.push(
            { id: Math.random().toString(), type: 'fragmented-1', position: 0, color: 'bg-orange-500' },
            { id: Math.random().toString(), type: 'fragmented-2', position: -10, color: 'bg-red-400' }
          );
        } else {
          newPackets.push({
            id: Math.random().toString(),
            type: 'standard',
            position: 0,
            color: 'bg-sky-400',
          });
        }
      }

      setPackets(prev => {
        // Filter out completed ones and increment positions
        const filtered = prev
          .map(pkt => ({ ...pkt, position: pkt.position + 5 }))
          .filter(pkt => pkt.position < 100);
        return [...filtered, ...newPackets];
      });

      // Latency math
      setLatencyHistory(prev => {
        const last = prev[prev.length - 1];
        let nextVal = last;

        // Base latencies
        if (simulatedProtocol === 'bbr') {
          // BBR keeps packet queues low, resulting in flat line
          nextVal = 12 + Math.random() * 2;
          if (isFragmented) nextVal += 8; // Fragmentation still adds minor serialization penalty
        } else {
          // CUBIC fills buffers to drop, resulting in cyclic latency peaks (Bufferbloat)
          const bufferSizeFactor = Math.sin(packetCount / 5) * 15;
          nextVal = 20 + bufferSizeFactor + (Math.random() * 6);
          if (isFragmented) nextVal += 15; // Extra fragmentation penalty
        }

        const nextClean = Math.max(10, Math.round(nextVal * 10) / 10);
        const history = [...prev.slice(-15), nextClean];
        
        // Calculate jitter (mean absolute deviation)
        let totalDiff = 0;
        for (let i = 1; i < history.length; i++) {
          totalDiff += Math.abs(history[i] - history[i - 1]);
        }
        const calculatedJitter = Math.min(25, totalDiff / (history.length - 1));
        setJitter(Math.round(calculatedJitter * 100) / 100);

        // Gaming experience drops
        if (calculatedJitter > 5 || nextClean > 40) {
          setFpsDrop(prevFps => Math.min(60, prevFps + 15));
        } else {
          setFpsDrop(prevFps => Math.max(0, prevFps - 5));
        }

        return history;
      });

    }, 220);

    return () => clearInterval(interval);
  }, [activeSimulation, simulatedProtocol, mtu, packetCount]);

  // Reset metrics
  const toggleSim = () => {
    setActiveSimulation(!activeSimulation);
    if (!activeSimulation) {
      setPacketCount(0);
      setLatencyHistory([15, 14, 16, 15, 14, 15]);
      setJitter(0.8);
      setFpsDrop(0);
    }
  };

  const isFragmented = mtu > 1420;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6" id="vg-latency-lab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
            Laboratoire Interactif Réseau
          </span>
          <h3 className="text-xl font-bold font-sans text-white mt-2">
            Simulateur d'Optimisation de Flux Gaming et 4K
          </h3>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Visualisez en temps réel l'impact du contrôle de congestion <strong className="text-white">BBR</strong> et du réglage <strong className="text-white">MTU</strong> sur votre stabilité de ping.
          </p>
        </div>

        <button
          onClick={toggleSim}
          id="btn-toggle-simulation"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer ${
            activeSimulation
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}
        >
          <Wifi className={`w-4 h-4 ${activeSimulation ? 'animate-pulse' : ''}`} />
          {activeSimulation ? 'Arrêter la Simulation' : 'Lancer Simulation Temps Réel'}
        </button>
      </div>

      {/* Simulator Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Channel & Stats Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Animated Queue Channel */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 relative overflow-hidden h-40 flex flex-col justify-between">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span> Expéditeur (Ordinateur Réseau)
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Passerelle VPN ({mtu} Octets de MTU)
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                GeForce Now / Serveur 4K
              </span>
            </div>

            {/* Packet visualizer lane */}
            <div className="relative h-12 w-full border-y border-dashed border-slate-800 flex items-center justify-start">
              {/* Receiver visual line */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-cyan-500/40 blur-sm rounded" />
              
              {!activeSimulation ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-600 italic">
                  Cliquez sur "Lancer Simulation" pour visualiser le transit des paquets UDP
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {packets.map((pkt) => (
                    <motion.div
                      key={pkt.id}
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-950 shadow-md ${
                        pkt.type === 'bbr-gaming' ? 'bg-cyan-400 shadow-cyan-500/30' :
                        pkt.type === 'standard' ? 'bg-indigo-400 shadow-indigo-500/30' :
                        pkt.type === 'fragmented-1' ? 'bg-orange-400 shadow-orange-500/30' : 'bg-rose-400 shadow-rose-500/30'
                      }`}
                      style={{ left: `${pkt.position}%` }}
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {pkt.type === 'bbr-gaming' ? 'BBR' : pkt.type === 'standard' ? 'IP' : 'FRAG'}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Modulateur Congestion : <strong className="text-slate-300 uppercase">{simulatedProtocol}</strong></span>
              <span>Fragmentation IP : {isFragmented ? (
                <strong className="text-amber-400">OUI (Perte d'efficacité)</strong>
              ) : (
                <strong className="text-cyan-400">NON (Optimisé)</strong>
              )}</span>
            </div>
          </div>

          {/* Interactive Toggle options to swap mode */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSimulatedProtocol('cubic')}
              id="btn-sim-cubic"
              disabled={!activeSimulation}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                simulatedProtocol === 'cubic'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm tracking-tight text-slate-200">Algorithme TCP CUBIC</span>
                {simulatedProtocol === 'cubic' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </div>
              <p className="text-xs text-slate-450 font-sans leading-relaxed">
                Algorithme standard. Remplit passivement les tampons jusqu'à congestion puis s'effondre. Crée du <strong className="text-amber-300 font-sans">Bufferbloat</strong>.
              </p>
            </button>

            <button
              onClick={() => setSimulatedProtocol('bbr')}
              id="btn-sim-bbr"
              disabled={!activeSimulation}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                simulatedProtocol === 'bbr'
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 disabled:opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm tracking-tight text-cyan-400">TCP BBR (Google-designed)</span>
                {simulatedProtocol === 'bbr' && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
              </div>
              <p className="text-xs text-slate-450 font-sans leading-relaxed">
                Mesure en temps réel le goulot d'étranglement. Évite de surcharger les mémoires tampons pour <strong className="text-cyan-300 font-sans">garder le ping au plus bas</strong>.
              </p>
            </button>
          </div>

          {/* Graph visual representation of Ping */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Fluctuations Jitter & Ping (millisecondes)
              </span>
              <span className="text-xs font-mono text-slate-500">Fil de 15 derniers paquets</span>
            </div>

            <div className="h-28 flex items-end gap-1.5 w-full pt-4">
              {latencyHistory.map((v, idx) => {
                const maxVal = Math.max(...latencyHistory, 50);
                const heightPct = Math.max(10, Math.min(100, (v / maxVal) * 100));
                
                // Color mapping depending on critical values
                let barColor = 'bg-cyan-400';
                if (v > 35) barColor = 'bg-rose-500';
                else if (v > 22) barColor = 'bg-amber-500';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <span className="absolute -top-5 scale-0 group-hover:scale-100 transition-all text-[9.5px] font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded z-25 shadow">
                      {v}ms
                    </span>
                    <motion.div
                      className={`w-full rounded-t-xs transition-all ${barColor}`}
                      style={{ height: `${heightPct}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[8px] font-mono text-slate-500 mt-1">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Interactive Stats scoreboard */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Latency card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-xs font-mono text-slate-500 uppercase">Ping Moyen Simulé</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {activeSimulation ? latencyHistory[latencyHistory.length - 1] : '15'}
              </span>
              <span className="text-sm font-mono text-slate-400">ms</span>
            </div>
            
            <div className={`mt-2 flex items-center gap-1.5 text-xs ${
              (latencyHistory[latencyHistory.length - 1] > 30) ? 'text-rose-400' :
              (latencyHistory[latencyHistory.length - 1] > 20) ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {latencyHistory[latencyHistory.length - 1] > 30 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ping élevé (Risque de saccades importantes)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Ping Excellent (Fluide pour GeForce Now)</span>
                </>
              )}
            </div>
          </div>

          {/* Jitter (Gigue) Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-xs font-mono text-slate-500 uppercase">Jitter (Gigue de Latence)</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-white block">
                {activeSimulation ? jitter : '0.4'}
              </span>
              <span className="text-sm font-mono text-slate-450">ms</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
              La régularité du flux évite les décalages audio/vidéo brutaux. Pour le gaming, le Jitter doit être inférieur à <strong className="text-white">1ms</strong>.
            </div>
          </div>

          {/* Impact Cloud Gaming Experience Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-xs font-mono text-slate-500 uppercase">Expérience Perçue en Jeu 4K</div>
            
            <div className="mt-2 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>Score de Stabilité du Flux</span>
                  <span className={`font-mono font-bold ${
                    jitter > 5 ? 'text-red-400' : jitter > 1.8 ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {jitter > 5 ? 'Médiocre (32%)' : jitter > 1.8 ? 'Bon (74%)' : 'Parfait (98%)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                       jitter > 5 ? 'bg-red-500 w-1/3' : jitter > 1.8 ? 'bg-amber-500 w-3/4' : 'bg-cyan-400 w-[98%]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-350 font-sans text-[11px] leading-relaxed">
                  {isFragmented ? (
                    <span className="text-amber-300">
                      MTU &gt; 1420 : Paquets fragmentés au niveau du tunnel, générant {Math.round(jitter * 1.5)}ms de surcoût.
                    </span>
                  ) : (
                    <span className="text-cyan-300">
                      L'alignement MTU optimisé ({mtu}) évite la fragmentation. Transit direct !
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Optimization Tips panel */}
      <div className="mt-6 bg-slate-950/40 border border-slate-800/60 rounded-lg p-4 flex gap-3 text-sm text-slate-400 font-sans">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs md:text-sm">
          <h4 className="font-semibold text-slate-200">Pour de réelles performances en situation réelle :</h4>
          <p>
            1. En Cloud Gaming, configurez le MTU de votre client WireGuard à <strong className="text-white">1420</strong> si vous utilisez la fibre standard. Retenez <strong className="text-white">1360</strong> si votre connexion utilise une encapsulation complexe comme PPPoE (VDSL d'ancienne génération) ou de la 4G/5G mobile.
          </p>
          <p>
            2. Le protocole <strong className="text-white">BBR</strong> modifie radicalement le comportement d'envoi. Au lieu de diviser artificiellement par deux votre bande passante dès qu'un paquet est égaré (comme CUBIC), BBR maintient son débit maximum et optimise le temps de trajet en estimant en direct la vitesse globale du goulot d'étranglement de votre fournisseur d'accès (FIBRE/ADSL).
          </p>
        </div>
      </div>
    </div>
  );
}

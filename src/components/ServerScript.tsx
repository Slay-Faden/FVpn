/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateServerScript } from '../utils';
import { VpnConfig } from '../types';
import { Copy, Download, Check, FileText, Cpu, Eye, Zap, ShieldCheck } from 'lucide-react';

interface ServerScriptProps {
  config: VpnConfig;
}

export default function ServerScript({ config }: ServerScriptProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const scriptContent = generateServerScript(config);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `install_wireguard_gaming.sh`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl space-y-5" id="vg-server-script">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans text-white">Partie 1 : Configuration du Serveur (Ubuntu / Debian)</h3>
            <p className="text-xs text-slate-400">Script d'automatisation Bash auto-installateur et optimisé réseau bas niveau.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Script file button */}
          <button
            onClick={downloadScript}
            id="btn-download-server-script"
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs py-2 px-3.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Télécharger le fichier .sh d'installation pour votre VPS"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger Script
          </button>

          {/* Copy script to clipboard */}
          <button
            onClick={copyToClipboard}
            id="btn-copy-server-script"
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-lg transition-all cursor-pointer ${
              copied
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Copier Script'}
          </button>
        </div>
      </div>

      {/* Guide/Quick Explanation cards for Server Optimizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Opti 1: Google BBR v1/v2</span>
          <p className="text-xs text-slate-400">
            BBR évalue en continu la bande passante réelle et ignore les collisions factices. Idéal pour garder un flux vidéo intact en streaming 4K rapide.
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-805/60">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Opti 2: Buffers TCP/UDP</span>
          <p className="text-xs text-slate-400">
            Maximise la taille des mémoires tampons socket d'écoute Linux (`rmem` / `wmem`) jusqu'à 64 Mo pour empêcher la congestion locale sous charge lourde de jeu.
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-805/60">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">Opti 3: Dynamic MTU</span>
          <p className="text-xs text-slate-400">
            Une marge adéquate ({config.mtu} octets) élimine la surcharge liée au double-encapsulage Wireguard, prévenant ainsi la gigue et le décalage (jitter).
          </p>
        </div>
      </div>

      {/* Terminal View */}
      <div className="relative">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span className="text-[10px] font-mono text-slate-400 uppercase">install_wireguard_gaming.sh</span>
        </div>

        <pre className="w-full bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-lg overflow-x-auto max-h-[400px] border border-slate-800 leading-relaxed shadow-inner">
          <code>{scriptContent}</code>
        </pre>
      </div>

      {/* Instructions on how to run */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4 font-sans space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Comment exécuter ce script sur votre VPS Cloud ?
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
          <li>Connectez-vous à votre serveur distant d'hébergement en SSH : <code className="text-slate-300 bg-slate-950 px-1 rounded font-mono">ssh root@votre_adresse_ip</code>.</li>
          <li>Créez le script : <code className="text-slate-300 bg-slate-950 px-1 rounded font-mono">nano install.sh</code> et collez les lignes ci-dessus.</li>
          <li>Rendez le script exécutable d'un clic : <code className="text-slate-300 bg-slate-950 px-1 rounded font-mono">chmod +x install.sh</code>.</li>
          <li>Lancez l'installation automatique sécurisée : <code className="text-slate-300 bg-slate-950 px-1 rounded font-mono">sudo ./install.sh</code>.</li>
          <li>
            <strong className="text-slate-200">Rappel Sécurité :</strong> Ouvrez bien le port UDP <strong className="text-white">{config.serverPort}</strong> sur le pare-feu de votre console de gestion Cloud (AWS SG, Oracle Security List, etc.) afin d'accueillir le trafic de jeu !
          </li>
        </ol>
      </div>
    </div>
  );
}

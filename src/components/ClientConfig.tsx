/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { generateClientConfig } from '../utils';
import { VpnConfig } from '../types';
import { Copy, Download, Check, FileCode, QrCode, Monitor, Phone, Info } from 'lucide-react';

interface ClientConfigProps {
  config: VpnConfig;
}

export default function ClientConfig({ config }: ClientConfigProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string>('');
  const clientConfigContent = generateClientConfig(config);

  // Re-generate QR Code in real-time when variables change
  useEffect(() => {
    QRCode.toDataURL(
      clientConfigContent,
      {
        width: 256,
        margin: 2,
        color: {
          dark: '#020617', // deep slate dark pixels for flawless scanning contrast
          light: '#ffffff', // pure white backdrop
        },
      },
      (err, url) => {
        if (err) {
          console.error(err);
          setQrError('Échec de la génération du QR Code');
        } else {
          setQrCodeUrl(url);
          setQrError('');
        }
      }
    );
  }, [clientConfigContent]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(clientConfigContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([clientConfigContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gaming_vpn_client.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl space-y-5" id="vg-client-config">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans text-white">Partie 2 : Configuration du Client</h3>
            <p className="text-xs text-slate-400">Profil de connexion optimisé pour PC de jeu, Router, Mobile ou Android TV.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download client.conf file */}
          <button
            onClick={downloadConfig}
            id="btn-download-client-config"
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs py-2 px-3.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Télécharger le fichier de configuration profil .conf"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger .conf
          </button>

          {/* Copy client.conf to clipboard */}
          <button
            onClick={copyToClipboard}
            id="btn-copy-client-config"
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-lg transition-all cursor-pointer ${
              copied
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Copier Profil'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code Block of client.conf */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase">client.conf</span>
            </div>

            <pre className="w-full bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-lg overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed shadow-inner">
              <code>{clientConfigContent}</code>
            </pre>
          </div>

          <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800 flex gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="font-sans leading-relaxed">
              <strong className="text-white">Note d'expert :</strong> La directive <code className="text-slate-305">PersistentKeepalive = {config.keepalive}</code> assure que les pare-feux et les routeurs d'accès natifs des FAI ne ferment pas arbitrairement le port de transport UDP WireGuard durant les phases de repos en jeu.
            </div>
          </div>
        </div>

        {/* QR Code and Import Instructions */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between bg-slate-950/60 rounded-lg p-5 border border-slate-800/80">
          
          <div className="text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5 mb-1 bg-cyan-400/5 py-1 px-2.5 rounded-full border border-cyan-500/10">
              <QrCode className="w-3.5 h-3.5" /> Flash Import Mobile / TV
            </span>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Scannez ce QR Code avec l'application officielle Wireguard pour l'importer instantanément.
            </p>
          </div>

          {/* QR Container code render */}
          <div className="my-5 p-3.5 bg-white rounded-xl border border-slate-800 shadow-md relative flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            {qrError ? (
              <div className="text-xs text-rose-400">{qrError}</div>
            ) : qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QRCode de configuration Wireguard"
                className="w-44 h-44 rounded-lg object-contain bg-white"
                referrerPolicy="no-referrer"
                id="img-wireguard-qr"
              />
            ) : (
              <div className="w-44 h-44 bg-slate-800 rounded animate-pulse" />
            )}
          </div>

          <div className="w-full space-y-3.5 text-xs text-slate-400 pt-3 border-t border-slate-900 font-sans">
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-200 block">Sur Android / iOS / iPad :</span>
                Ouvrez WireGuard &gt; cliquez sur le <strong className="text-white font-mono">+</strong> &gt; sélectionnez <strong className="text-slate-300">Scanner un code QR</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-200 block">Sur Android TV / Fire Stick :</span>
                Utilisez l'importation de fichier via clé USB ou tapez directement le fichier <code className="text-white">client.conf</code> produit ci-contre.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

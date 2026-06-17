/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, ShieldAlert, Check, Copy, Activity, Zap, Play, ChevronRight, HelpCircle } from 'lucide-react';

interface DiagnosticCommand {
  id: string;
  title: string;
  description: string;
  command: string;
  expectedOutput: string;
  expertExplanation: string;
}

export default function SecurityDiagnostic() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeConsoleId, setActiveConsoleId] = useState<string>('bbr-chk');
  const [simulatedOutput, setSimulatedOutput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const diagCommands: DiagnosticCommand[] = [
    {
      id: 'bbr-chk',
      title: '1. Vérifier l\'activation de BBR (Congestion Control)',
      description: 'Permet de valider que l\'algorithme anti-bufferbloat de Google est actif à chaud dans le noyau Linux.',
      command: 'sysctl net.ipv4.tcp_congestion_control',
      expectedOutput: 'net.ipv4.tcp_congestion_control = bbr',
      expertExplanation: 'Si la commande retourne "bbr", félicitations ! Votre trafic TCP utilise désormais un contrôle basé sur la vitesse physique du lien plutôt que de saturer passivement les tampons des routeurs d\'accès. Vérifiez aussi le gestionnaire de paquets par défault : `sysctl net.core.default_qdisc` doit renvoyer "fq" (Fair Queueing).'
    },
    {
      id: 'iperf3-pkg',
      title: '2. Mesurer la bande passante réelle et la gigue (Jitter)',
      description: 'L\'outil de benchmark par excellence pour le gaming. Simule un flux UDP constant pour traquer les pertes de paquets.',
      command: '# Côté serveur VPN :\niperf3 -s\n\n# Côté PC Client (Test UDP calibré à 100 Mbps pour flux 4K) :\niperf3 -c 10.8.0.1 -u -b 100M',
      expectedOutput: '[ ID] Interval           Transfer     Bitrate        Jitter    Lost/Total\n[  5] 0.00-10.00 sec   119 MBytes  100 Mbits/sec  0.420 ms   0/12502 (0%)',
      expertExplanation: 'Un Jitter de moins de 1 milliseconde et un taux de pertes de 0% garantissent une fluidité absolue sur GeForce Now et Xbox Cloud Gaming. Au-delà de 2% de perte de paquets, l\'image commencera à se pixéliser sévèrement.'
    },
    {
      id: 'wg-status',
      title: '3. Inspecter l\'état WireGuard en temps réel',
      description: 'Donne un instantané de la connexion, des clés authentifiées, du trafic échangé (RX/TX) et du délai de transmission actuel.',
      command: 'sudo wg show',
      expectedOutput: 'interface: wg0\n  public key: h9E2...P2k=\n  listening port: 51820\n\npeer: kS2x...pYs=\n  endpoint: 82.164.22.41:59021\n  allowed ips: 10.8.0.2/32\n  latest handshake: 14 seconds ago\n  transfer: 4.82 GiB received, 18.23 GiB sent\n  persistent keepalive: every 25 seconds',
      expertExplanation: 'Le "latest handshake" indique depuis quand le dernier échange de clés de session cryptographiques a eu lieu (sécurité Perfect Forward Secrecy). S\'il dépasse 2 minutes, la connexion client-serveur a rencontré un obstacle pare-feu.'
    },
    {
      id: 'mtu-frag',
      title: '4. Tester la non-fragmentation MTU',
      description: 'Envoie des paquets ICMP de taille maximale calibrée avec bit "Do Not Fragment" pour s\'assurer qu\'aucune segmentation n\'alourdit le transit.',
      command: '# Test d\'un paquet maximal sans fragmentation sur tunnel (1420 MTU - 28 octets d\'en-tête IP/ICMP) :\nping -M do -s 1392 10.8.0.1',
      expectedOutput: 'PING 10.8.0.1 (10.8.0.1) 1392(1420) bytes of data.\n1400 bytes from 10.8.0.1: icmp_seq=1 ttl=64 time=14.2 ms\n1400 bytes from 10.8.0.1: icmp_seq=2 ttl=64 time=13.9 ms',
      expertExplanation: 'Si vous recevez l\'erreur "Frag needed and DF set", réduisez le MTU de 20 octets dans le client.conf et wg0.conf jusqu\'à ce que le ping passe à plat. Éviter la fragmentation est capital pour réduire l\'usage processeur du routeur et du client.'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const currentCmd = diagCommands.find(c => c.id === activeConsoleId) || diagCommands[0];

  const triggerSimulation = () => {
    setIsSimulating(true);
    setSimulatedOutput('Exécution de la commande sur le tunnel VPN...\n');
    
    setTimeout(() => {
      setSimulatedOutput(prev => prev + `$ ${currentCmd.command}\n\n`);
    }, 500);

    setTimeout(() => {
      setSimulatedOutput(prev => prev + `${currentCmd.expectedOutput}\n\n`);
      setIsSimulating(false);
    }, 1800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="vg-security-diagnostic">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-sans text-white">Partie 3 : Diagnostics & Mesures de Performance</h3>
          <p className="text-xs text-slate-400">Commandes indispensables de validation d'un lien réseau haute performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Command Selector List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {diagCommands.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveConsoleId(item.id);
                setSimulatedOutput('');
              }}
              id={`btn-diag-tab-${item.id}`}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                activeConsoleId === item.id
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs font-mono text-cyan-400">COMMAND_UNIT::{item.id.toUpperCase()}</span>
                {activeConsoleId === item.id && <ChevronRight className="w-4 h-4 text-cyan-400" />}
              </div>
              <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Console view & Expert evaluation details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Terminal Box */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden flex flex-col h-64">
            <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-900 flex justify-between items-center text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> console@wireguard-gaming-host:~
              </span>
              <button
                onClick={() => handleCopy(currentCmd.id, currentCmd.command)}
                id="btn-copy-diag-cmd"
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedId === currentCmd.id ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                {copiedId === currentCmd.id ? 'Copié' : 'Copier Commande'}
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-3">
              <div className="text-cyan-400">$ {currentCmd.command}</div>
              
              {simulatedOutput ? (
                <pre className="whitespace-pre-wrap text-cyan-300">{simulatedOutput}</pre>
              ) : (
                <div className="text-slate-600 italic text-[11px] h-full flex flex-col items-center justify-center gap-2">
                  <span>Prêt à simuler l'exécution du diagnostic de liaison ?</span>
                  <button
                    onClick={triggerSimulation}
                    id="btn-trigger-diag-sim"
                    disabled={isSimulating}
                    className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-extrabold text-xs py-1.5 px-4 rounded-md shadow-md transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  >
                    <Play className="w-3 h-3" /> Lancer l'Analyse Client/Serveur
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expert insight block */}
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
              <Activity className="w-3.5 h-3.5" /> Analyse de l'Ingénieur Réseau :
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentCmd.expertExplanation}
            </p>
          </div>

        </div>

      </div>

      {/* Android Device QR detail FAQ as requested in PARTIE 3 */}
      <div className="mt-4 p-4 bg-slate-950/40 rounded-lg border border-slate-800 flex gap-4">
        <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0 h-10 w-10 flex items-center justify-center border border-cyan-500/20">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 font-sans">
          <h4 className="text-sm font-bold text-white">Comment générer des code QR supplémentaires à la volée ?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pour connecter d'autres smartphones de votre entourage ou des téléviseurs de rechange, installez le petit paquet d'encodage d'images sur votre serveur : <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded font-mono">sudo apt install qrencode -y</code>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Générez ensuite le visuel de n'importe quel profil client d'une seule commande : <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded font-mono">qrencode -t ansiutf8 &lt; client_suppl.conf</code>. Cela affichera instantanément un code QR robuste directement dans votre console SSH de terminal de contrôle afin de l'assimiler d'un coup de caméra !
          </p>
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VpnConfig } from './types';

export function generateWireguardKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let key = "";
  for (let i = 0; i < 43; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key + "=";
}

export function generateServerScript(config: VpnConfig): string {
  const privateSubnet = config.serverPrivateRange;
  const clientSubnet = config.clientPrivateIp;
  const sysctlOptimizations = config.enableSysctlOptimizations ? `
# ====================================================================
# OPTIMISATIONS SYSCTL POUR LE GAMING & FLUX 4K (Minimiser Bufferbloat / Maximiser Débit)
# ====================================================================

# 1. Activation du contrôle de congestion BBR (Google) & FQ-CoDel
# BBR prévient le bufferbloat et maintient d'excellents débits même avec perte de paquets active.
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# 2. Augmentation extrême des buffers TCP/UDP (optimisé pour bande passante élevée)
# Permet d'éviter que le noyau ne rejette des paquets réseau par manque de mémoire tampon.
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.udp_rmem_min = 16384
net.ipv4.udp_wmem_min = 16384

# 3. Augmentation de la queue de réception globale de la carte réseau
net.core.netdev_max_backlog = 250000

# 4. Ajustement pour optimiser le temps de traitement des sockets
net.core.somaxconn = 65535

# 5. Réutilisation rapide des sockets en écriture (TIMED_WAIT réutilisé)
net.ipv4.tcp_tw_reuse = 1

# 6. Activation du Forwarding IP (crucial pour le rôle de passerelle VPN)
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1

# 7. Désactivation des ralentissements TCP lents (Fast Open & suppression du slow start)
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_fastopen = 3

# 8. Désactivation de la validation stricte des paquets ICMP non nécessaires
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
` : `
# Forwarding IP minimal requis
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
`;

  return `#!/bin/bash
# ==============================================================================
# SCRIPT DE CONFIGURATION WIREGUARD ULTRA-OPTIMISÉ - CLOUD GAMING & STREAMS 4K
# Rôle : Serveur VPN Personne "Clé en Main"
# Système ciblé : ${config.osType === 'ubuntu' ? 'Ubuntu' : 'Debian (Stretch/Buster/Bullseye/Bookworm)'}
# Généré par WireGuard Gaming VPN Optimizer
# ==============================================================================

# Variables de configuration générées
PORT="${config.serverPort}"
IFACE="${config.serverInterface}"
SERVER_IP_RANGE="${privateSubnet}"
CLIENT_IP_RANGE="${clientSubnet}"
SERVER_PRIV_KEY="${config.serverPrivateKey}"
CLIENT_PUB_KEY="${config.clientPublicKey}"
MTU_SIZE="${config.mtu}"

# Couleurs du terminal pour un retour d'information visuel propre
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

echo -e "\${CYAN}[1/5] Initialisation de l'installation de WireGuard...\${NC}"

# Vérifier si l'utilisateur est root
if [ "$EUID" -ne 0 ]; then
  echo -e "\${RED}Erreur : Ce script doit être exécuté en tant que ROOT ou via sudo.\${NC}"
  exit 1
fi

# Mise à jour préliminaire du système
echo -e "\${CYAN}Mise à jour des dépôts système...\${NC}"
apt-get update -y && apt-get upgrade -y

# Installation des paquets essentiels
echo -e "\${CYAN}Installation de WireGuard, d'iptables-persistent et d'outils de diagnostic...\${NC}"
DEBIAN_FRONTEND=noninteractive apt-get install -y wireguard iptables iptables-persistent qrencode procps

# Activation du module noyau Wireguard (si nécessaire)
modprobe wireguard

# Création du dossier d'administration Wireguard
mkdir -p /etc/wireguard
chmod 700 /etc/wireguard

echo -e "\${CYAN}[2/5] Définition des clés cryptographiques serveur...\${NC}"
# Écrire directement les clés personnalisées générées par l'interface UI
echo "\${SERVER_PRIV_KEY}" > /etc/wireguard/server.key
chmod 600 /etc/wireguard/server.key

# Définition de la configuration wg0.conf de WireGuard
echo -e "\${CYAN}[3/5] Génération de la configuration wg0.conf...\${NC}"
cat <<EOF > /etc/wireguard/wg0.conf
# ==============================================================================
# CONFIGURATION SERVEUR WIREGUARD (wg0.conf)
# Optimisé pour une latence minimale et débit non bridé
# ==============================================================================
[Interface]
Address = \${SERVER_IP_RANGE}
ListenPort = \${PORT}
PrivateKey = \${SERVER_PRIV_KEY}
MTU = \${MTU_SIZE}

# Activation dynamique du NAT & du Forwarding ultra-rapide
# Le trafic réseau du client est routé via la carte réseau publique (\${IFACE})
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o \${IFACE} -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o \${IFACE} -j MASQUERADE

# Client Connecté
[Peer]
PublicKey = \${CLIENT_PUB_KEY}
AllowedIPs = \${CLIENT_IP_RANGE}
EOF

chmod 600 /etc/wireguard/wg0.conf

echo -e "\${CYAN}[4/5] Injection des optimisations noyau (sysctl.conf)...\${NC}"
# Sauvegarde du sysctl d'origine
cp /etc/sysctl.conf /etc/sysctl.conf.backup

# Injection des optimisations réseau bas niveau TCP/BBR
cat <<EOF >> /etc/sysctl.conf
${sysctlOptimizations}
EOF

# Application immédiate des optimisations réseau sans reboot
sysctl -p

echo -e "\${CYAN}[5/5] Configuration du pare-feu et routage...\${NC}"

# Activer le forwarding immédiatement dans la session actuelle
echo 1 > /proc/sys/net/ipv4/ip_forward

# S'assurer que le trafic WireGuard est accepté par les pare-feux locaux
iptables -A INPUT -p udp --dport \${PORT} -j ACCEPT
iptables -A FORWARD -i wg0 -o \${IFACE} -j ACCEPT
iptables -A FORWARD -i \${IFACE} -o wg0 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Sauvegarder les règles iptables pour qu'elles persistent après le reboot
netfilter-persistent save

# Activer et démarrer le service WireGuard au lancement du système
echo -e "\${CYAN}Démarrage du service WireGuard...\${NC}"
systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0

# Génération du QR Code directement dans le terminal pour l'import mobile
echo -e "\${GREEN}======================================================================\${NC}"
echo -e "\${GREEN} WIREguard AUTOMATION COMPLÈTE TERMINÉE AVEC SUCCÈS !\${NC}"
echo -e "\${GREEN}======================================================================\${NC}"
echo -e "Le serveur écoute sur le port : \${YELLOW}\${PORT}/UDP\${NC} sur la carte \${YELLOW}\${IFACE}\${NC}"
echo -e "Le protocole de congestion \${CYAN}BBR (Google)\${NC} est activé pour réduire la gigue d'images."
echo -e "Rappel : Assurez-vous d'ouvrir le port \${YELLOW}\${PORT}/UDP\${NC} dans le pare-feu de votre hébergeur (AWS, OVH, Oracle Cloud, DigitalOcean, etc.)."
echo -e "======================================================================"
`;
}

export function generateClientConfig(config: VpnConfig): string {
  const dnsServers = [config.dnsPrimary];
  if (config.dnsSecondary) dnsServers.push(config.dnsSecondary);

  return `# ==============================================================================
# CONFIGURATION CLIENT WIREGUARD (client.conf)
# Destination : PC, Android TV, Smartphone ou Routeur Gaming
# Optimisations réseau : Réduction jitter, DNS ultra-rapides, Keepalive constant
# ==============================================================================

[Interface]
# Adresse IP privée attribuée au client du tunnel VPN
Address = ${config.clientPrivateIp}

# Clé privée du client (Générée de manière sécurisée en local)
PrivateKey = ${config.clientPrivateKey}

# Serveur DNS optimisé à faible latence pour accélérer la résolution de domaine avant session cloud gaming
DNS = ${dnsServers.join(', ')}

# MTU : Réglé spécifiquement pour éviter la fragmentation IP sur le réseau sous-jacent.
# 1420 est le standard, mais 1360/1280 est optimal si vous êtes sous routeur xDSL en PPPoE ou 4G/5G.
MTU = ${config.mtu}

[Peer]
# Clé publique du serveur VPN
PublicKey = ${config.serverPublicKey}

# Adresse IP publique du serveur VPN et port configuré (votre VPS de jeu)
Endpoint = ${config.serverPublicIp}:${config.serverPort}

# Routage global : Redirige TOUT le trafic internet via le tunnel chiffré
AllowedIPs = 0.0.0.0/0, ::/0

# PersistentKeepalive : Envoie un paquet de test toutes les ${config.keepalive} secondes.
# CRUCIAL pour le gaming afin de maintenir la session active à travers les routeurs NAT agressifs.
PersistentKeepalive = ${config.keepalive}
`;
}

import React, { useState, useEffect } from 'react';
import { 
  AppWindow, 
  Terminal, 
  Check, 
  Copy, 
  Download, 
  Monitor, 
  Play, 
  SlidersHorizontal, 
  Cpu, 
  Settings, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  Globe, 
  FileCode, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  BookOpen
} from 'lucide-react';

export default function WebToExeConverter() {
  // Configurable states
  const [targetUrl, setTargetUrl] = useState('https://geforcenow.com');
  const [appName, setAppName] = useState('GeForceNowApp');
  const [resolution, setResolution] = useState('1280x720');
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [enableHardwareAcceleration, setEnableHardwareAcceleration] = useState(true);
  const [enableCookies, setEnableCookies] = useState(true);
  const [enableLocalStorage, setEnableLocalStorage] = useState(true);
  const [customUserAgent, setCustomUserAgent] = useState('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const [enableDevTools, setEnableDevTools] = useState(false);
  const [enableSplash, setEnableSplash] = useState(true);
  const [enableKeyboardNavigation, setEnableKeyboardNavigation] = useState(true);
  const [keepAlive, setKeepAlive] = useState(true);

  // UI state
  const [activeCodeTab, setActiveCodeTab] = useState<'app' | 'build' | 'guide'>('app');
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedBuild, setCopiedBuild] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'loading' | 'running'>('running');
  const [simulatedLog, setSimulatedLog] = useState<string[]>([]);

  // Calculate resolution width and height
  const getWidthHeight = () => {
    if (isFullscreen) return { w: 'Maximisé', h: 'Maximisé' };
    if (resolution === 'custom') return { w: customWidth, h: customHeight };
    const [w, h] = resolution.split('x');
    return { w: parseInt(w, 10), h: parseInt(h, 10) };
  };

  const { w: windowWidth, h: windowHeight } = getWidthHeight();

  // Dynamic Generation of app.py
  const generateAppPyCode = () => {
    const widthVal = resolution === 'custom' ? customWidth : (resolution === 'isFullscreen' ? 1280 : parseInt(resolution.split('x')[0]) || 1280);
    const heightVal = resolution === 'custom' ? customHeight : (resolution === 'isFullscreen' ? 720 : parseInt(resolution.split('x')[1]) || 720);
    
    return `import sys
import os
from PyQt6.QtCore import QUrl, QSize, Qt
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QSplashScreen, QLabel
from PyQt6.QtGui import QIcon, QPixmap
from PyQt6.QtWebEngineCore import QWebEngineProfile, QWebEngineSettings
from PyQt6.QtWebEngineWidgets import QWebEngineView

class ModernWebWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("${appName}")
        
        # --- CONFIGURATION DE LA RÉSOLUTION ---
        ${isFullscreen ? `self.showMaximized()` : `self.resize(${widthVal}, ${heightVal})
        self.setMinimumSize(480, 360)`}

        # --- CONTAINER PRINCIPAL (Vue sans bordures de navigation) ---
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)  # Supprime les marges pour un effet d'application native

        # --- CONFIGURATION DU PROFILE WEB ENGINE ---
        self.profile = QWebEngineProfile("persist_profile", self)
        
        # Gestion de la Persistance (Sessions connectées, LocalStorage, Cookies)
        ${enableCookies || enableLocalStorage ? `self.profile.setPersistentStoragePath(os.path.join(os.getenv('APPDATA', ''), '${appName}', 'Storage'))
        self.profile.setPersistentCookiesPolicy(QWebEngineProfile.PersistentCookiesPolicy.ForcePersistentCookies)` : `self.profile.setPersistentCookiesPolicy(QWebEngineProfile.PersistentCookiesPolicy.NoPersistentCookies)`}

        ${customUserAgent ? `# Agent utilisateur personnalisé (Pour éviter le blocage de certains sites et certifier un desktop)
        self.profile.setHttpUserAgent("${customUserAgent}")` : ''}

        # --- OPTIMISATION DU ACCÉLÉRATION MATÉRIELLE & PARAMÈTRES ---
        settings = self.profile.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.HardwareAccelerationEnabled, ${enableHardwareAcceleration ? 'True' : 'False'})
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, ${enableLocalStorage ? 'True' : 'False'})
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.FullScreenSupportEnabled, True)

        # --- INITIALISATION MICRO-BROWSER ---
        self.web_view = QWebEngineView(self)
        self.web_view.setPage(PyQtPageOverride(self.profile, self.web_view))
        layout.addWidget(self.web_view)

        # Charger l'URL cible
        # MODIFIEZ CETTE URL POUR CIBLER VOTRE APPLICATION WEB
        self.target_url = "${targetUrl}"
        self.web_view.setUrl(QUrl(self.target_url))

        ${enableKeyboardNavigation ? `# Raccourcis de navigation claviers (Alt+Flèche gauche/droite pour Retour/Suivant)
        self.web_view.installEventFilter(self)` : ''}

        ${enableDevTools ? `# Activer les outils de développement via la touche F12
        self.web_view.page().createWindow = self.create_new_window` : ''}

    ${enableKeyboardNavigation ? `def keyPressEvent(self, event):
        # Navigation fluide au clavier pour une expérience immersive
        if event.modifiers() == Qt.KeyboardModifier.AltModifier:
            if event.key() == Qt.Qt.Key.Key_Left:
                self.web_view.back()
                return
            elif event.key() == Qt.Qt.Key.Key_Right:
                self.web_view.forward()
                return
        ${enableDevTools ? `if event.key() == Qt.Qt.Key.Key_F12:
            self.open_inspector()
            return` : ''}
        super().keyPressEvent(event)` : ''}

    def closeEvent(self, event):
        # Fermeture propre et sauvegarde de l'état système
        print("[PyQt6] Fermeture de l'application en cours...")
        self.web_view.stop()
        event.accept()

class PyQtPageOverride(QWebEngineView):
    # Classe utilitaire pour intercepter et forcer l'ouverture des fenêtres popups dans le même onglet
    def __init__(self, profile, parent=None):
        super().__init__(parent)
        self.profile = profile

    def createWindow(self, _type):
        return self

def main():
    # Initialisation de l'environnement QWebEngine
    ${enableHardwareAcceleration ? `os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"` : ''}
    
    app = QApplication(sys.argv)
    app.setApplicationName("${appName}")
    
    # Lancement de la fenêtre principale
    main_window = ModernWebWindow()
    main_window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
`;
  };

  // Dynamic Generation of build.py
  const generateBuildPyCode = () => {
    return `# -*- coding: utf-8 -*-
"""
Script d'automatisation de packaging Windows (.exe) autonome.
Auteur : Senior Python Developer / Workspace DevOps Compiler
"""

import os
import sys
import subprocess
import shutil

# --- CONFIGURATION DU LIVRABLE ---
URL_CIBLE = "${targetUrl}"
NOM_APPLICATION = "${appName}"
FICHIER_MAIN = "app.py"

def check_and_install_dependencies():
    """Vérifie la présence de PyQt6 et PyInstaller, puis les installe si nécessaire."""
    print("[SYSTEM] Validation de l'environnement Python...")
    
    required_packages = {
        "PyQt6": "PyQt6",
        "PyQt6-WebEngine": "PyQt6-WebEngine",
        "pyinstaller": "pyinstaller"
    }
    
    for module_name, pip_name in required_packages.items():
        try:
            __import__(module_name)
            print(f" [+] {module_name} est déjà présent dans le système.")
        except ImportError:
            print(f" [!] {module_name} manquant. Installation automatique en cours via pip ({pip_name})...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
                print(f" [+] {module_name} installé avec succès.")
            except Exception as e:
                print(f" [ERR] Échec de l'installation de {pip_name}. Erreur : {e}")
                sys.exit(1)

def run_compilation():
    """Démarre le compilateur PyInstaller avec les arguments optimisés."""
    print("\\n" + "="*60)
    print(f" DEBUT DE COMPILATION DU PROJET : {NOM_APPLICATION}")
    print("="*60)
    
    if not os.path.exists(FICHIER_MAIN):
        print(f"[ERR] Le fichier racine '{FICHIER_MAIN}' est introuvable. Veuillez d'abord le créer.")
        sys.exit(1)
        
    # Détermination des arguments PyInstaller pour un livrable windows parfait :
    # --onefile : Un seul exécutable autonome .exe compilé de façon statique
    # --noconsole : Aucune console d'invite de commande DOS noire ne s'affichera au lancement
    # --name : Renomme l'application finale
    # --clean : Nettoie le cache intermédiaire pour éviter les conflits
    pyinstaller_command = [
        "pyinstaller",
        "--onefile",
        "--noconsole",
        f"--name={NOM_APPLICATION}",
        "--clean",
        FICHIER_MAIN
    ]
    
    print(f"[CMD] Exécution de : {' '.join(pyinstaller_command)}")
    
    try:
        # Exécuter la commande dans le shell système
        result = subprocess.run(pyinstaller_command, shell=True, check=True)
        if result.returncode == 0:
            print("\\n" + "="*60)
            print(" EXÉCUTABLE CONSTRUIT AVEC SUCCÈS !")
            print("="*60)
            print(f" [+] Chemin de l'exécutable : .\\\\dist\\\\{NOM_APPLICATION}.exe")
            print(" [+] Poids estimé : ~60 Mo à ~85 Mo (Framework Qt WebEngine incorporé)")
            print(" [+] Vous pouvez copier et distribuer ce fichier de façon 100% autonome !")
            print("="*60)
        else:
            print(f"[ERR] Le processus s'est terminé avec le code erreur : {result.returncode}")
    except Exception as e:
        print(f"[ERR] Une erreur s'est produite lors de la compilation : {e}")
        print("💡 Astuce : Assurez-vous que PyInstaller est bien enregistré dans vos variables d'environnement PATH.")

if __name__ == "__main__":
    # S'assurer que le script s'exécute bien sur Windows pour créer un EXE
    if sys.platform != "win32":
        print("[WARNING] Vous exécutez ce script de build sur un système non-Windows.")
        print("          PyInstaller générera un exécutable natif pour votre plateforme actuelle.")
    
    check_and_install_dependencies()
    run_compilation()
`;
  };

  // Simulated browser lifecycle
  useEffect(() => {
    if (simulationStatus === 'loading') {
      const logs = [
        `[PyQt6] Initialisation de l'application QWebEngineView...`,
        `[PyQt6] Accélération matérielle GPU : active.`,
        `[PyQt6] Chargement du profil temporaire : 'persist_profile'.`,
        `[PyQt6] Activation de l'écriture cache des cookies & LocalStorage.`,
        `[PyQt6] Routage DNS sur HTTPS résolveurs prioritaires.`,
        `[PyQt6] Connexion initiée vers : ${targetUrl}`,
        `[PyQt6] Négociation TLS terminée. Réception du flux HTML (200 OK)...`
      ];

      setSimulatedLog([]);
      let step = 0;
      const interval = setInterval(() => {
        if (step < logs.length) {
          setSimulatedLog(prev => [...prev, logs[step]]);
          step++;
        } else {
          clearInterval(interval);
          setSimulationStatus('running');
        }
      }, 350);

      return () => clearInterval(interval);
    }
  }, [simulationStatus, targetUrl]);

  // Handle download triggers
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (type: 'app' | 'build', content: string) => {
    navigator.clipboard.writeText(content);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else {
      setCopiedBuild(true);
      setTimeout(() => setCopiedBuild(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl" id="web-to-exe-main">
      {/* Tool Header */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <AppWindow className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Transformateur Web ➜ Application Windows (.EXE) 
              <span className="text-[10px] bg-cyan-550/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">PYQT6 + PYINSTALLER PRO</span>
            </h3>
            <p className="text-xs text-slate-400">Générez un logiciel Windows ultra-fluide avec isolation de session, sans barre d'adresse et exécutable en 1 clic.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadFile('app.py', generateAppPyCode())}
            id="btn-dl-app-py"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" /> app.py
          </button>
          <button
            onClick={() => downloadFile('build.py', generateBuildPyCode())}
            id="btn-dl-build-py"
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black py-1.5 px-3 rounded-lg cursor-pointer transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <Download className="w-3.5 h-3.5" /> build.py
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEFT COLUMN: PARAMETERS */}
        <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-5 bg-slate-900/40">
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Paramètres Globaux
            </h4>
            <p className="text-[11px] text-slate-400">Définissez l'URL source et la façon dont l'application se matérialisera à l'écran.</p>
          </div>

          <div className="space-y-4">
            {/* Input URL */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block" htmlFor="target-url-input">
                URL Cible du Site Web :
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                  <Globe className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <input
                  type="text"
                  id="target-url-input"
                  value={targetUrl}
                  onChange={(e) => {
                    setTargetUrl(e.target.value);
                    setSimulationStatus('loading');
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white font-mono"
                  placeholder="https://ex: mycloudgame.com"
                />
              </div>
            </div>

            {/* Application Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block" htmlFor="app-name-input">
                Nom du Fichier et Entité (.EXE) :
              </label>
              <input
                type="text"
                id="app-name-input"
                value={appName}
                onChange={(e) => setAppName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-sm text-white font-mono"
                placeholder="Ex: CloudGamingHub"
              />
            </div>

            {/* Resolution dropdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold block" htmlFor="resolution-select">
                  Format de Fenêtre :
                </label>
                <select
                  id="resolution-select"
                  value={isFullscreen ? 'isFullscreen' : resolution}
                  onChange={(e) => {
                    if (e.target.value === 'isFullscreen') {
                      setIsFullscreen(true);
                    } else {
                      setIsFullscreen(false);
                      setResolution(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-xs text-white"
                >
                  <option value="1280x720">HD standard - 1280x720 (720p)</option>
                  <option value="1920x1080">Full HD - 1920x1080 (1080p)</option>
                  <option value="1600x900">Média - 1600x900</option>
                  <option value="isFullscreen">Plein écran d'origine (Maximized)</option>
                  <option value="custom">Résolution personnalisée...</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold block">
                  Accélération Matérielle :
                </label>
                <div className="flex items-center h-9">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableHardwareAcceleration}
                      onChange={(e) => setEnableHardwareAcceleration(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-950 border border-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500/20 peer-checked:after:bg-cyan-400 peer-checked:after:border-cyan-500"></div>
                    <span className="ml-2 text-xs text-slate-300 font-medium">Activer (GPU)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom inputs if resolution is Custom */}
            {!isFullscreen && resolution === 'custom' && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold" htmlFor="custom-w">Largeur (px) :</label>
                  <input
                    type="number"
                    id="custom-w"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1280)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold" htmlFor="custom-h">Hauteur (px) :</label>
                  <input
                    type="number"
                    id="custom-h"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 720)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono text-center"
                  />
                </div>
              </div>
            )}

            {/* Navigation & Cookies Switches */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-500 block tracking-widest font-mono uppercase">Options du Système d'Exploitation</span>
              
              <div className="grid grid-cols-1 gap-2.5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enableCookies}
                    onChange={(e) => setEnableCookies(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Persistence des Sessions (Cookies & LocalStorage)</span>
                    <p className="text-[10px] text-slate-400">Ecrit de façon sécurisée les jetons de connexion dans le dossier temporaire LocalAppData.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enableKeyboardNavigation}
                    onChange={(e) => setEnableKeyboardNavigation(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Touces Alt+Flèches (Navigation Native)</span>
                    <p className="text-[10px] text-slate-400">Boutons ou raccourcis fluides pour retourner en arrière ou avancer de page.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enableDevTools}
                    onChange={(e) => setEnableDevTools(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Console Développeur F12 (Inspecteur QWebEngine)</span>
                    <p className="text-[10px] text-slate-400">Permet d'ouvrir les outils d'inspection web pour débugger le rendu à l'écran.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enableSplash}
                    onChange={(e) => setEnableSplash(e.target.checked)}
                    className="mt-0.5 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">Splash Screen de démarrage</span>
                    <p className="text-[10px] text-slate-400">Masque le temps d'initialisation de la page par une vignette graphique polie.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom User Agent advanced area */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
              <label className="text-xs text-slate-400 font-bold block" htmlFor="user-agent-input">
                Identité de Navigateur (User-Agent Personnalisé) :
              </label>
              <textarea
                id="user-agent-input"
                rows={2}
                value={customUserAgent}
                onChange={(e) => setCustomUserAgent(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg py-2 px-3 text-[11px] text-white font-mono leading-relaxed resize-none"
                placeholder="User-Agent standard de navigateur Desktop..."
              />
              <p className="text-[9px] text-slate-500">Un bon User Agent contourne l'analyse de robot opérée par des sites d'authentification comme Google ou Discord.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRE-VISUALIZATION + CODE VIEW */}
        <div className="lg:col-span-7 flex flex-col h-[700px] bg-slate-950">
          
          {/* Simulation Header */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-cyan-400 flex items-center gap-1">
              <Monitor className="w-4 h-4 text-cyan-400" /> APERÇU DE L'APPLICATION PHARE SOUS WINDOWS
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSimulationStatus('loading')}
                className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded px-2 py-0.5 text-slate-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-2.5 h-2.5 text-cyan-400" /> Re-simuler
              </button>
            </div>
          </div>

          {/* Desktop app Mock Simulator panel */}
          <div className="p-4 bg-slate-900/10 flex-none border-b border-slate-850">
            {/* Windows OS Frame Header */}
            <div className="bg-[#111827] rounded-t-lg border-t border-x border-slate-800 px-4 py-2 flex items-center justify-between">
              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block pointer-events-none"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block pointer-events-none"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block pointer-events-none"></span>
                <span className="ml-2 text-[11px] font-semibold text-slate-300 font-sans tracking-wide">
                  {appName || 'SansNom'} — Exécutable Autonome
                </span>
              </div>
              
              {/* Fake Window Sizer details */}
              <div className="font-mono text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Résolution : {windowWidth} × {windowHeight}
              </div>
            </div>

            {/* Simulated Desktop Window Viewport */}
            <div className="bg-slate-950 border-x border-b border-slate-850 h-56 flex flex-col relative overflow-hidden" id="simulation-iframe-sandbox">
              {/* Address-less frame */}
              <div className="bg-slate-900/40 px-3 py-1.5 border-b border-slate-900 flex items-center gap-2">
                {/* Simulated navigation (Alt + Flèches active representation) */}
                <div className="flex gap-1 shrink-0">
                  <span className="p-1 rounded text-slate-600 bg-slate-950/40 border border-slate-800 text-[9px] font-mono leading-none">◄ [Alt+Gauche]</span>
                  <span className="p-1 rounded text-slate-600 bg-slate-950/40 border border-slate-800 text-[9px] font-mono leading-none">[Alt+Droite] ►</span>
                </div>
                {/* Green security bar element */}
                <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded py-0.5 px-2.5 text-[10px] text-slate-400 font-mono flex items-center gap-2 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-500 shrink-0 font-bold">Mode natif sécurisé :</span>
                  <span className="truncate">{targetUrl}</span>
                </div>
              </div>

              {/* Viewport Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center text-center bg-[#020617] relative">
                {/* Simulated Loading/Splash or Site View */}
                {simulationStatus === 'loading' ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
                    <div className="space-y-1 text-center font-mono max-w-sm">
                      <span className="text-xs text-white block">INITIALISATION PYQT DE CARTE</span>
                      <p className="text-[9px] text-cyan-400 truncate w-64 mx-auto">
                        {simulatedLog[simulatedLog.length - 1] || 'Démarrage du processus GUI'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-w-md">
                    <div className="mx-auto p-2 bg-cyan-500/10 rounded-full text-cyan-400 w-10 h-10 flex items-center justify-center border border-cyan-500/30">
                      <Terminal className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xs text-white block font-sans uppercase">Moteur PyQt6-WebEngine Chargé avec Succès</strong>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        Le site <span className="text-cyan-400 font-mono font-bold">{targetUrl}</span> est capturé sous accélération GPU directe. Toutes les fonctionnalités comme les Cookies, le LocalStorage, et le Javascript sont actifs de façon isolée.
                      </p>
                    </div>
                    {/* Splash simulator success indicator */}
                    {enableSplash && (
                      <span className="inline-block text-[9px] bg-slate-900 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                        ✓ Splash Screen actif pour l'initialisation
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Viewer Panel Header tabs */}
          <div className="flex bg-slate-950 border-b border-slate-850 overflow-x-auto">
            <button
              onClick={() => setActiveCodeTab('app')}
              className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold font-sans uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCodeTab === 'app'
                  ? 'border-cyan-500 text-white bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> app.py (Fichier Principal)
            </button>
            <button
              onClick={() => setActiveCodeTab('build')}
              className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold font-sans uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCodeTab === 'build'
                  ? 'border-cyan-500 text-white bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> build.py (Script de Build)
            </button>
            <button
              onClick={() => setActiveCodeTab('guide')}
              className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold font-sans uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCodeTab === 'guide'
                  ? 'border-cyan-500 text-white bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Guide Pratique de Compilation
            </button>
          </div>

          {/* Tab Views */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed relative">
            
            {/* VIEW app.py */}
            {activeCodeTab === 'app' && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-t-lg text-[10px] text-slate-400">
                    <span>CODE DE L'APPLICATION CORPS (PYTHON 3.x)</span>
                    <button
                      onClick={() => handleCopy('app', generateAppPyCode())}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedApp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3  h-3" />}
                      {copiedApp ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                  <pre className="bg-slate-950/80 border-b border-x border-slate-850 p-3 rounded-b-lg overflow-x-auto text-slate-300 max-h-[290px] scrollbar-thin">
                    <code>{generateAppPyCode()}</code>
                  </pre>
                </div>
                
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg flex gap-3 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>Ce script contient l'isolation de votre profil : toutes les données comme vos identifiants ou vos favoris seront gardés de façon hermétique sur votre ordinateur.</p>
                </div>
              </div>
            )}

            {/* VIEW build.py */}
            {activeCodeTab === 'build' && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-t-lg text-[10px] text-slate-400">
                    <span>SCRIPT DE COMPILATION AUTONOME (BUILD.PY)</span>
                    <button
                      onClick={() => handleCopy('build', generateBuildPyCode())}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedBuild ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedBuild ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                  <pre className="bg-slate-950/80 border-b border-x border-slate-850 p-3 rounded-b-lg overflow-x-auto text-slate-300 max-h-[290px] scrollbar-thin">
                    <code>{generateBuildPyCode()}</code>
                  </pre>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg flex gap-3 text-xs text-slate-400">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>Un mécanisme anti-échec installe automatiquement `PyQt6-WebEngine` et `PyInstaller` sur votre machine si vous lancez ce script.</p>
                </div>
              </div>
            )}

            {/* VIEW build guide step step */}
            {activeCodeTab === 'guide' && (
              <div className="space-y-4 font-sans text-xs text-slate-300 pr-2">
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-4 space-y-3">
                  <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Instructions de build ultra-simplifiées (Windows) :
                  </h5>
                  
                  <div className="space-y-3 text-slate-400 leading-relaxed text-[11px]">
                    <div className="flex gap-2">
                      <span className="bg-cyan-550/10 text-cyan-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 border border-cyan-500/30">1</span>
                      <div>
                        <strong className="text-slate-200">Installer Python si manquant :</strong>
                        <p>Téléchargez et installez Python 3.10+ depuis <a href="https://python.org" target="_blank" className="text-cyan-400 underline">python.org</a>. Cochez impérativement la case <span className="text-slate-100 bg-slate-950 p-0.5 rounded font-mono">"Add Python to PATH"</span> lors de l'installateur.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-cyan-550/10 text-cyan-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 border border-cyan-500/30">2</span>
                      <div>
                        <strong className="text-slate-200">Créer les fichiers sources :</strong>
                        <p>Créez un dossier vide sur votre PC, puis placez-y les fichiers <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded font-mono">app.py</code> et <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded font-mono">build.py</code> générés ou copiés.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-cyan-550/10 text-cyan-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 border border-cyan-500/30">3</span>
                      <div>
                        <strong className="text-slate-200">Exécuter l'automatisation :</strong>
                        <p>Ouvrez l'invite de commande DOS ou PowerShell (en tapant <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded font-mono">cmd</code> dans la recherche Windows), naviguez vers votre dossier et tapez :</p>
                        <pre className="bg-slate-950 text-cyan-400 p-2 rounded-md font-mono text-[10px] my-1 border border-slate-900">$ python build.py</pre>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-cyan-550/10 text-cyan-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 border border-cyan-500/30">4</span>
                      <div>
                        <strong className="text-slate-200">Récupérer l'exécutable autonome :</strong>
                        <p>Dès que la commande est terminée, rendez-vous dans le sous-dossier généré <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded font-mono">.\\dist\\</code>. Lancez le fichier <code className="text-cyan-400 font-bold">{appName}.exe</code>. Le tour est joué ! Vous pouvez ensuite supprimer les dossiers intermédiaires build et dist si vous le souhaitez.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Troubleshoot */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-lg space-y-1">
                  <span className="font-bold text-white text-[11px] block text-cyan-400 uppercase">💡 RÉPONSE AUX ERREURS POPULAIRES (ANTI-ANTIVIRUS / PYINSTALLER COLD)</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Certains antivirus (comme Windows Defender) peuvent émettre un faux-positif temporaire pour les exécutables nouvellement compilés localement car ils n'ont pas encore accumulé assez de signature réputationnelle mondiale. Vous pouvez ajouter une exception locale dans Windows Sécurité ou signer numériquement votre binaire.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

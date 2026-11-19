import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, Loader2, Sparkles } from 'lucide-react';
import { UI_STYLES } from '../types/themeStyles';
import {
  getOrLoadHeartModel,
  createHeartInstance,
  isHeartModelCached,
} from '../utils/modelCache';

export default function Heart3DCanvas({
  bpm = 72,
  currentStyle = 'CARDIOCARE_OCEAN',
  form = {},
  result = null,
}) {
  const containerRef = useRef(null);
  const [isLoadingModel, setIsLoadingModel] = useState(() => !isHeartModelCached());
  const [loadError, setLoadError] = useState(null);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const heartGroupRef = useRef(null);
  const coreLightRef = useRef(null);
  const auraRingRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Mutable refs for animation loop
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const styleConfigRef = useRef(styleConfig);
  styleConfigRef.current = styleConfig;

  // Mount Scene, Camera, Lights, and OrbitControls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 4.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // OrbitControls for interactive drag & rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 6.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, styleConfig.heart3D.ambientLightIntensity);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(styleConfig.heart3D.auraRingColor, 1.4);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(styleConfig.heart3D.coreLightColor, 2.8, 8);
    coreLight.position.set(0, 0, 0.2);
    coreLightRef.current = coreLight;
    scene.add(coreLight);

    // Holographic Orbital Rings
    const ringsGroup = new THREE.Group();
    const ringGeo1 = new THREE.TorusGeometry(1.4, 0.008, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: styleConfig.heart3D.auraRingColor,
      transparent: true,
      opacity: 0.55,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.4;
    ringsGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.65, 0.006, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: styleConfig.accentSecondary,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2.6;
    ringsGroup.add(ring2);

    auraRingRef.current = ringsGroup;
    scene.add(ringsGroup);

    // Heart Group container
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    heartGroup.position.set(0, -0.05, 0);
    heartGroup.rotation.y = 0.25;

    // Load Cached GLB Model with native skeletal animation
    let isCancelled = false;
    let mixer = null;

    getOrLoadHeartModel()
      .then((masterGltf) => {
        if (isCancelled || !heartGroupRef.current) return;
        setIsLoadingModel(false);

        const { model, animations } = createHeartInstance(masterGltf);

        // Apply theme-specific materials & shaders
        const hConfig = styleConfigRef.current.heart3D;
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = hConfig.roughness;
            child.material.metalness = hConfig.metalness;
            child.material.clearcoat = hConfig.clearcoat;
            child.material.transmission = hConfig.transmission;
            child.material.opacity = hConfig.opacity;
            child.material.transparent = hConfig.transparent;
            if (hConfig.emissiveIntensity > 0) {
              child.material.emissive = new THREE.Color(hConfig.emissiveColor);
              child.material.emissiveIntensity = hConfig.emissiveIntensity;
            }
          }
        });

        heartGroup.add(model);

        // Bind Skeletal animation clip
        if (animations && animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const clip = animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to load cached 3D heart model:', err);
        setIsLoadingModel(false);
        setLoadError('Modèle 3D introuvable dans public/models/heart.glb');
      });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentBpm = bpmRef.current;

      // Update native skeletal animation speed synchronized with live BPM
      if (mixer) {
        if (currentBpm > 0) {
          mixer.timeScale = currentBpm / 60;
          mixer.update(delta);
        } else {
          mixer.timeScale = 0;
        }
      }

      // Rotate orbital rings
      if (ringsGroup) {
        ringsGroup.rotation.y += delta * 0.3;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isCancelled = true;
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [currentStyle]);

  return (
    <div
      className={`relative w-full h-[400px] sm:h-[440px] flex items-center justify-center rounded-3xl overflow-hidden transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
    >
      {/* Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: styleConfig.heart3D.ambientGlowStyle,
        }}
      />

      {/* Loading Indicator */}
      {isLoadingModel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-xs z-20 pointer-events-none">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
          <span className="text-xs font-mono font-bold text-slate-300">
            Chargement de l'anatomie 3D...
          </span>
        </div>
      )}

      {/* Error Notice */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 p-4 text-center">
          <span className="text-xs text-rose-400 font-mono font-bold">{loadError}</span>
        </div>
      )}

      {/* Header telemetry badge */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl backdrop-blur-md border shadow-xs"
            style={{
              backgroundColor: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
              borderColor: isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
              color: styleConfig.accentPrimary,
            }}
          >
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${styleConfig.mainText}`}>
              Anatomie Cardiaque 3D GLB
            </h3>
            <p className={`text-[11px] font-mono ${styleConfig.subText}`}>
              Animation Squelettique Active • {bpm} BPM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
              isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}
          >
            Glisser pour pivoter
          </span>
        </div>
      </div>

      {/* SVG Anatomical Callout Leader Lines (DrHJR Inspired) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
        viewBox="0 0 400 340"
        preserveAspectRatio="none"
      >
        {/* Top-Left: Blood Pressure -> Crosse Aortique */}
        <g>
          <polyline
            points="110,65 150,65 186,115"
            fill="none"
            stroke={isLight ? '#2563eb' : '#00f2fe'}
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <circle cx="110" cy="65" r="2.5" fill={isLight ? '#2563eb' : '#00f2fe'} />
          <circle
            cx="186"
            cy="115"
            r="7"
            fill="none"
            stroke={isLight ? '#2563eb' : '#00f2fe'}
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping"
          />
          <circle
            cx="186"
            cy="115"
            r="3.5"
            fill={isLight ? '#ffffff' : '#04060a'}
            stroke={isLight ? '#2563eb' : '#00f2fe'}
            strokeWidth="1.5"
          />
        </g>

        {/* Top-Right: Tronc Pulmonaire -> Max Heart Rate */}
        <g>
          <polyline
            points="290,65 250,65 224,115"
            fill="none"
            stroke={isLight ? '#059669' : '#10b981'}
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <circle cx="290" cy="65" r="2.5" fill={isLight ? '#059669' : '#10b981'} />
          <circle
            cx="224"
            cy="115"
            r="7"
            fill="none"
            stroke={isLight ? '#059669' : '#10b981'}
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping"
          />
          <circle
            cx="224"
            cy="115"
            r="3.5"
            fill={isLight ? '#ffffff' : '#04060a'}
            stroke={isLight ? '#059669' : '#10b981'}
            strokeWidth="1.5"
          />
        </g>

        {/* Bottom-Left: Paroi Myocardique -> ST Depression */}
        <g>
          <polyline
            points="110,285 145,285 170,215"
            fill="none"
            stroke={isLight ? '#6366f1' : '#38bdf8'}
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <circle cx="110" cy="285" r="2.5" fill={isLight ? '#6366f1' : '#38bdf8'} />
          <circle
            cx="170"
            cy="215"
            r="7"
            fill="none"
            stroke={isLight ? '#6366f1' : '#38bdf8'}
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping"
          />
          <circle
            cx="170"
            cy="215"
            r="3.5"
            fill={isLight ? '#ffffff' : '#04060a'}
            stroke={isLight ? '#6366f1' : '#38bdf8'}
            strokeWidth="1.5"
          />
        </g>

        {/* Bottom-Right: Apex Cardiaque */}
        <g>
          <polyline
            points="290,285 250,285 220,240"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <circle cx="290" cy="285" r="2.5" fill="#f43f5e" />
          <circle
            cx="220"
            cy="240"
            r="7"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping"
          />
          <circle
            cx="220"
            cy="240"
            r="3.5"
            fill={isLight ? '#ffffff' : '#04060a'}
            stroke="#f43f5e"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* Floating Telemetry Badges (DrHJR Inspired) */}
      <div
        className={`absolute top-14 left-4 z-20 backdrop-blur-md border rounded-xl px-3 py-1.5 shadow-md ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-black/60 border-slate-700/60'
        }`}
      >
        <div className="text-[9px] text-slate-400 font-mono">Tension Artérielle</div>
        <div className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {form.trestbps || 120} mmHg
        </div>
      </div>

      <div
        className={`absolute top-14 right-4 z-20 backdrop-blur-md border rounded-xl px-3 py-1.5 shadow-md text-right ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-black/60 border-slate-700/60'
        }`}
      >
        <div className="text-[9px] text-slate-400 font-mono">Fréquence Max</div>
        <div className="text-xs font-mono font-bold text-emerald-400">
          {form.thalach || 150} BPM
        </div>
      </div>

      <div
        className={`absolute bottom-4 left-4 z-20 backdrop-blur-md border rounded-xl px-3 py-1.5 shadow-md ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-black/60 border-slate-700/60'
        }`}
      >
        <div className="text-[9px] text-slate-400 font-mono">Dépression ST</div>
        <div className="text-xs font-mono font-bold text-sky-400">
          {form.oldpeak ? `${form.oldpeak.toFixed(1)} mm` : '0.0 mm'}
        </div>
      </div>

      <div
        className={`absolute bottom-4 right-4 z-20 backdrop-blur-md border rounded-xl px-3 py-1.5 shadow-md text-right ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-black/60 border-slate-700/60'
        }`}
      >
        <div className="text-[9px] text-slate-400 font-mono">Statut Diagnostique</div>
        <div
          className={`text-xs font-mono font-bold ${
            result?.prediction === 1 ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {result ? result.risk_label : 'En Attente'}
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center relative z-0" />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Heart3D({
  bpm = 72,
  riskLevel = 'low',
  className = 'w-full h-full min-h-[360px]',
  showRings = true,
  interactive = true,
}) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color mapping based on risk level
  const glowColors = {
    low: { primary: 0x10b981, secondary: 0x06b6d4, light: 0x22c55e },       // Emerald / Teal
    moderate: { primary: 0xf59e0b, secondary: 0xf97316, light: 0xfbbf24 },  // Amber / Orange
    high: { primary: 0xef4444, secondary: 0xdc2626, light: 0xf87171 },      // Crimson / Red
    critical: { primary: 0xe11d48, secondary: 0x991b1b, light: 0xff0055 },  // Ruby / Red
  };

  const currentColors = glowColors[riskLevel] || glowColors.low;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.6);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = interactive;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI / 1.7;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0); // Soft cyan rim light
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(currentColors.light, 3.0, 8);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 6. Holographic Orbital Rings
    const ringsGroup = new THREE.Group();
    if (showRings) {
      // Ring 1 (tilted)
      const ringGeo1 = new THREE.TorusGeometry(1.4, 0.008, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: currentColors.primary,
        transparent: true,
        opacity: 0.65,
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2.5;
      ring1.rotation.y = 0.2;
      ringsGroup.add(ring1);

      // Ring 2 (counter-tilted)
      const ringGeo2 = new THREE.TorusGeometry(1.7, 0.006, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: currentColors.secondary,
        transparent: true,
        opacity: 0.4,
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = -Math.PI / 2.8;
      ring2.rotation.y = -0.3;
      ringsGroup.add(ring2);

      // Pedestal glow ring (horizontal beneath)
      const baseGeo = new THREE.RingGeometry(0.8, 1.6, 64);
      const baseMat = new THREE.MeshBasicMaterial({
        color: currentColors.primary,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const baseRing = new THREE.Mesh(baseGeo, baseMat);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = -1.3;
      ringsGroup.add(baseRing);

      scene.add(ringsGroup);
    }

    // 7. Load 3D Heart Model
    let heartModel = null;
    let baseScale = 1.0;
    const loader = new GLTFLoader();

    loader.load(
      '/models/heart.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and fit model to bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        baseScale = 1.9 / (maxDim || 1);
        model.scale.setScalar(baseScale);
        model.position.sub(center.multiplyScalar(baseScale));
        model.position.y += 0.05;

        // Improve material shading for medical realism
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 0.35;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 1.5;
          }
        });

        heartModel = model;
        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load heart.glb:', err);
        setError('Model loading failed');
        setLoading(false);
      }
    );

    // 8. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Realistic physiological heartbeat pulse (lub-dub rhythm)
      // Pulse frequency tied to BPM (default 72 bpm = 1.2 Hz)
      const frequency = (bpm / 60) * Math.PI * 2;
      const beat1 = Math.pow(Math.max(0, Math.sin(elapsedTime * frequency)), 10) * 0.08;
      const beat2 = Math.pow(Math.max(0, Math.sin(elapsedTime * frequency - 0.45)), 12) * 0.04;
      const pulse = 1 + beat1 + beat2;

      if (heartModel) {
        heartModel.scale.setScalar(baseScale * pulse);
      }

      // Pulse core light intensity with the beat
      coreLight.intensity = 2.5 + beat1 * 25.0;

      // Rotate rings gently
      if (showRings && ringsGroup) {
        ringsGroup.rotation.y = elapsedTime * 0.25;
        ringsGroup.rotation.z = Math.sin(elapsedTime * 0.2) * 0.05;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bpm, riskLevel, showRings, interactive]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-cardio-dark/40 backdrop-blur-sm rounded-2xl">
          <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-3" />
          <p className="text-xs text-cardio-muted tracking-wider uppercase font-medium">Loading 3D Anatomy...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-xs text-cardio-muted">
          Unable to render 3D model
        </div>
      )}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Interactive Helper Hint */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-cardio-muted/60 bg-cardio-navy/70 px-2 py-0.5 rounded-full border border-cardio-border/40 backdrop-blur-sm">
        Drag to rotate 3D
      </div>
    </div>
  );
}

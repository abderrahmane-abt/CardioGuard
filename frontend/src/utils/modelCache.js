import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const CACHE_NAME = 'cardioguard-3d-model-cache-v1';
const MODEL_URL = '/models/heart.glb';

let memoryGltf = null;
let activeLoadingPromise = null;

export function isHeartModelCached() {
  return memoryGltf !== null;
}

export async function getOrLoadHeartModel() {
  if (memoryGltf) {
    return memoryGltf;
  }

  if (activeLoadingPromise) {
    return activeLoadingPromise;
  }

  activeLoadingPromise = (async () => {
    try {
      let arrayBuffer = null;

      // Tier 1: Browser Persistent Cache API
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const matched = await cache.match(MODEL_URL);
          if (matched && matched.ok) {
            arrayBuffer = await matched.arrayBuffer();
          } else {
            const response = await fetch(MODEL_URL, { cache: 'force-cache' });
            if (response.ok) {
              await cache.put(MODEL_URL, response.clone());
              arrayBuffer = await response.arrayBuffer();
            }
          }
        } catch (cacheErr) {
          console.warn('[Cache API] Fallback to standard fetch:', cacheErr);
        }
      }

      // Tier 2: Standard HTTP Fetch Fallback
      if (!arrayBuffer) {
        const response = await fetch(MODEL_URL, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Échec du téléchargement du modèle 3D: HTTP ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      // Tier 3: Parse binary ArrayBuffer with Three.js GLTFLoader
      const gltfLoader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        gltfLoader.parse(
          arrayBuffer,
          '',
          (parsed) => resolve(parsed),
          (err) => reject(err)
        );
      });

      // Normalize scale and center once on the master model
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.6 / (maxDim || 1);
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale - 0.05;
      model.position.z = -center.z * scale;

      memoryGltf = gltf;
      return gltf;
    } finally {
      activeLoadingPromise = null;
    }
  })();

  return activeLoadingPromise;
}

export function createHeartInstance(gltf) {
  const clonedScene = SkeletonUtils.clone(gltf.scene);
  return {
    model: clonedScene,
    animations: gltf.animations || [],
  };
}

export function prewarmHeartModelCache() {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      getOrLoadHeartModel().catch(() => {});
    });
  } else {
    setTimeout(() => {
      getOrLoadHeartModel().catch(() => {});
    }, 50);
  }
}

// Auto-start pre-warm on script evaluation
prewarmHeartModelCache();

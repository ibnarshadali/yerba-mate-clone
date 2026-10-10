import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assets } from '@/data/assets';
export default function CanScene({ flavor }: { flavor: number }) {
  const container = useRef<HTMLDivElement>(null);
  const material = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const host = container.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .001, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xababab, 3));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(2, 3, 4); scene.add(light);
    const group = new THREE.Group(); scene.add(group);
    let disposed = false;
    new GLTFLoader().load(assets['can.gltf'] ?? '', gltf => {
      if (disposed) return;
      const model = gltf.scene;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      group.add(model); camera.position.z = size.y * 4.3;
      model.traverse(obj => { if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) { material.current = obj.material; obj.material.metalness = .12; obj.material.roughness = .45; } });
      const texture = new THREE.TextureLoader().load(assets['melo.png'] ?? ''); texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
      if (material.current) { material.current.map = texture; material.current.needsUpdate = true; }
    });
    const resize = () => { const w = host.clientWidth; const h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let mouseX = 0; let mouseY = 0;
    const move = (event: PointerEvent) => { mouseX = (event.clientX / window.innerWidth - .5) * .45; mouseY = (event.clientY / window.innerHeight - .5) * .2; };
    window.addEventListener('pointermove', move);
    const clock = new THREE.Clock(); const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scroll = window.scrollY; let smoothScroll = scroll;
    const onScroll = () => { scroll = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();
      smoothScroll += (scroll - smoothScroll) * .08;
      const spin = smoothScroll * .004;
      group.rotation.y = -.3 + mouseX + spin;
      group.rotation.z = reduced ? 0 : Math.sin(t * .6) * .055 + spin * .12;
      group.rotation.x = mouseY + spin * .06;
      group.position.y = reduced ? 0 : Math.sin(t * .8) * .04;
      renderer.render(scene, camera);
    });
    return () => { disposed = true; observer.disconnect(); window.removeEventListener('pointermove', move); window.removeEventListener('scroll', onScroll); renderer.setAnimationLoop(null); renderer.dispose(); host.replaceChildren(); material.current = null; };
  }, []);
  useEffect(() => {
    const texture = new THREE.TextureLoader().load(assets[['melo.png', 'pamp.png', 'mure.png', 'trop.png'][flavor] ?? 'melo.png'] ?? '', () => {
      texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
      if (material.current) { material.current.map?.dispose(); material.current.map = texture; material.current.needsUpdate = true; }
    });
  }, [flavor]);
  return <div className="can-scene" ref={container} role="img" aria-label="MANA sparkling yerba mate can" />;
}
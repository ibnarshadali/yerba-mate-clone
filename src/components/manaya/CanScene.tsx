import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { assets } from '@/data/assets';

/*
 * Scroll-choreographed drink can.
 * - Hero ([data-can-hero], tall): can tips over, moves closer and drops toward the bottom of the screen.
 * - Benefit wheel ([data-can-circle], pinned): can spins a full turn, the tab opens, the wheel rotates.
 * - Pointer: the can leans toward the cursor.
 * - Flavor change: spin with elastic settle, texture swaps mid-spin.
 */

const TEXTURES = ['melo.png', 'pamp.png', 'mure.png', 'trop.png'];
const TAU = Math.PI * 2;
const CLOSED_TIME = 2.48;
const OPEN_TIME = 2.72;
const WHEEL_DEGREES = 100;
// Larger product silhouette; canvas sizing also follows the viewport height.
const CAN_SCALE = 230;
const BUBBLE_COUNT = 64;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const quadIn = (t: number) => t * t;
const quadOut = (t: number) => 1 - (1 - t) * (1 - t);
const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const quartIn = (t: number) => t * t * t * t;
function elasticOut(t: number, amplitude = 1, period = 0.3) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const a = Math.max(1, amplitude);
  const p = period / Math.min(1, amplitude);
  const w = TAU / p;
  const shift = (p / TAU) * Math.asin(1 / a);
  return a * Math.pow(2, -10 * t) * Math.sin((t - shift) * w) + 1;
}
const damp = (current: number, target: number, k: number, dt: number) => lerp(current, target, 1 - Math.exp(-k * dt));

type Tween = { from: number; to: number; start: number; duration: number; ease: (t: number) => number };
const tweenValue = (tw: Tween, now: number) => lerp(tw.from, tw.to, tw.ease(clamp01((now - tw.start) / tw.duration)));
const tweenDone = (tw: Tween, now: number) => now - tw.start >= tw.duration;

export default function CanScene({ flavor }: { flavor: number }) {
  const host = useRef<HTMLDivElement>(null);
  const setFlavorRef = useRef<((index: number) => void) | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 200);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const canvas = renderer.domElement;
    el.appendChild(canvas);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const group = new THREE.Group();
    const mouseGroup = new THREE.Group();
    group.add(mouseGroup);
    scene.add(group);

    // A reusable pool keeps the fizz attached to the animated mouth without
    // introducing another scroll loop or a React update on every frame.
    const swatch = document.createElement('canvas').getContext('2d');
    const bubbleColor = new THREE.Color();
    if (swatch) {
      swatch.fillStyle = getComputedStyle(el).getPropertyValue('--mana-white').trim();
      swatch.fillRect(0, 0, 1, 1);
      const pixel = swatch.getImageData(0, 0, 1, 1).data;
      bubbleColor.setRGB((pixel[0] ?? 255) / 255, (pixel[1] ?? 255) / 255, (pixel[2] ?? 255) / 255, THREE.SRGBColorSpace);
    }
    const bubbleGeometry = new THREE.SphereGeometry(1, 12, 8);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: bubbleColor, transparent: true, opacity: 0.58,
      roughness: 0.08, metalness: 0.1, clearcoat: 1,
      envMapIntensity: 1.8, depthWrite: false,
    });
    const bubbles = new THREE.InstancedMesh(bubbleGeometry, bubbleMaterial, BUBBLE_COUNT);
    bubbles.frustumCulled = false;
    bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(bubbles);
    const particles = Array.from({ length: BUBBLE_COUNT }, () => ({
      position: new THREE.Vector3(), velocity: new THREE.Vector3(), life: 0, duration: 1, radius: 0,
    }));
    const dummy = new THREE.Object3D();
    const mouth = new THREE.Vector3();
    let fizzClock = 0;
    let burstPending = false;
    const emitBubbles = (count: number) => {
      if (!model || reduced) return;
      model.updateWorldMatrix(true, true);
      mouth.set(0, 0.079, 0.008);
      model.localToWorld(mouth);
      for (const particle of particles) {
        if (particle.life > 0 || count <= 0) continue;
        particle.position.copy(mouth);
        particle.position.x += (Math.random() - 0.5) * 1.3;
        particle.velocity.set((Math.random() - 0.5) * 5, 8 + Math.random() * 10, 2 + Math.random() * 3);
        particle.duration = 1.3 + Math.random() * 1.3;
        particle.life = particle.duration;
        particle.radius = 0.25 + Math.random() * 0.65;
        count--;
      }
    };

    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const loader = new THREE.TextureLoader();
    const textures = TEXTURES.map(name => {
      const tex = loader.load(assets[name] ?? '');
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      return tex;
    });

    let model: THREE.Object3D | null = null;
    let material: THREE.MeshStandardMaterial | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;
    let disposed = false;
    let introStart = -1;
    let currentFlavor = flavor;
    let spin: { start: number; dir: number; texture: number; swapped: boolean } | null = null;
    let openTween: Tween | null = null;
    let openTarget = false;
    let openTime = CLOSED_TIME;

    new GLTFLoader().load(assets['can.gltf'] ?? '', gltf => {
      if (disposed) return;
      model = gltf.scene;
      model.scale.setScalar(CAN_SCALE);
      model.traverse(obj => {
        obj.frustumCulled = false;
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
          material = obj.material;
          obj.material.envMapIntensity = 1.4;
        }
      });
      const mat = material as THREE.MeshStandardMaterial | null;
      if (mat) { mat.map = textures[currentFlavor] ?? null; mat.needsUpdate = true; }
      const clip = gltf.animations[1] ?? gltf.animations[0];
      if (clip) { mixer = new THREE.AnimationMixer(model); action = mixer.clipAction(clip); }
      mouseGroup.add(model);
      introStart = performance.now() / 1000;
    });

    setFlavorRef.current = (index: number) => {
      if (index === currentFlavor) return;
      const dir = (index - currentFlavor + 4) % 4 === 1 ? 1 : -1;
      currentFlavor = index;
      spin = { start: performance.now() / 1000, dir, texture: index, swapped: false };
    };

    let size = 650;
    let margin = 0;
    let desktop = true;
    const resize = () => {
      const W = window.innerWidth;
      const H = el.clientHeight || window.innerHeight;
      desktop = W > 600;
      size = desktop ? Math.max(650, Math.min(W * 0.95, H * 1.1)) : W * 0.95;
      margin = (H - size) / 2;
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.position.z = desktop ? 84 : 70;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    window.addEventListener('resize', resize);
    resize();

    const mouseTarget = { x: 0, y: 0, rx: 0, ry: 0, rz: 0 };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      mouseTarget.x = 2 * nx;
      mouseTarget.y = -(desktop ? 4 : 2) * ny;
      mouseTarget.ry = nx / 2;
      mouseTarget.rx = (ny * Math.PI) / 12;
      mouseTarget.rz = nx / 10;
    };
    window.addEventListener('pointermove', onPointer);

    const smooth = { hero: 0, circle: 0 };
    let lastFrame = performance.now() / 1000;
    renderer.setAnimationLoop(() => {
      const now = performance.now() / 1000;
      const dt = Math.min(now - lastFrame, 0.05);
      lastFrame = now;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const heroEl = document.querySelector<HTMLElement>('[data-can-hero]');
      const circleEl = document.querySelector<HTMLElement>('[data-can-circle]');

      let heroP = 0;
      let circleP = 0;
      let exit = 0;
      let wantOpen = false;
      if (heroEl && circleEl) {
        const hr = heroEl.getBoundingClientRect();
        const cr = circleEl.getBoundingClientRect();
        if (desktop) {
          heroP = clamp01(-hr.top / Math.max(1, hr.height - H));
          circleP = clamp01(-cr.top / Math.max(1, cr.height - H));
          exit = Math.max(0, H - cr.bottom);
          wantOpen = cr.top <= 0;
          const arc = clamp01((H - 0.06 * W - cr.top) / Math.max(1, H - 0.06 * W));
          circleEl.style.setProperty('--arc-p', arc.toFixed(4));
        } else {
          wantOpen = cr.top < H * 0.4;
          circleEl.style.setProperty('--arc-p', '1');
        }
        heroEl.classList.toggle('controls-hidden', desktop && -hr.top > H * 0.9);
      }
      smooth.hero = damp(smooth.hero, heroP, 9, dt);
      smooth.circle = damp(smooth.circle, circleP, 9, dt);
      heroEl?.style.setProperty('--hero-p', smooth.hero.toFixed(4));
      circleEl?.style.setProperty('--wheel-rot', `${(-WHEEL_DEGREES * sineInOut(smooth.circle)).toFixed(3)}deg`);

      const hidden = desktop && exit > H;
      el.style.visibility = hidden ? 'hidden' : 'visible';
      // Clip the can at the bottom edge of the benefit wheel so it never covers the next section.
      el.style.clipPath = desktop && exit > 0 ? `inset(0 0 ${exit.toFixed(1)}px 0)` : 'none';
      if (hidden || !model) return;

      // Intro: can rises from below and unwinds into place.
      const introT = introStart < 0 ? 0 : reduced ? 1 : clamp01((now - introStart - 0.3) / 1.1);
      const unwind = 1 - quadOut(introT);
      const rise = (1 - elasticOut(introT, 1, 0.75)) * (el.clientHeight || H);

      // Scroll: tip over, move closer, drop down.
      const p = smooth.hero;
      group.rotation.set(lerp(0, 1.12 * Math.PI, p) + 0.3 * Math.PI * unwind, lerp(0, -Math.PI, p) + TAU * unwind, lerp(0, -Math.PI, p) + 0.2 * Math.PI * unwind);
      group.position.z = 12 * p;
      camera.position.y = desktop ? 8 * p : 0.6;
      // Interpolate screen-space centers, not two accumulated margins. The
      // open lid rests beneath the cards throughout the wheel's sticky span.
      const wheelTop = H * 1.10 - size / 2;
      const canvasY = rise + lerp(margin, wheelTop, p) - exit;
      canvas.style.transform = `translate(-50%, ${canvasY.toFixed(1)}px)`;

      // Pointer lean.
      const k = 6;
      const pointerWeight = 1 - p;
      mouseGroup.position.x = damp(mouseGroup.position.x, mouseTarget.x * pointerWeight, k, dt);
      mouseGroup.position.y = damp(mouseGroup.position.y, mouseTarget.y * pointerWeight, k, dt);
      mouseGroup.rotation.x = damp(mouseGroup.rotation.x, mouseTarget.rx * pointerWeight, k, dt);
      mouseGroup.rotation.y = damp(mouseGroup.rotation.y, mouseTarget.ry * pointerWeight, k, dt);
      mouseGroup.rotation.z = damp(mouseGroup.rotation.z, mouseTarget.rz * pointerWeight, k, dt);

      // Flavor spin + wobble, texture swap mid-spin.
      let spinY = 0;
      let wobbleX = 0;
      if (spin) {
        const t = now - spin.start;
        if (t < 0.3) spinY = lerp(0, 0.6 * Math.PI * spin.dir, quadIn(t / 0.3));
        else spinY = lerp(0.6 * Math.PI * spin.dir, TAU * spin.dir, elasticOut((t - 0.3) / 1.3, 0.34, 0.26));
        const w = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
        wobbleX = -3 * spin.dir * sineInOut(clamp01(w));
        const mat = material as THREE.MeshStandardMaterial | null;
        if (!spin.swapped && t >= 0.3 && mat) { mat.map = textures[spin.texture] ?? mat.map; mat.needsUpdate = true; spin.swapped = true; }
        if (t >= 1.6) spin = null;
      }
      model.rotation.y = spinY + TAU * sineInOut(smooth.circle);
      model.position.x = wobbleX;

      // Tab opens when the benefit wheel pins.
      if (wantOpen !== openTarget && action && mixer) {
        openTarget = wantOpen;
        burstPending = wantOpen;
        if (!wantOpen) particles.forEach(particle => { particle.life = 0; });
        action.play();
        openTween = wantOpen
          ? { from: openTime, to: OPEN_TIME, start: now + 0.1, duration: 0.7, ease: t => elasticOut(t, 1, 0.75) }
          : { from: openTime, to: CLOSED_TIME, start: now + 0.1, duration: 0.5, ease: quartIn };
      }
      if (openTween && mixer) {
        openTime = tweenValue(openTween, now);
        mixer.setTime(openTime);
        if (tweenDone(openTween, now)) openTween = null;
      }

      if (openTarget && openTime > CLOSED_TIME + 0.08) {
        if (burstPending) { emitBubbles(22); burstPending = false; }
        fizzClock += dt;
        while (fizzClock >= 0.075) { emitBubbles(1); fizzClock -= 0.075; }
      } else fizzClock = 0;
      let liveBubbles = 0;
      particles.forEach((particle, i) => {
        particle.life = Math.max(0, particle.life - dt);
        if (particle.life > 0) {
          particle.position.addScaledVector(particle.velocity, dt);
          particle.velocity.x *= Math.exp(-0.7 * dt);
          const t = 1 - particle.life / particle.duration;
          dummy.position.copy(particle.position);
          dummy.scale.setScalar(particle.radius * Math.min(1, t * 10) * Math.min(1, (1 - t) * 4));
          liveBubbles++;
        } else dummy.scale.setScalar(0);
        dummy.updateMatrix();
        bubbles.setMatrixAt(i, dummy.matrix);
      });
      bubbles.instanceMatrix.needsUpdate = true;
      el.dataset['bubbles'] = String(liveBubbles);
      el.dataset['open'] = String(openTarget);

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      setFlavorRef.current = null;
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      renderer.setAnimationLoop(null);
      bubbleGeometry.dispose();
      bubbleMaterial.dispose();
      bubbles.dispose();
      textures.forEach(t => t.dispose());
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setFlavorRef.current?.(flavor); }, [flavor]);

  return <div className="can-stage" ref={host} role="img" aria-label="MANA sparkling yerba mate can" />;
}

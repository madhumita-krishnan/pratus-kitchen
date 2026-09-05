// Hero: WebGL photo plane with a slam + ripple shockwave.
// The text lives in the DOM (crisp, accessible); the ripple lives in the shader.
import * as THREE from 'three';
import { gsap } from '../vendor-gsap/index.js';

const MAX_RIPPLES = 8;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2  uRes;        // canvas size
  uniform vec2  uTexRes;     // image size
  uniform float uTime;
  uniform float uFocusX;     // horizontal focal point of the photo (0-1)
  uniform float uVisibleH;   // fraction of the image height to show (zoom), anchored to the top
  uniform vec4  uRipples[${MAX_RIPPLES}]; // x, y (0-1), startTime, strength

  // object-fit: cover
  vec2 coverUv(vec2 uv) {
    float ca = uRes.x / uRes.y;
    float ia = uTexRes.x / uTexRes.y;
    vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
    // zoom until at most uVisibleH of the image height is visible, anchored to the top edge.
    // Main hero.png shows 69% of the height / 81% of the width at 16:9, top-left corner at 0,0.
    s *= min(1.0, uVisibleH / s.y);
    // centre horizontally on the subject (uFocusX, image-space), clamped to the image edges
    vec2 offset = vec2(clamp(uFocusX - 0.5 * s.x, 0.0, 1.0 - s.x), 1.0 - s.y);
    return uv * s + offset;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    vec2 disp = vec2(0.0);
    float energy = 0.0;

    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      if (r.w <= 0.0) continue;
      float age = uTime - r.z;
      if (age < 0.0 || age > 3.5) continue;

      vec2 c = (r.xy - 0.5) * vec2(aspect, 1.0);
      vec2 d = p - c;
      float dist = length(d);

      float speed  = 0.72;
      float radius = age * speed;
      float width  = 0.045 + age * 0.06;
      float ring   = exp(-pow((dist - radius) / width, 2.0));
      float decay  = exp(-age * 1.35);
      float amp    = r.w * ring * decay;

      // secondary trailing ring for a richer wavefront
      float ring2 = exp(-pow((dist - radius * 0.72) / (width * 0.8), 2.0));
      amp += r.w * ring2 * decay * 0.35;

      disp += normalize(d + 1e-5) * amp * 0.085;
      energy += amp;
    }

    vec2 tuv = coverUv(uv + disp);
    vec3 col = texture2D(uTex, tuv).rgb;

    // the scrim itself lives in CSS (.hero__vignette) so the WebGL and <img> fallback paths match;
    // ridge highlight so the wavefront reads as light catching a surface
    col += vec3(energy * 0.32);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initHero(root) {
  const canvas   = root.querySelector('.hero__canvas');
  const fallback = root.querySelector('.hero__fallback');
  const tag      = root.querySelector('.hero__tag');
  const letters  = root.querySelectorAll('.hero__wordmark span');
  const scroll   = root.querySelector('.hero__scroll');
  const content  = root.querySelector('.hero__content');
  const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // text stays hidden until play() is called (after the loader)
  gsap.set([letters, tag, scroll], { opacity: 0 });

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch {
    fallback.hidden = false; canvas.remove();
    return { ready: Promise.resolve(), play: staticIntro };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const ripples = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, 0, 0));
  let head = 0;

  const uniforms = {
    uTex:    { value: null },
    uRes:    { value: new THREE.Vector2(1, 1) },
    uTexRes: { value: new THREE.Vector2(3, 2) },
    uTime:   { value: 0 },
    uFocusX: { value: 0.42 }, // DSC_0560: the necklace / torso centre sits at 42% of the width
    uVisibleH: { value: 0.69 },
    uRipples: { value: ripples },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const src = innerWidth > 1100 ? '/img/hero-2400.webp' : '/img/hero-1200.webp';
  const ready = new Promise((resolve) => {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
      uniforms.uTex.value = tex;
      uniforms.uTexRes.value.set(tex.image.width, tex.image.height);
      fallback.remove();
      resolve();
    }, undefined, () => { fallback.hidden = false; resolve(); });
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = root;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
    uniforms.uVisibleH.value = w < h ? 0.80 : 0.69; // portrait: a touch looser so the cooler and pouch survive the crop
  }
  resize();
  addEventListener('resize', resize);

  // ---- ripple API --------------------------------------------------------
  const clock = new THREE.Timer();
  function ripple(nx, ny, strength = 1) {
    ripples[head].set(nx, 1 - ny, clock.getElapsed(), strength);
    head = (head + 1) % MAX_RIPPLES;
  }
  function rippleFromEl(el, strength) {
    const r = el.getBoundingClientRect(), h = root.getBoundingClientRect();
    ripple((r.left + r.width / 2 - h.left) / h.width, (r.top + r.height / 2 - h.top) / h.height, strength);
  }
  function pointerNorm(e) {
    const h = root.getBoundingClientRect();
    return [(e.clientX - h.left) / h.width, (e.clientY - h.top) / h.height];
  }

  // pointer: gentle wake while moving, hard hit on click
  let lastMove = 0;
  root.addEventListener('pointermove', (e) => {
    const t = performance.now();
    if (t - lastMove < 260) return;
    lastMove = t;
    ripple(...pointerNorm(e), 0.12);
  });
  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    ripple(...pointerNorm(e), 0.45);
  });

  // ---- render loop (paused when hero is off-screen) -----------------------
  let running = true;
  new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) loop(); }, { threshold: 0 }).observe(root);
  function loop() {
    if (!running) return;
    clock.update();
    uniforms.uTime.value = clock.getElapsed();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  // ---- slam ---------------------------------------------------------------
  function slamTag() {
    const tl = gsap.timeline();
    tl.set(tag, { scale: 1.4, opacity: 0, filter: 'blur(5px)', letterSpacing: '0.12em' })
      .to(tag, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .to(tag, { scale: 1, filter: 'blur(0px)', letterSpacing: '0.02em', duration: 0.75, ease: 'power3.inOut' }, 0)
      .add(() => impact(), 0.7)
      .to(tag, { scale: 0.985, duration: 0.1, ease: 'power2.out' }, 0.75)
      .to(tag, { scale: 1, duration: 0.5, ease: 'power2.out' });
    return tl;
  }
  function impact() {
    rippleFromEl(tag, 0.7);
    // a nudge, not a shake
    gsap.fromTo(content, { y: 2 }, { y: 0, duration: 0.5, ease: 'power2.out' });
    // DOM shockwave ring
    const ring = document.createElement('i');
    ring.className = 'shockwave';
    const r = tag.getBoundingClientRect(), h = root.getBoundingClientRect();
    ring.style.left = `${r.left + r.width / 2 - h.left}px`;
    ring.style.top  = `${r.top + r.height / 2 - h.top}px`;
    root.appendChild(ring);
    gsap.fromTo(ring, { scale: 0, opacity: 0.45 }, { scale: 30, opacity: 0, duration: 1.0, ease: 'power2.out', onComplete: () => ring.remove() });
  }

  function playIntro() {
    gsap.set(scroll, { opacity: 0, y: 16 });
    const tl = gsap.timeline();
    tl.fromTo(letters, { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.05 })
      .add(slamTag(), '-=0.2')
      .to(scroll, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');

  }

  function staticIntro() {
    gsap.to([letters, tag, scroll], { opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'transform,filter' });
  }

  // debug / demo hook: window.__pratus.ripple(x, y, strength) with x,y in 0..1; window.__pratus.slam()
  window.__pratus = { ripple, slam: slamTag }; // debug only — nothing in the UI re-slams

  // parallax: content lifts and fades as the hero scrolls out
  if (!reduced) {
    gsap.to(content, {
      yPercent: -18, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  return { ready, play: () => (reduced ? staticIntro() : playIntro()) };
}

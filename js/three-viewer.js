/* =============================================
   Three.js — Hero Scene & Product 3D Viewer
   ============================================= */

// ─── HERO 3D SCENE ───────────────────────────
function initHero3D() {
  const canvas = document.getElementById('hero3dCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(3, 2, 5);
  camera.lookAt(0, 0, 0);

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffeedd, 2);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xc9a96e, 1, 20);
  fillLight.position.set(-4, 2, -2);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0x6080ff, 0.5, 15);
  rimLight.position.set(0, -2, -5);
  scene.add(rimLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  floor.receiveShadow = true;
  scene.add(floor);

  // Build furniture group
  const group = new THREE.Group();

  // Sofa base
  const sofaGeo = new THREE.BoxGeometry(3.2, 0.35, 1.2);
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.8, metalness: 0.05 });
  const sofaBase = new THREE.Mesh(sofaGeo, sofaMat);
  sofaBase.position.y = -0.5;
  sofaBase.castShadow = true;
  group.add(sofaBase);

  // Sofa back
  const backGeo = new THREE.BoxGeometry(3.2, 0.9, 0.3);
  const back = new THREE.Mesh(backGeo, sofaMat);
  back.position.set(0, 0.1, -0.45);
  back.castShadow = true;
  group.add(back);

  // Seat cushions
  for (let i = -1; i <= 1; i++) {
    const cushGeo = new THREE.BoxGeometry(0.95, 0.22, 1.0);
    const cushMat = new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.7 });
    const cush = new THREE.Mesh(cushGeo, cushMat);
    cush.position.set(i, -0.26, -0.05);
    cush.castShadow = true;
    group.add(cush);
  }

  // Back cushions
  for (let i = -1; i <= 1; i++) {
    const bcGeo = new THREE.BoxGeometry(0.95, 0.65, 0.22);
    const bcMat = new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.7 });
    const bc = new THREE.Mesh(bcGeo, bcMat);
    bc.position.set(i, 0.05, -0.38);
    bc.castShadow = true;
    group.add(bc);
  }

  // Armrests
  [-1, 1].forEach(side => {
    const armGeo = new THREE.BoxGeometry(0.22, 0.5, 1.2);
    const arm = new THREE.Mesh(armGeo, sofaMat);
    arm.position.set(side * 1.7, -0.17, -0.05);
    arm.castShadow = true;
    group.add(arm);
  });

  // Legs
  [[-1.45, -1.45], [1.45, -1.45], [-1.45, 0.5], [1.45, 0.5]].forEach(([x, z]) => {
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.4, metalness: 0.6 });
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, -0.79, z);
    leg.castShadow = true;
    group.add(leg);
  });

  // Small side table
  const tableTop = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.5, metalness: 0.3 });
  const table = new THREE.Mesh(tableTop, tableMat);
  table.position.set(2.2, -0.5, 0);
  table.castShadow = true;
  group.add(table);
  const tableLeg = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 8);
  const tl = new THREE.Mesh(tableLeg, tableMat);
  tl.position.set(2.2, -0.74, 0);
  group.add(tl);

  // Decorative sphere on table
  const sphereGeo = new THREE.SphereGeometry(0.12, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.2, metalness: 0.7 });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(2.2, -0.38, 0);
  scene.add(sphere);

  scene.add(group);

  // Mouse drag
  let isDragging = false;
  let prevX = 0;
  let rotY = 0;

  canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    rotY += dx * 0.01;
    prevX = e.clientX;
  });

  canvas.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevX;
    rotY += dx * 0.01;
    prevX = e.touches[0].clientX;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    if (!isDragging) rotY += 0.003;
    group.rotation.y = rotY;
    sphere.position.y = -0.38 + Math.sin(t * 2) * 0.03;
    fillLight.intensity = 1 + Math.sin(t) * 0.3;
    renderer.render(scene, camera);
  }
  animate();
}

// ─── PRODUCT 3D VIEWER ───────────────────────
let productViewerState = {
  renderer: null, scene: null, camera: null, group: null,
  wireframe: false, animId: null
};

function initProduct3D() {
  const canvas = document.getElementById('product3dCanvas');
  if (!canvas || !THREE) return;

  const state = productViewerState;

  if (state.renderer) {
    state.renderer.dispose();
    cancelAnimationFrame(state.animId);
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  state.renderer = renderer;

  const scene = new THREE.Scene();
  state.scene = scene;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(4, 2.5, 5);
  camera.lookAt(0, 0, 0);
  state.camera = camera;

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Env lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff5e0, 2.5);
  key.position.set(6, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  scene.add(key);
  const fill = new THREE.PointLight(0xc9a96e, 1.5, 25);
  fill.position.set(-5, 3, 0);
  scene.add(fill);

  // Floor with reflection
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1c, roughness: 0.3, metalness: 0.5,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.05;
  floor.receiveShadow = true;
  scene.add(floor);

  // Build detailed sofa
  const group = new THREE.Group();
  state.group = group;

  const gold = 0xc9a96e;
  const fabric = new THREE.MeshStandardMaterial({ color: gold, roughness: 0.85, metalness: 0.02 });
  const light = new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a5c30, roughness: 0.6, metalness: 0.2 });

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 1.4), fabric);
  frame.position.y = -0.55;
  frame.castShadow = true;
  group.add(frame);

  // Back rest
  const backR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 0.35), fabric);
  backR.position.set(0, 0.15, -0.525);
  backR.castShadow = true;
  group.add(backR);

  // Seat cushions (3)
  for (let i = -1; i <= 1; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 1.05), light);
    c.position.set(i * 1.1, -0.3, 0);
    c.castShadow = true;
    group.add(c);
  }

  // Back cushions (3)
  for (let i = -1; i <= 1; i++) {
    const bc = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.25), light);
    bc.position.set(i * 1.1, 0.07, -0.38);
    bc.castShadow = true;
    group.add(bc);
  }

  // Armrests
  [-1, 1].forEach(s => {
    const ar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.55, 1.4), fabric);
    ar.position.set(s * 1.92, -0.12, 0);
    ar.castShadow = true;
    group.add(ar);
  });

  // Pillows
  [-0.8, 0.8].forEach(x => {
    const pGeo = new THREE.BoxGeometry(0.4, 0.38, 0.12);
    const pMat = new THREE.MeshStandardMaterial({ color: 0x9a7b4f, roughness: 0.7 });
    const p = new THREE.Mesh(pGeo, pMat);
    p.position.set(x, 0.12, -0.28);
    p.rotation.z = x > 0 ? 0.1 : -0.1;
    group.add(p);
  });

  // Legs (turned)
  [[-1.7, -1.55], [1.7, -1.55], [-1.7, 0.55], [1.7, 0.55]].forEach(([x, z]) => {
    const legGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.26, 10);
    const leg = new THREE.Mesh(legGeo, wood);
    leg.position.set(x, -0.88, z);
    leg.castShadow = true;
    group.add(leg);
  });

  scene.add(group);

  // Orbit controls (manual)
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let rotY = 0.3, rotX = 0.15;
  let zoom = 5;

  canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotY += (e.clientX - prevMouse.x) * 0.008;
    rotX += (e.clientY - prevMouse.y) * 0.005;
    rotX = Math.max(-0.4, Math.min(0.6, rotX));
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('wheel', e => {
    zoom = Math.max(3, Math.min(9, zoom + e.deltaY * 0.005));
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchstart', e => { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    rotY += (e.touches[0].clientX - prevMouse.x) * 0.01;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  let t = 0;
  function animate() {
    state.animId = requestAnimationFrame(animate);
    t += 0.01;
    if (!isDragging) rotY += 0.004;
    group.rotation.y = rotY;
    camera.position.x = Math.sin(rotY) * zoom;
    camera.position.z = Math.cos(rotY) * zoom;
    camera.position.y = rotX * 3 + 1.5;
    camera.lookAt(0, -0.3, 0);
    renderer.render(scene, camera);
  }
  animate();

  // Color change API
  window.changeViewerColor = (hex) => {
    fabric.color.set(hex);
    group.children.forEach(c => {
      if (c.material === fabric) c.material.needsUpdate = true;
    });
  };

  // Wireframe toggle
  document.getElementById('toggleWireframe')?.addEventListener('click', () => {
    state.wireframe = !state.wireframe;
    group.traverse(c => {
      if (c.isMesh && c.material) c.material.wireframe = state.wireframe;
    });
  });

  // Reset view
  document.getElementById('resetView')?.addEventListener('click', () => {
    rotY = 0.3; rotX = 0.15; zoom = 5;
  });

  // Fullscreen
  document.getElementById('fullscreenView')?.addEventListener('click', () => {
    const wrap = canvas.parentElement;
    if (!document.fullscreenElement) wrap.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
}

// Color swatches in viewer
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.vcolor').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vcolor').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const color = getComputedStyle(btn).backgroundColor;
      if (window.changeViewerColor) {
        const hex = rgbToHex(color);
        window.changeViewerColor(hex);
      }
    });
  });
});

function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m) return '#c9a96e';
  return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

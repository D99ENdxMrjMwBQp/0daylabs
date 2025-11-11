// -------------------------------------------------
// Scene setup
// -------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight - 100);
renderer.setPixelRatio(window.devicePixelRatio);

const container = document.getElementById('container');
container.appendChild(renderer.domElement);

// -------------------------------------------------
// Room geometry
// -------------------------------------------------
const roomWidth = 20, roomHeight = 20, roomDepth = 30;
const geometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);

// Flip UVs on all inner faces for readable text (horizontal mirror)
const uv = geometry.attributes.uv;
for (let i = 0; i < uv.array.length; i += 2) {
  uv.array[i] = 1 - uv.array[i];
}
uv.needsUpdate = true;

// -------------------------------------------------
// Textures
// -------------------------------------------------
let enhancedTex, enhancedBackTex, profTex, profBackTex;

const snippets = [
  'I am Lain. Lain is everywhere.',
  'No matter where you go, everyone\'s connected.'
];

const loremIpsum = `
0-Day Research Labs is dedicated to discovering novel high-quality 0-day exploits and advanced vulnerabilities in computer systems.

We are leading the way in augmenting discovery with the use of frontier AI techniques in order to deliver the world’s most innovative service at the cutting edge of vulnerability research. 


For further information or general enquiries, please contact us.
`.trim();

// === ENHANCED MODE: Matrix Rain ===
function createEnhancedTexture(isBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん';
  const columns = 26;
  const drops = Array(columns).fill(0);
  const snippetDrops = [];

  const img = new Image();
  img.src = 'lainx420.png';
  let loaded = false;
  img.onload = () => {
    loaded = true;
    update(); // Redraw on load
  };
  img.onerror = () => {
    console.warn('lainx420.png failed to load');
    loaded = true; // Proceed without image
  };

  function update() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, 512, 512);
    if (isBack && loaded) ctx.drawImage(img, 0, 0, 512, 512);

    ctx.fillStyle = '#0F0';
    ctx.font = '14px monospace';

    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.95) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i]++ * 20 > 512 && Math.random() > 0.975) drops[i] = 0;
      }
    }

    if (isBack) {
      ctx.fillStyle = '#0F0';
      snippetDrops.forEach((d, idx) => {
        ctx.fillText(d.text, d.x, d.y);
        d.y += 1;
        if (d.y > 512) snippetDrops.splice(idx, 1);
      });
      if (Math.random() < 0.03 && snippetDrops.length < 5) {
        snippetDrops.push({
          text: snippets[Math.floor(Math.random() * snippets.length)],
          x: Math.random() * 400,
          y: 0
        });
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  update(); // Initial draw
  return { texture, update };
}

// === PROFESSIONAL MODE: Background Texture (No Text on Canvas) ===
function createProfessionalTexture(isBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = 'lainx420.png';

  function update() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 512);

    if (isBack && img.complete) {
      ctx.drawImage(img, 0, 0, 512, 512);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);

  img.onload = update;
  img.onerror = () => console.warn('lainx420.png failed to load');
  update(); // Initial draw

  return { texture, update: () => { texture.needsUpdate = true; } };
}

// === SNOWFLAKE OVERLAY: Small, Fast, Crisp, Many ===
function createSnowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const flakes = [];
  const flakeCount = 45;
  const snowColor = '#A0D8F1';

  const snowflakePath = () => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.moveTo(0, -14);
      ctx.lineTo(-4, -18);
      ctx.moveTo(0, -14);
      ctx.lineTo(4, -18);
      ctx.rotate(Math.PI / 3);
    }
    ctx.stroke();
  };

  for (let i = 0; i < flakeCount; i++) {
    flakes.push({
      x: Math.random() * 512,
      y: Math.random() * 512 - 200,
      scale: 0.6 + Math.random() * 0.4,
      speed: 0.8 + Math.random() * 1.0,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.6
    });
  }

  function update() {
    ctx.clearRect(0, 0, 512, 512);

    ctx.strokeStyle = snowColor;
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';

    flakes.forEach(flake => {
      const x = Math.round(flake.x);
      const y = Math.round(flake.y);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(flake.rotation * Math.PI / 180);
      ctx.scale(flake.scale, flake.scale);
      snowflakePath();
      ctx.restore();

      flake.y += flake.speed;
      flake.rotation += flake.rotSpeed;

      if (flake.y > 512 + 50) {
        flake.y = -50;
        flake.x = Math.random() * 512;
      }
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  update(); // Initial
  return { texture, update };
}

// Initialise textures
enhancedTex = createEnhancedTexture();
enhancedBackTex = createEnhancedTexture(true);
profTex = createProfessionalTexture();
profBackTex = createProfessionalTexture(true);
const snowTex = createSnowTexture();

// -------------------------------------------------
// Lights (Professional mode only)
// -------------------------------------------------
let proLights = [];
function buildProLights() {
  proLights.forEach(l => scene.remove(l));
  proLights = [];

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  proLights.push(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(5, 8, -5);
  proLights.push(dirLight);

  const backBoost = new THREE.PointLight(0xffffff, 0.4, 30);
  backBoost.position.set(0, 0, 12);
  proLights.push(backBoost);

  proLights.forEach(l => scene.add(l));
}

// -------------------------------------------------
// Material helper
// -------------------------------------------------
let isProfessional = true;
let room, snowRoom;

function setMaterials(stdTex, backTex, snowStd) {
  const Mat = isProfessional ? THREE.MeshPhongMaterial : THREE.MeshBasicMaterial;
  const mats = [
    new Mat({ map: stdTex.texture, side: THREE.BackSide }),
    new Mat({ map: stdTex.texture, side: THREE.BackSide }),
    new Mat({ map: stdTex.texture, side: THREE.BackSide }),
    new Mat({ map: stdTex.texture, side: THREE.BackSide }),
    new Mat({ map: backTex.texture, side: THREE.BackSide }),
    new Mat({ map: stdTex.texture, side: THREE.BackSide })
  ];

  const snowMats = [
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 1, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 1, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 1, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 1, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 0, side: THREE.BackSide }),  // Zero opacity on back wall
    new THREE.MeshBasicMaterial({ map: snowStd.texture, transparent: true, opacity: 1, side: THREE.BackSide })
  ];

  if (isProfessional) {
    mats.forEach(m => {
      m.shininess = 20;
      m.specular = new THREE.Color(0x333333);
    });
    mats[4].emissive = new THREE.Color(0x222222);
    mats[4].emissiveIntensity = 0.3;
  }

  room.material = mats;
  snowRoom.material = snowMats;
  [mats, snowMats].forEach(arr => arr.forEach(m => m.needsUpdate = true));
}

// -------------------------------------------------
// Room + Snow Overlay Mesh
// -------------------------------------------------
room = new THREE.Mesh(geometry, []);
scene.add(room);

const snowGeometry = geometry.clone();
snowRoom = new THREE.Mesh(snowGeometry, []);
snowRoom.scale.set(0.99, 0.99, 0.99);  // Slight shrink to avoid z-fighting
scene.add(snowRoom);

// -------------------------------------------------
// HTML Text Overlay for Professional Mode
// -------------------------------------------------
const textOverlay = document.createElement('div');
textOverlay.id = 'text-overlay';
textOverlay.innerHTML = `<pre>${loremIpsum}</pre>`;
container.appendChild(textOverlay);

const tempVector = new THREE.Vector3();

function projectToScreen(worldPos) {
  tempVector.copy(worldPos).project(camera);
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  return {
    x: (tempVector.x * 0.5 + 0.5) * width,
    y: (-tempVector.y * 0.5 + 0.5) * height
  };
}

function updateTextPosition() {
  const halfTextWidth = 10;  // Full wall coverage
  const halfTextHeight = 10;  // Full wall coverage
  const zBack = roomDepth / 2;

  const tl = projectToScreen(new THREE.Vector3(-halfTextWidth, halfTextHeight, zBack));
  const tr = projectToScreen(new THREE.Vector3(halfTextWidth, halfTextHeight, zBack));
  const bl = projectToScreen(new THREE.Vector3(-halfTextWidth, -halfTextHeight, zBack));
  const br = projectToScreen(new THREE.Vector3(halfTextWidth, -halfTextHeight, zBack));

  const minX = Math.min(tl.x, tr.x, bl.x, br.x);
  const maxX = Math.max(tl.x, tr.x, bl.x, br.x);
  const minY = Math.min(tl.y, tr.y, bl.y, br.y);
  const maxY = Math.max(tl.y, tr.y, bl.y, br.y);

  textOverlay.style.left = `${minX}px`;
  textOverlay.style.top = `${minY}px`;
  textOverlay.style.width = `${maxX - minX}px`;
  textOverlay.style.height = `${maxY - minY}px`;
}

// -------------------------------------------------
// Camera & renderer
// -------------------------------------------------
camera.position.set(0, 0, -10);
camera.lookAt(0, 0, 10);

scene.fog = new THREE.Fog(0xffffff, 5, 20);
renderer.setClearColor(0xffffff);

// -------------------------------------------------
// Mode logic
// -------------------------------------------------
function applyProfessional() {
  document.body.classList.add('professional');
  setMaterials(profTex, profBackTex, snowTex);
  scene.fog.color.setHex(0xffffff);
  scene.fog.near = 5;
  scene.fog.far = 20;
  renderer.setClearColor(0xffffff);
  buildProLights();
  snowRoom.visible = true;
  textOverlay.style.display = 'block';
  textOverlay.style.opacity = '1';
  updateTextPosition();
}

function applyEnhanced() {
  document.body.classList.remove('professional');
  setMaterials(enhancedTex, enhancedBackTex, snowTex);
  scene.fog.color.setHex(0x000000);
  scene.fog.near = 10;
  scene.fog.far = 50;
  renderer.setClearColor(0x000000);
  proLights.forEach(l => scene.remove(l));
  snowRoom.visible = false;
  textOverlay.style.opacity = '0';
  setTimeout(() => { textOverlay.style.display = 'none'; }, 600);  // Hide after fade
}

// Initial state
applyProfessional();
document.getElementById('toggle-btn').textContent = 'Layer: Default';

// -------------------------------------------------
// Toggle
// -------------------------------------------------
document.getElementById('toggle-btn').addEventListener('click', () => {
  isProfessional = !isProfessional;
  const btn = document.getElementById('toggle-btn');
  btn.textContent = `Layer: ${isProfessional ? 'Default' : 'Wired'}`;

  if (isProfessional) applyProfessional();
  else applyEnhanced();
});

// -------------------------------------------------
// Animation loop
// -------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  if (isProfessional) {
    profTex.update();
    profBackTex.update();
    snowTex.update();
    snowTex.texture.needsUpdate = true;
  } else {
    enhancedTex.update();
    enhancedBackTex.update();
    enhancedTex.texture.needsUpdate = true;
    enhancedBackTex.texture.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
animate();

// -------------------------------------------------
// Resize
// -------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 100);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 100);
  updateTextPosition();
});

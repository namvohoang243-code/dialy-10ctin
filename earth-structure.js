/* Earth Structure 3D - Professional compact port from thamquan3d_1.html */
(function(){
  'use strict';

  // Expose state
  window.structureSceneObj = null;

  // Texture URLs and fallback colors
  const STRUCTURE_TEXTURE_URLS = {
    day: 'https://unpkg.com/three-globe@2.24.9/example/img/earth-blue-marble.jpg',
    bump: 'https://unpkg.com/three-globe@2.24.9/example/img/earth-topology.png',
    specular: 'https://unpkg.com/three-globe@2.24.9/example/img/earth-water.png',
    clouds: 'https://unpkg.com/three-globe@2.24.9/example/img/earth-clouds.png'
  };
  const STRUCTURE_FALLBACK_COLORS = {
    day: '#2a72ff', bump: '#555555', specular: '#d9d9d9', clouds: '#ffffff'
  };

  function createFallbackTexture(color){
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color || '#444';
    ctx.fillRect(0,0,4,4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;
    return tex;
  }

  function loadTextures() {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const keys = Object.keys(STRUCTURE_TEXTURE_URLS);
    return Promise.all(keys.map(k => new Promise(resolve => {
      loader.load(
        STRUCTURE_TEXTURE_URLS[k],
        tex => { tex.encoding = THREE.sRGBEncoding; resolve([k, tex]); },
        undefined,
        () => resolve([k, createFallbackTexture(STRUCTURE_FALLBACK_COLORS[k])])
      );
    }))).then(entries => Object.fromEntries(entries));
  }

  function buildScene(state){
    const { scene, textures } = state;

    const planetGroup = new THREE.Group();
    state.planetGroup = planetGroup;
    scene.add(planetGroup);

    // Crust (textured Earth) + clouds
    const crustGeo = new THREE.SphereGeometry(1, 192, 192);
    const crustMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: textures.day || createFallbackTexture(STRUCTURE_FALLBACK_COLORS.day),
      bumpMap: textures.bump || null,
      bumpScale: 0.02,
      specularMap: textures.specular || null,
      specular: new THREE.Color(0x333333)
    });
    const crustMesh = new THREE.Mesh(crustGeo, crustMat);
    const crustGroup = new THREE.Group();
    crustGroup.add(crustMesh);

    const cloudsGeo = new THREE.SphereGeometry(1.01, 128, 128);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: textures.clouds || null,
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    crustGroup.add(cloudsMesh);

    planetGroup.add(crustGroup);
    state.crustGroup = crustGroup;

    // Internal layers
    function layerMaterial(base, highlight, emissive) {
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(256,256,0,256,256,256);
      g.addColorStop(0, highlight); g.addColorStop(0.7, base); g.addColorStop(1,'#1b1b1b');
      ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
      const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
      return new THREE.MeshPhysicalMaterial({ map: tex, color: base, emissive: emissive, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    }

    const layers = [
      { key: 'inner',  label: 'Lõi Trong', radius: 0.20, color: '#ffd166', hi:'#fff6b7', em:'#ff8c00', splitX: -2.6 },
      { key: 'outer',  label: 'Lõi Ngoài', radius: 0.55, color: '#ff7043', hi:'#ffd1b5', em:'#ff7043', splitX: -1.3 },
      { key: 'mantle', label: 'Manti',     radius: 0.95, color: '#ff8c42', hi:'#ffd89c', em:'#ff6d00', splitX: 0.3 }
    ];

    state.layers = layers.map(info => {
      // Lower segment count on mobile for performance
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const seg = isMobile ? 96 : 144;
      const geo = new THREE.SphereGeometry(info.radius, seg, seg);
      const mat = layerMaterial(info.color, info.hi, info.em);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.layerKey = info.key;
      mesh.name = info.label;
      const group = new THREE.Group();
      group.add(mesh);
      planetGroup.add(group);
      return { key: info.key, group, radius: info.radius, homeX: 0, splitX: info.splitX };
    });

    // Include the crust (with clouds) as part of the layers that can split away
    state.layers.push({
      key: 'crust',
      group: crustGroup,
      radius: 1,
      homeX: 0,
      splitX: 0
    });

    // Helper: compute responsive gap based on container width and device
    function getResponsiveGap(){
      const w = state.container.clientWidth || window.innerWidth;
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) return w < 400 ? 1.25 : 1.15;
      if (w > 1400) return 1.05;
      if (w > 1100) return 0.95;
      if (w > 900) return 0.9;
      if (w > 700) return 0.85;
      return 1.0;
    }

    // Compute dynamic split layout to prevent overlap and add elegant spacing
    state.computeSplitLayout = function computeSplitLayout(){
      const order = ['inner', 'outer', 'mantle', 'crust'];
      const gap = getResponsiveGap();

      // Calculate total width needed so we can center the layout
      let totalWidth = 0;
      order.forEach((key, idx) => {
        const layer = state.layers.find(l => l.key === key);
        if (!layer) { return; }
        totalWidth += layer.radius * 2;
        if (idx < order.length - 1) {
          totalWidth += gap;
        }
      });

      let cursor = -totalWidth / 2;
      order.forEach((key, idx) => {
        const layer = state.layers.find(l => l.key === key);
        if (!layer) { return; }
        layer.splitX = cursor + layer.radius;
        cursor += layer.radius * 2;
        if (idx < order.length - 1) {
          cursor += gap;
        }
      });
    };
    state.computeSplitLayout();

    // Collect pickable meshes for raycasting (crust and internal layers)
    const pickables = [];
    crustGroup.children.forEach(ch => { if (ch.isMesh) pickables.push(ch); });
    state.layers.forEach(L => { const m = L.group.children[0]; if (m && m.isMesh) pickables.push(m); });
    state.pickables = pickables;
  }

  function startLoop(state){
    function animate(){
      state.animationId = requestAnimationFrame(animate);
      // smooth separation animation
      const t = state.splitT;
      state.layers.forEach((L) => {
        const target = state.isSplit ? L.splitX : L.homeX;
        if (window.gsap && !state.manualStep) {
          // controlled by GSAP tweens; nothing to do per frame
        } else {
          // fallback easing if GSAP not present
          L.group.position.x += (target - L.group.position.x) * 0.1;
        }
      });
      // gentle clouds rotation
      if (state.crustGroup) state.crustGroup.rotation.y += 0.0006;
      state.controls.update();
      state.renderer.render(state.scene, state.camera);
    }
    animate();
  }

  function bindResize(state){
    const onResize = () => {
      const { container, renderer, camera } = state;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h);
      // recompute split layout for new sizes and re-tween if needed
      if (state.layers && state.layers.length && typeof state.computeSplitLayout === 'function') {
        const wasSplit = state.isSplit;
        state.computeSplitLayout();
        if (wasSplit && window.gsap) {
          state.layers.forEach(L=> gsap.to(L.group.position, { x: L.splitX, duration: 0.6, ease: 'power2.out' }));
        }
      }
    };
    window.addEventListener('resize', onResize);
    // Pause rendering when tab is hidden to save battery
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden) {
        state.controls && (state.controls.enabled = false);
      } else {
        state.controls && (state.controls.enabled = true);
      }
    });
  }

  // Public API
  window.initEarthStructure3D = function initEarthStructure3D(){
    // Hook up current-layer button and info panel once DOM is ready for this widget
    const infoPanel = document.getElementById('structureInfoPanel');
    const infoContent = document.getElementById('structureInfoContent');
    const infoTitle = document.getElementById('structureInfoTitle');
    const infoClose = document.getElementById('structureInfoClose');
    const currentBtn = document.getElementById('structureCurrentLayerBtn');

    function layerTitle(key){
      switch(key){
        case 'inner': return 'Lõi Trong';
        case 'outer': return 'Lõi Ngoài';
        case 'mantle': return 'Manti';
        case 'crust':
        default: return 'Vỏ Trái Đất';
      }
    }

    function layerDetailsHTML(key){
      if(key==='inner'){
        return `<div class="info-section">
          <h3>Đặc điểm chung</h3>
          <p>Lõi trong là phần rắn, chủ yếu cấu tạo bởi sắt và niken, chịu áp suất cực lớn.</p>
          <div class="stats">
            <div class="stat-item"><span class="stat-label">Bán kính xấp xỉ</span><span class="stat-value">~1.220 km</span></div>
            <div class="stat-item"><span class="stat-label">Nhiệt độ</span><span class="stat-value">~5.000–6.000°C</span></div>
            <div class="stat-item"><span class="stat-label">Trạng thái</span><span class="stat-value">Rắn</span></div>
          </div>
        </div>`;
      }
      if(key==='outer'){
        return `<div class="info-section">
          <h3>Đặc điểm chung</h3>
          <p>Lõi ngoài là lớp kim loại lỏng (sắt-niken) chuyển động, tạo nên từ trường Trái Đất.</p>
          <div class="stats">
            <div class="stat-item"><span class="stat-label">Độ dày</span><span class="stat-value">~2.250 km</span></div>
            <div class="stat-item"><span class="stat-label">Nhiệt độ</span><span class="stat-value">~4.000–5.000°C</span></div>
            <div class="stat-item"><span class="stat-label">Trạng thái</span><span class="stat-value">Lỏng</span></div>
          </div>
        </div>`;
      }
      if(key==='mantle'){
        return `<div class="info-section">
          <h3>Đặc điểm chung</h3>
          <p>Manti là lớp dày nhất gồm đá nóng chảy chậm, đóng vai trò chính trong kiến tạo mảng.</p>
          <div class="stats">
            <div class="stat-item"><span class="stat-label">Độ dày</span><span class="stat-value">~2.900 km</span></div>
            <div class="stat-item"><span class="stat-label">Nhiệt độ</span><span class="stat-value">~1.000–3.700°C</span></div>
            <div class="stat-item"><span class="stat-label">Vật chất</span><span class="stat-value">Đá silicat</span></div>
          </div>
        </div>`;
      }
      // crust
      return `<div class="info-section">
        <h3>Đặc điểm chung</h3>
        <p>Vỏ Trái Đất là lớp mỏng ngoài cùng, nơi tồn tại lục địa và đại dương.</p>
        <div class="stats">
          <div class="stat-item"><span class="stat-label">Độ dày</span><span class="stat-value">~5–70 km</span></div>
          <div class="stat-item"><span class="stat-label">Thành phần</span><span class="stat-value">Đá bazan, granit</span></div>
          <div class="stat-item"><span class="stat-label">Đặc trưng</span><span class="stat-value">Kiến tạo mảng</span></div>
        </div>
      </div>`;
    }

    function showInfo(key){
      if(!infoPanel||!infoContent||!infoTitle) return;
      infoTitle.textContent = layerTitle(key);
      infoContent.innerHTML = layerDetailsHTML(key);
      infoPanel.style.display = 'block';
    }
    function hideInfo(){ if(infoPanel) infoPanel.style.display = 'none'; }
    if(infoClose){ infoClose.addEventListener('click', hideInfo); }
    function updateCurrentBtn(key){ if(currentBtn){ currentBtn.textContent = `🔎 Lớp hiện tại: ${layerTitle(key)}`; } }

    const container = document.getElementById('structure-3d-container');
    let mount = document.getElementById('structureCanvasMount');
    if (!container) { console.error('Structure container not found!'); return; }
    if (!mount) {
      // Create a mount inside container if missing (for simple test pages)
      mount = document.createElement('div');
      mount.id = 'structureCanvasMount';
      mount.style.position = 'absolute';
      mount.style.inset = '0';
      container.style.position = container.style.position || 'relative';
      container.appendChild(mount);
    }
    if (window.structureSceneObj) { return; }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 100);
    camera.position.set(0,1.5,4.5);
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Lower pixel ratio on mobile to improve performance
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const targetDPR = isMobile ? 1.25 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(targetDPR);
    mount.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.5;
    controls.minDistance = 2; controls.maxDistance = 9;

    // lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x020412, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2); dir.position.set(5,4,4); scene.add(dir);
    const rim = new THREE.PointLight(0x5c8dff, 0.5); rim.position.set(-4,-3,-5); scene.add(rim);

    const state = window.structureSceneObj = { scene, camera, renderer, controls, container, mount, layers: [], isSplit:false, splitT:0, currentLayerKey:'crust' };

    // Raycaster for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    state.raycaster = raycaster; state.mouse = mouse;

    function setMouseFromEvent(ev){
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width;
      const y = (ev.clientY - rect.top) / rect.height;
      mouse.x = x * 2 - 1;
      mouse.y = -(y * 2 - 1);
    }

    function focusOnLayer(key){
      const s = state;
      const L = s.layers.find(l => l.key===key);
      if(!L) return;
      // ensure split so layers are visible separated
      if(!s.isSplit){ window.toggleStructureSeparation && window.toggleStructureSeparation(); }
      // world position of group's center
      const wp = new THREE.Vector3();
      L.group.getWorldPosition(wp);
      const dir = new THREE.Vector3().subVectors(wp, s.controls.target).normalize();
      const distance = Math.max(1.2, L.radius*3.2);
      const targetPos = new THREE.Vector3().copy(wp).add(dir.multiplyScalar(distance));
      // Stop auto rotate for focus
      s.controls.autoRotate = false;
      if(window.gsap){
        gsap.to(s.controls.target, { x: wp.x, y: wp.y, z: wp.z, duration: 0.8, ease:'power2.inOut' });
        gsap.to(s.camera.position, { x: targetPos.x, y: Math.max(targetPos.y, 0.8), z: targetPos.z, duration: 0.9, ease:'power2.inOut' });
      } else {
        s.controls.target.copy(wp);
        s.camera.position.copy(targetPos);
      }
    }

    function selectLayer(key){
      state.currentLayerKey = key;
      if (typeof updateCurrentBtn === 'function') updateCurrentBtn(key);
      focusOnLayer(key);
      showInfo && showInfo(key);
    }

    function updateCursor() {
      if (!state.pickables) return;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(state.pickables, true);
      renderer.domElement.style.cursor = hits.length ? 'pointer' : (state.controls && state.controls.enabled ? 'grab' : 'default');
    }

    renderer.domElement.addEventListener('pointermove', (e)=>{ setMouseFromEvent(e); updateCursor(); });
    renderer.domElement.addEventListener('click', (e)=>{
      if (!state.pickables) { return; }
      setMouseFromEvent(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(state.pickables, true);
      if (hits && hits.length) {
        // find parent mesh with userData.layerKey, default to 'crust'
        let layerKey = 'crust';
        const hit = hits[0].object;
        const m = hit.isMesh ? hit : hits[0].object;
        if (m && m.userData && m.userData.layerKey) layerKey = m.userData.layerKey;
        selectLayer(layerKey);
      }
    });

    // Bind button if available
    if(currentBtn){ currentBtn.addEventListener('click', ()=> selectLayer(state.currentLayerKey || 'crust')); }

    loadTextures().then(tex => {
      state.textures = tex; buildScene(state); startLoop(state); bindResize(state);
    }).catch(() => {
      state.textures = {
        day: createFallbackTexture(STRUCTURE_FALLBACK_COLORS.day),
        bump: createFallbackTexture(STRUCTURE_FALLBACK_COLORS.bump),
        specular: createFallbackTexture(STRUCTURE_FALLBACK_COLORS.specular),
        clouds: createFallbackTexture(STRUCTURE_FALLBACK_COLORS.clouds)
      };
      buildScene(state); startLoop(state); bindResize(state);
    });
  };

  window.toggleStructureSeparation = function toggleStructureSeparation(){
    const s = window.structureSceneObj; if (!s || !s.layers) return;
    s.isSplit = !s.isSplit;
    const btn = document.getElementById('structureToggleBtn'); if (btn) btn.classList.toggle('active', s.isSplit);

    if (window.gsap) {
      s.manualStep = true;
      s.layers.forEach(L => {
        gsap.to(L.group.position, {
          x: s.isSplit ? L.splitX : L.homeX,
          duration: 0.9,
          ease: 'power3.inOut'
        });
      });
      // small timeout to release manual step flag
      setTimeout(()=>{ s.manualStep = false; }, 950);
    }
  };

  window.toggleStructureAutoRotate = function toggleStructureAutoRotate(){
    const s = window.structureSceneObj; if (!s) return; s.controls.autoRotate = !s.controls.autoRotate;
    const btn = document.getElementById('structureRotateBtn'); if (btn) btn.classList.toggle('active', s.controls.autoRotate);
  };

  window.resetStructureView = function resetStructureView(){
    const s = window.structureSceneObj; if (!s) return; s.isSplit = false;
    if (window.gsap && s.layers) {
      s.manualStep = true;
      s.layers.forEach(L => gsap.to(L.group.position, { x: 0, duration: 0.8, ease: 'power2.out' }));
      setTimeout(()=>{ s.manualStep = false; }, 850);
    } else if (s.layers) {
      s.layers.forEach(L => { L.group.position.x = 0; });
    }
    s.controls.reset(); s.camera.position.set(0,1.5,4.5);
  };
})();

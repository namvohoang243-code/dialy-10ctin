// ==========================================
// PLATE TECTONICS TO COMPLETE EARTH - 3D ANIMATION
// Mô phỏng các mảng kiến tạo ghép lại thành Trái Đất hoàn chỉnh
// National Geographic quality
// ==========================================

(function() {
    'use strict';

    console.log('🌍 Loading Tectonic Plates → Complete Earth 3D Module...');

    // Global variables
    let scene, camera, renderer, controls, composer;
    let tectonicPlates = [];
    let completeEarth;
    let atmosphere, clouds;
    let isAnimating = false;
    let animationSpeed = 1.0;
    let animationProgress = 0;
    let clock;

    const EARTH_RADIUS = 5;
    const PLATE_THICKNESS = 0.25;
    const ANIMATION_DURATION = 30; // 30 seconds total animation

    // Animation phases
    const PHASE_SEPARATION = 0.0;    // 0-30%: Plates separated
    const PHASE_MOVING = 0.3;        // 30-60%: Plates moving together
    const PHASE_MERGING = 0.6;       // 60-85%: Plates merging
    const PHASE_COMPLETE = 0.85;     // 85-100%: Complete Earth revealed

    // ============================================
    // MAIN INIT FUNCTION
    // ============================================

    function initPlateTectonics2D() {
        const container = document.getElementById('plate-tectonics-container');
        if (!container) {
            console.error('❌ Container not found!');
            return;
        }

        if (scene) {
            console.log('✓ Scene already initialized');
            return;
        }

        console.log('🎬 Initializing Tectonic Plates → Complete Earth...');

        container.innerHTML = '';

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 20, 100);

        // Camera
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.set(0, 0, 18);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        container.appendChild(renderer.domElement);

        // Post-processing for bloom
        setupPostProcessing();

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 8;
        controls.maxDistance = 40;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Clock
        clock = new THREE.Clock();

        // Setup
        setupLights();
        createStarField();
        createTectonicPlates();
        createCompleteEarth();
        createAtmosphere();
        createClouds();
        createUI(container);
        setupEventListeners();

        // Start with plates separated
        updateAnimationState(0);

        // Animation loop
        animate();

        window.plateTectonicsScene = scene;
        console.log('✅ Tectonic Plates → Complete Earth initialized!');
    }

    // ============================================
    // POST-PROCESSING (BLOOM)
    // ============================================

    function setupPostProcessing() {
        // Will add bloom pass if available
        // For now, using basic renderer
        composer = null;
    }

    // ============================================
    // LIGHTS
    // ============================================

    function setupLights() {
        // Main sun light (realistic brightness)
        const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
        sunLight.position.set(15, 5, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        scene.add(sunLight);

        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 1.2);
        scene.add(ambientLight);

        // Hemisphere light for natural sky/ground lighting
        const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x111122, 0.8);
        scene.add(hemiLight);

        // Fill light (subtle blue from space)
        const fillLight = new THREE.DirectionalLight(0x6699ff, 0.5);
        fillLight.position.set(-10, -5, -10);
        scene.add(fillLight);

        // Point light for magma glow
        const magmaLight = new THREE.PointLight(0xff6600, 1.5, 20);
        magmaLight.position.set(0, 0, 0);
        scene.add(magmaLight);

        console.log('✓ Lights setup with realistic brightness');
    }

    // ============================================
    // STAR FIELD
    // ============================================

    function createStarField() {
        // Regular stars (small)
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsSizes = [];
        const starsColors = [];

        for (let i = 0; i < 8000; i++) {
            const radius = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            starsVertices.push(x, y, z);

            // Variable sizes
            const size = Math.random() * 1.5 + 0.5;
            starsSizes.push(size);

            // Star colors (white to blue-white)
            const colorVariation = 0.8 + Math.random() * 0.2;
            starsColors.push(colorVariation, colorVariation, 1);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.15,
            transparent: true,
            opacity: 0.9,
            vertexColors: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Add bright stars with starburst effect
        for (let i = 0; i < 30; i++) {
            const radius = 60 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // Create star sprite
            const starTexture = createStarburstTexture();
            const spriteMaterial = new THREE.SpriteMaterial({
                map: starTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: 0.7 + Math.random() * 0.3
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(x, y, z);
            const scale = 1 + Math.random() * 2;
            sprite.scale.set(scale, scale, 1);

            scene.add(sprite);
        }

        // Add nebula background
        createNebulaBackground();

        console.log('✓ Star field created with 8000+ stars');
    }

    function createStarburstTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Core glow
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.8)');
        coreGradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Starburst rays
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);

            const rayGradient = ctx.createLinearGradient(0, 0, 40, 0);
            rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            rayGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
            rayGradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

            ctx.fillStyle = rayGradient;
            ctx.fillRect(0, -2, 40, 4);

            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    function createNebulaBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add blue nebula clouds
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 300 + 100;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(100, 150, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(80, 120, 200, 0.08)');
            gradient.addColorStop(1, 'rgba(60, 100, 180, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Create nebula sphere
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.SphereGeometry(95, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
            depthWrite: false
        });

        const nebula = new THREE.Mesh(geometry, material);
        scene.add(nebula);

        console.log('✓ Nebula background created');
    }

    // ============================================
    // PROCEDURAL TEXTURES
    // ============================================

    function createEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Deep ocean base with gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0a1929');
        oceanGradient.addColorStop(0.3, '#0d47a1');
        oceanGradient.addColorStop(0.5, '#1565c0');
        oceanGradient.addColorStop(0.7, '#0d47a1');
        oceanGradient.addColorStop(1, '#0a1929');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Detailed continents with realistic colors
        // North America
        ctx.fillStyle = '#3d5a2a';
        ctx.beginPath();
        ctx.moveTo(600, 600);
        ctx.bezierCurveTo(700, 400, 900, 350, 1000, 450);
        ctx.bezierCurveTo(1050, 550, 1000, 700, 900, 800);
        ctx.bezierCurveTo(800, 850, 700, 800, 650, 750);
        ctx.bezierCurveTo(580, 700, 550, 650, 600, 600);
        ctx.fill();

        // Greenland ice
        ctx.fillStyle = '#e8f4f8';
        ctx.beginPath();
        ctx.ellipse(1100, 300, 80, 100, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.fillStyle = '#4a6b3a';
        ctx.beginPath();
        ctx.moveTo(900, 1000);
        ctx.bezierCurveTo(950, 950, 1000, 1000, 1050, 1100);
        ctx.bezierCurveTo(1050, 1250, 1000, 1400, 950, 1500);
        ctx.bezierCurveTo(900, 1550, 850, 1500, 850, 1450);
        ctx.bezierCurveTo(820, 1350, 850, 1200, 880, 1100);
        ctx.bezierCurveTo(870, 1050, 880, 1000, 900, 1000);
        ctx.fill();

        // Africa
        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.moveTo(1900, 900);
        ctx.bezierCurveTo(2000, 850, 2100, 900, 2150, 1000);
        ctx.bezierCurveTo(2200, 1150, 2150, 1300, 2100, 1400);
        ctx.bezierCurveTo(2050, 1500, 1950, 1450, 1900, 1350);
        ctx.bezierCurveTo(1850, 1250, 1850, 1100, 1900, 1000);
        ctx.bezierCurveTo(1880, 950, 1880, 900, 1900, 900);
        ctx.fill();

        // Add green vegetation to Africa
        ctx.fillStyle = '#4a7c3a';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(2000, 1050, 80, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Eurasia
        ctx.fillStyle = '#5a7c4a';
        ctx.beginPath();
        ctx.moveTo(2200, 600);
        ctx.bezierCurveTo(2400, 550, 2800, 550, 3200, 600);
        ctx.bezierCurveTo(3500, 650, 3700, 700, 3800, 750);
        ctx.bezierCurveTo(3850, 800, 3800, 900, 3600, 950);
        ctx.bezierCurveTo(3300, 1000, 2900, 950, 2600, 900);
        ctx.bezierCurveTo(2400, 850, 2300, 750, 2200, 650);
        ctx.lineTo(2200, 600);
        ctx.fill();

        // India-Australia plate
        ctx.fillStyle = '#6b8b4a';
        ctx.beginPath();
        ctx.ellipse(3200, 1200, 150, 100, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Australia
        ctx.fillStyle = '#9b6b3a';
        ctx.beginPath();
        ctx.ellipse(3500, 1400, 180, 120, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Antarctica (bottom)
        ctx.fillStyle = '#f0f8ff';
        ctx.fillRect(0, 1800, canvas.width, 248);

        // Arctic (top)
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, canvas.width, 200);

        // Add realistic texture
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);

            // Ocean depth variation
            if (data[i] < 50 && data[i + 1] < 100) {
                const noise = (Math.random() - 0.5) * 15;
                data[i] += noise;
                data[i + 1] += noise;
                data[i + 2] += noise * 1.2;
            }

            // Land texture
            if (data[i + 1] > 80 || data[i] > 100) {
                const noise = (Math.random() - 0.5) * 30;
                data[i] += noise;
                data[i + 1] += noise;
                data[i + 2] += noise * 0.8;
            }
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    function createCityLightsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add random city lights
        ctx.fillStyle = '#ffdd66';
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
            const size = Math.random() * 3 + 1;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            gradient.addColorStop(0, 'rgba(255, 221, 102, 1)');
            gradient.addColorStop(1, 'rgba(255, 221, 102, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    function createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create realistic cloud clusters
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.9 + canvas.height * 0.05;
            const baseRadius = Math.random() * 80 + 30;

            // Main cloud body
            for (let j = 0; j < 5; j++) {
                const offsetX = (Math.random() - 0.5) * baseRadius * 1.5;
                const offsetY = (Math.random() - 0.5) * baseRadius * 0.8;
                const radius = baseRadius * (0.5 + Math.random() * 0.5);

                const gradient = ctx.createRadialGradient(
                    x + offsetX, y + offsetY, 0,
                    x + offsetX, y + offsetY, radius
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
                gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Add wispy clouds
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const width = Math.random() * 150 + 50;
            const height = Math.random() * 30 + 10;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, width);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - width / 2, y - height / 2, width, height);
        }
        ctx.globalAlpha = 1.0;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    function createRockTexture(baseColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 60 - 30;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }

        ctx.putImageData(imageData, 0, 0);

        // Add rock details
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 15 + 3;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    // ============================================
    // TECTONIC PLATES
    // ============================================

    const plateData = [
        {
            name: 'Pacific',
            nameVi: 'Thái Bình Dương',
            color: '#3498db',
            segments: generatePlateSegments(-180, -60, 120, 60, 50),
            separationOffset: { x: -6, y: 0, z: -2 }
        },
        {
            name: 'NorthAmerica',
            nameVi: 'Bắc Mỹ',
            color: '#e74c3c',
            segments: generatePlateSegments(-170, 20, -50, 75, 40),
            separationOffset: { x: -4, y: 3, z: 2 }
        },
        {
            name: 'SouthAmerica',
            nameVi: 'Nam Mỹ',
            color: '#2ecc71',
            segments: generatePlateSegments(-85, -55, -30, 15, 35),
            separationOffset: { x: -3, y: -4, z: 1 }
        },
        {
            name: 'Africa',
            nameVi: 'Phi',
            color: '#f39c12',
            segments: generatePlateSegments(-20, -35, 50, 35, 40),
            separationOffset: { x: 2, y: -2, z: 3 }
        },
        {
            name: 'Eurasia',
            nameVi: 'Âu-Á',
            color: '#9b59b6',
            segments: generatePlateSegments(-10, 35, 180, 75, 50),
            separationOffset: { x: 3, y: 4, z: -2 }
        },
        {
            name: 'IndoAustralian',
            nameVi: 'Ấn Độ-Úc',
            color: '#1abc9c',
            segments: generatePlateSegments(65, -50, 160, 10, 40),
            separationOffset: { x: 4, y: -3, z: -3 }
        },
        {
            name: 'Antarctic',
            nameVi: 'Nam Cực',
            color: '#ecf0f1',
            segments: generatePlateSegments(-180, -90, 180, -60, 35),
            separationOffset: { x: 0, y: -5, z: 0 }
        }
    ];

    function generatePlateSegments(lonStart, latStart, lonEnd, latEnd, numPoints) {
        const points = [];
        const latStep = (latEnd - latStart) / Math.sqrt(numPoints);
        const lonStep = (lonEnd - lonStart) / Math.sqrt(numPoints);

        for (let lat = latStart; lat <= latEnd; lat += latStep) {
            for (let lon = lonStart; lon <= lonEnd; lon += lonStep) {
                const phi = (90 - lat) * Math.PI / 180;
                const theta = (lon + 180) * Math.PI / 180;

                const x = EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
                const y = EARTH_RADIUS * Math.cos(phi);
                const z = EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);

                points.push(new THREE.Vector3(x, y, z));
            }
        }

        return points;
    }

    function createTectonicPlates() {
        plateData.forEach(plate => {
            const plateGroup = new THREE.Group();
            plateGroup.name = plate.name;

            const plateGeometry = createPlateGeometry(plate.segments, PLATE_THICKNESS);
            const texture = createRockTexture(plate.color);

            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.85,
                metalness: 0.15,
                side: THREE.DoubleSide,
                emissive: new THREE.Color(plate.color),
                emissiveIntensity: 0.1
            });

            const plateMesh = new THREE.Mesh(plateGeometry, material);
            plateMesh.castShadow = true;
            plateMesh.receiveShadow = true;
            plateGroup.add(plateMesh);

            // Magma glow at edges
            const edgeGlowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    glowColor: { value: new THREE.Color(0xff4400) }
                },
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 glowColor;
                    varying vec3 vNormal;

                    void main() {
                        float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1)), 3.0);
                        intensity *= (sin(time * 3.0) * 0.2 + 0.8);
                        vec3 glow = glowColor * intensity;
                        gl_FragColor = vec4(glow, intensity);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const glowMesh = new THREE.Mesh(plateGeometry.clone(), edgeGlowMaterial);
            glowMesh.scale.set(1.01, 1.01, 1.01);
            plateGroup.add(glowMesh);

            plateGroup.userData = {
                plate: plate,
                glowMaterial: edgeGlowMaterial,
                targetPosition: new THREE.Vector3(0, 0, 0),
                separationOffset: new THREE.Vector3(
                    plate.separationOffset.x,
                    plate.separationOffset.y,
                    plate.separationOffset.z
                )
            };

            scene.add(plateGroup);
            tectonicPlates.push(plateGroup);

            console.log(`✓ Created plate: ${plate.nameVi}`);
        });
    }

    function createPlateGeometry(points, thickness) {
        const geometry = new THREE.BufferGeometry();
        if (points.length < 3) return geometry;

        const vertices = [];
        const indices = [];
        const uvs = [];

        // Top vertices
        points.forEach(point => {
            vertices.push(point.x, point.y, point.z);
        });

        // Bottom vertices
        points.forEach(point => {
            const normal = point.clone().normalize();
            const bottom = point.clone().sub(normal.multiplyScalar(thickness));
            vertices.push(bottom.x, bottom.y, bottom.z);
        });

        // Top face
        for (let i = 1; i < points.length - 1; i++) {
            indices.push(0, i, i + 1);
        }

        // Bottom face
        const offset = points.length;
        for (let i = 1; i < points.length - 1; i++) {
            indices.push(offset, offset + i + 1, offset + i);
        }

        // Side faces
        for (let i = 0; i < points.length; i++) {
            const next = (i + 1) % points.length;
            indices.push(i, next, offset + i);
            indices.push(next, offset + next, offset + i);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        // UVs
        const posCount = vertices.length / 3;
        for (let i = 0; i < posCount; i++) {
            uvs.push(
                (vertices[i * 3] + EARTH_RADIUS) / (2 * EARTH_RADIUS),
                (vertices[i * 3 + 1] + EARTH_RADIUS) / (2 * EARTH_RADIUS)
            );
        }

        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        return geometry;
    }

    // ============================================
    // COMPLETE EARTH
    // ============================================

    function createCompleteEarth() {
        const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 256, 256);

        // Start with basic material, will load realistic texture
        const material = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x000000,
            shininess: 15,
            specular: 0x333333
        });

        completeEarth = new THREE.Mesh(geometry, material);
        completeEarth.visible = false;
        scene.add(completeEarth);

        // Load realistic NASA Blue Marble texture
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
            'https://unpkg.com/three-globe@2.24.9/example/img/earth-blue-marble.jpg',
            function(texture) {
                console.log('✓ NASA Blue Marble texture loaded!');
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.magFilter = THREE.LinearFilter;

                // Apply realistic texture
                completeEarth.material.map = texture;
                completeEarth.material.color = new THREE.Color(0xffffff);
                completeEarth.material.needsUpdate = true;
            },
            undefined,
            function(error) {
                console.error('Error loading NASA texture, using procedural:', error);
                // Fallback to procedural texture
                const earthTexture = createEarthTexture();
                completeEarth.material.map = earthTexture;
                completeEarth.material.color = new THREE.Color(0xffffff);
                completeEarth.material.needsUpdate = true;
            }
        );

        // Load bump map for terrain detail
        textureLoader.load(
            'https://unpkg.com/three-globe@2.24.9/example/img/earth-topology.png',
            function(bumpTexture) {
                console.log('✓ Earth topology loaded!');
                completeEarth.material.bumpMap = bumpTexture;
                completeEarth.material.bumpScale = 0.05;
                completeEarth.material.needsUpdate = true;
            }
        );

        // Load specular map for ocean reflection
        textureLoader.load(
            'https://unpkg.com/three-globe@2.24.9/example/img/earth-water.png',
            function(specularTexture) {
                console.log('✓ Earth specular map loaded!');
                completeEarth.material.specularMap = specularTexture;
                completeEarth.material.specular = new THREE.Color(0x444444);
                completeEarth.material.shininess = 25;
                completeEarth.material.needsUpdate = true;
            }
        );

        // Load night lights texture
        const cityLightsTexture = createCityLightsTexture();
        textureLoader.load(
            'https://unpkg.com/three-globe@2.24.9/example/img/earth-night.jpg',
            function(nightTexture) {
                console.log('✓ Earth night lights loaded!');

                // Create shader material with day/night
                const shaderMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        dayTexture: { value: completeEarth.material.map },
                        nightTexture: { value: nightTexture },
                        bumpMap: { value: completeEarth.material.bumpMap },
                        specularMap: { value: completeEarth.material.specularMap },
                        bumpScale: { value: 0.05 },
                        sunDirection: { value: new THREE.Vector3(1, 0.3, 0.8).normalize() }
                    },
                    vertexShader: `
                        varying vec3 vNormal;
                        varying vec3 vPosition;
                        varying vec2 vUv;

                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform sampler2D dayTexture;
                        uniform sampler2D nightTexture;
                        uniform sampler2D bumpMap;
                        uniform sampler2D specularMap;
                        uniform float bumpScale;
                        uniform vec3 sunDirection;

                        varying vec3 vNormal;
                        varying vec3 vPosition;
                        varying vec2 vUv;

                        void main() {
                            vec4 dayColor = texture2D(dayTexture, vUv);
                            vec4 nightColor = texture2D(nightTexture, vUv);
                            vec4 specular = texture2D(specularMap, vUv);

                            // Calculate day/night transition
                            float sunAngle = dot(vNormal, sunDirection);
                            float dayMix = smoothstep(-0.2, 0.2, sunAngle);

                            // Mix day and night textures
                            vec3 color = mix(nightColor.rgb * 0.8, dayColor.rgb, dayMix);

                            // Add specular highlight on oceans
                            float specularIntensity = specular.r;
                            float specularHighlight = pow(max(dot(reflect(-sunDirection, vNormal), normalize(-vPosition)), 0.0), 32.0);
                            color += vec3(specularHighlight * specularIntensity * 0.6);

                            // Add atmospheric scattering at edges
                            float rimLight = pow(1.0 - max(dot(vNormal, normalize(-vPosition)), 0.0), 3.0);
                            color += vec3(0.2, 0.4, 0.8) * rimLight * 0.3;

                            gl_FragColor = vec4(color, 1.0);
                        }
                    `,
                    side: THREE.FrontSide
                });

                completeEarth.material = shaderMaterial;
                completeEarth.material.needsUpdate = true;
            },
            undefined,
            function(error) {
                console.log('Night lights not available, using basic material');
            }
        );

        console.log('✓ Complete Earth created with NASA textures');
    }

    // ============================================
    // ATMOSPHERE
    // ============================================

    function createAtmosphere() {
        const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.12, 64, 64);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                sunDirection: { value: new THREE.Vector3(1, 0.3, 0.8).normalize() }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunDirection;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;

                void main() {
                    // Bright blue atmosphere
                    vec3 atmosColor = vec3(0.4, 0.7, 1.0);

                    // Strong Fresnel effect for glow
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
                    float intensity = pow(fresnel, 2.5);

                    // Enhance glow on sunlit side
                    float sunEffect = max(dot(vNormal, sunDirection), 0.0);
                    intensity *= (1.0 + sunEffect * 1.5);

                    // Brighter overall
                    gl_FragColor = vec4(atmosColor, intensity * 0.85);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false
        });

        atmosphere = new THREE.Mesh(geometry, material);
        atmosphere.visible = false; // Hidden initially
        scene.add(atmosphere);

        console.log('✓ Atmosphere created');
    }

    // ============================================
    // CLOUDS
    // ============================================

    function createClouds() {
        const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64);
        const cloudTexture = createCloudTexture();

        const material = new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            side: THREE.DoubleSide,
            shininess: 5
        });

        clouds = new THREE.Mesh(geometry, material);
        clouds.visible = false; // Hidden initially
        scene.add(clouds);

        console.log('✓ Clouds created');
    }

    // ============================================
    // ANIMATION SYSTEM
    // ============================================

    function updateAnimationState(progress) {
        animationProgress = progress;

        if (progress < PHASE_MOVING) {
            // Phase 1: Plates separated
            const separationProgress = progress / PHASE_MOVING;
            tectonicPlates.forEach(plate => {
                const offset = plate.userData.separationOffset;
                plate.position.copy(offset);
                plate.visible = true;
            });
            completeEarth.visible = false;
            atmosphere.visible = false;
            clouds.visible = false;

        } else if (progress < PHASE_MERGING) {
            // Phase 2: Plates moving together
            const moveProgress = (progress - PHASE_MOVING) / (PHASE_MERGING - PHASE_MOVING);
            const easeProgress = easeInOutCubic(moveProgress);

            tectonicPlates.forEach(plate => {
                const offset = plate.userData.separationOffset;
                const target = plate.userData.targetPosition;
                plate.position.lerpVectors(offset, target, easeProgress);
                plate.visible = true;
            });
            completeEarth.visible = false;
            atmosphere.visible = false;
            clouds.visible = false;

        } else if (progress < PHASE_COMPLETE) {
            // Phase 3: Plates merging, Earth appearing
            const mergeProgress = (progress - PHASE_MERGING) / (PHASE_COMPLETE - PHASE_MERGING);
            const easeProgress = easeInOutCubic(mergeProgress);

            // Fade out plates
            tectonicPlates.forEach(plate => {
                plate.visible = true;
                plate.traverse(child => {
                    if (child.material) {
                        child.material.opacity = 1 - easeProgress;
                        child.material.transparent = true;
                    }
                });
            });

            // Fade in complete Earth
            completeEarth.visible = true;

            // Set opacity if material supports it
            if (completeEarth.material.opacity !== undefined) {
                completeEarth.material.transparent = true;
                completeEarth.material.opacity = easeProgress;
            }

            atmosphere.visible = false;
            clouds.visible = false;

        } else {
            // Phase 4: Complete Earth fully visible
            const completeProgress = (progress - PHASE_COMPLETE) / (1 - PHASE_COMPLETE);

            tectonicPlates.forEach(plate => {
                plate.visible = false;
            });

            completeEarth.visible = true;

            // Ensure Earth is fully opaque
            if (completeEarth.material.opacity !== undefined) {
                completeEarth.material.transparent = false;
                completeEarth.material.opacity = 1.0;
                completeEarth.material.needsUpdate = true;
            }

            atmosphere.visible = true;
            clouds.visible = true;

            // Atmosphere fade in
            atmosphere.material.uniforms.sunDirection.value.set(
                Math.cos(completeProgress * Math.PI * 2),
                0.3,
                Math.sin(completeProgress * Math.PI * 2)
            );
        }

        updateProgressBar(progress);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        controls.update();

        // Update animation
        if (isAnimating) {
            animationProgress += (delta * animationSpeed) / ANIMATION_DURATION;
            if (animationProgress >= 1) {
                animationProgress = 1;
                isAnimating = false;
            }
            updateAnimationState(animationProgress);
        }

        // Update glow materials
        tectonicPlates.forEach(plate => {
            if (plate.userData.glowMaterial) {
                plate.userData.glowMaterial.uniforms.time.value = elapsed;
            }
        });

        // Rotate clouds slowly
        if (clouds && clouds.visible) {
            clouds.rotation.y += delta * 0.02;
        }

        // Update Earth shader (if using shader material)
        if (completeEarth && completeEarth.visible) {
            if (completeEarth.material.uniforms && completeEarth.material.uniforms.sunDirection) {
                // Slowly rotate sun direction for dynamic lighting
                const sunAngle = elapsed * 0.1;
                completeEarth.material.uniforms.sunDirection.value.set(
                    Math.cos(sunAngle),
                    0.3,
                    Math.sin(sunAngle)
                ).normalize();
            }
        }

        renderer.render(scene, camera);
    }

    // ============================================
    // UI
    // ============================================

    function createUI(container) {
        // Info Panel (left)
        const infoPanel = document.createElement('div');
        infoPanel.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-width: 320px;
            z-index: 100;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        `;

        infoPanel.innerHTML = `
            <h1 style="font-size: 16px; margin-bottom: 12px; color: #00ffff; text-shadow: 0 0 10px #00ffff;">
                🌍 MÔ PHỎNG THUYẾT KIẾN TẠO MẢNG
            </h1>
            <p style="font-size: 11px; line-height: 1.6; margin-bottom: 8px; color: #cccccc;">
                Mô phỏng quá trình các mảng kiến tạo di chuyển, ghép nối và hợp nhất thành Trái Đất hoàn chỉnh.
            </p>
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); margin: 12px 0; padding-top: 12px;">
                <strong style="color: #00ffff; font-size: 12px;">CÁC GIAI ĐOẠN:</strong>
                <ul style="font-size: 10px; line-height: 1.8; color: #aaa; padding-left: 20px; margin: 8px 0;">
                    <li>0-30%: Các mảng tách rời</li>
                    <li>30-60%: Di chuyển & tiếp cận</li>
                    <li>60-85%: Ghép nối & hợp nhất</li>
                    <li>85-100%: Trái Đất hoàn chỉnh</li>
                </ul>
            </div>
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); margin-top: 12px; padding-top: 12px;">
                <strong style="color: #00ffff; font-size: 11px;">7 MẢNG KIẾN TẠO:</strong>
                ${plateData.map(p => `
                    <div style="display: flex; align-items: center; margin: 6px 0; font-size: 10px;">
                        <div style="width: 16px; height: 16px; border-radius: 3px; margin-right: 8px;
                                    background: ${p.color}; border: 1px solid rgba(255, 255, 255, 0.3);"></div>
                        <span>${p.nameVi}</span>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(infoPanel);

        // Control Panel (right)
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            max-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        `;

        controlPanel.innerHTML = `
            <div style="margin-bottom: 12px;">
                <button id="btn-play" style="background: linear-gradient(135deg, #00ff88, #00aa55); color: white; border: none;
                        padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 11px; margin-right: 5px; font-weight: bold;
                        box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3); transition: all 0.3s;">
                    ▶ PHÁT ANIMATION
                </button>
                <button id="btn-pause" style="background: linear-gradient(135deg, #ffaa00, #ff8800); color: white; border: none;
                        padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 11px; margin-right: 5px; font-weight: bold;
                        box-shadow: 0 4px 12px rgba(255, 170, 0, 0.3);">
                    ⏸ TẠM DỪNG
                </button>
                <button id="btn-reset" style="background: linear-gradient(135deg, #ff4444, #cc0000); color: white; border: none;
                        padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;
                        box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);">
                    ⟲ RESET
                </button>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 11px; margin-bottom: 5px; color: #00ffff; font-weight: bold;">
                    Tốc độ animation:
                </label>
                <input type="range" id="speed-slider" min="0.1" max="3" step="0.1" value="1"
                       style="width: 100%; margin: 5px 0;">
                <span id="speed-value" style="font-size: 11px; color: #aaa;">1.0x</span>
            </div>

            <div style="margin-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 12px;">
                <div style="width: 100%; height: 10px; background: rgba(255, 255, 255, 0.15); border-radius: 5px; overflow: hidden;
                            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);">
                    <div id="progress-bar" style="width: 0%; height: 100%;
                         background: linear-gradient(90deg, #00ff88, #00ffff, #0088ff);
                         transition: width 0.3s; box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);"></div>
                </div>
                <p id="progress-text" style="font-size: 11px; color: #00ffff; margin-top: 8px; text-align: center; font-weight: bold;">
                    0% - Sẵn sàng
                </p>
            </div>
        `;

        container.appendChild(controlPanel);

        console.log('✓ UI created');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        document.getElementById('btn-play').addEventListener('click', () => {
            isAnimating = true;
        });

        document.getElementById('btn-pause').addEventListener('click', () => {
            isAnimating = false;
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            animationProgress = 0;
            isAnimating = false;
            updateAnimationState(0);
        });

        document.getElementById('speed-slider').addEventListener('input', (e) => {
            animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = animationSpeed.toFixed(1) + 'x';
        });

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        const container = document.getElementById('plate-tectonics-container');
        if (container && container.style.display !== 'none' && renderer) {
            const width = container.clientWidth;
            const height = container.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }

    function updateProgressBar(progress) {
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');

        if (bar) bar.style.width = (progress * 100) + '%';

        if (text) {
            const percentage = Math.round(progress * 100);
            let phase = '';
            if (progress < PHASE_MOVING) phase = 'Các mảng tách rời';
            else if (progress < PHASE_MERGING) phase = 'Di chuyển & tiếp cận';
            else if (progress < PHASE_COMPLETE) phase = 'Ghép nối & hợp nhất';
            else phase = 'Trái Đất hoàn chỉnh!';

            text.textContent = `${percentage}% - ${phase}`;
        }
    }

    // ============================================
    // EXPOSE TO GLOBAL
    // ============================================

    window.initPlateTectonics2D = initPlateTectonics2D;

    console.log('✅ Tectonic Plates → Complete Earth Module Loaded!');

})();

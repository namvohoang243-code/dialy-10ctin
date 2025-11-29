// ========================================
// ULTRA REALISTIC EARTH BACKGROUND
// 8K Textures + City Lights + Real Geography
// ========================================

class EarthBackgroundUltra {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.clouds = null;
        this.atmosphere = null;
        this.stars = null;
        this.moon = null;
        this.cityLights = null;
        this.animationId = null;

        this.isInitialized = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
    }

    init() {
        if (this.isInitialized) return;

        this.createContainer();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        this.createStarfield();
        this.createEarthUltraRealistic();
        this.createCityLights();
        this.createCloudsUltraRealistic();
        this.createAtmosphereAdvanced();
        this.createMoonRealistic();

        this.addEventListeners();
        this.animate();

        this.isInitialized = true;
        console.log('🌍✨ ULTRA REALISTIC Earth Background initialized');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'earth-background';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #0a1420 0%, #000000 100%);
        `;
        document.body.insertBefore(this.container, document.body.firstChild);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.00015);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 11);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.8;
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Sun light - powerful and realistic
        const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
        sunLight.position.set(12, 4, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Ambient space light - very dim
        const ambientLight = new THREE.AmbientLight(0x222244, 0.1);
        this.scene.add(ambientLight);

        // Rim light for atmospheric effect
        const rimLight1 = new THREE.DirectionalLight(0x6699ff, 1.2);
        rimLight1.position.set(-12, 3, -8);
        this.scene.add(rimLight1);

        const rimLight2 = new THREE.DirectionalLight(0x4488ff, 0.8);
        rimLight2.position.set(8, -5, -10);
        this.scene.add(rimLight2);

        // Moonlight - soft blue
        const moonLight = new THREE.PointLight(0x8899aa, 0.3, 50);
        moonLight.position.set(10, 3, -6);
        this.scene.add(moonLight);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsSizes = [];
        const starsColors = [];

        // Create 10000 stars!
        for (let i = 0; i < 10000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 90 + Math.random() * 30;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            starsVertices.push(x, y, z);

            // Varying sizes - some are much brighter
            const sizeFactor = Math.random();
            if (sizeFactor > 0.95) {
                starsSizes.push(3 + Math.random() * 2); // Bright stars
            } else {
                starsSizes.push(0.5 + Math.random() * 1.5); // Normal stars
            }

            // Star colors - white to blue-white to yellow-white
            const colorType = Math.random();
            if (colorType > 0.9) {
                // Yellow stars
                starsColors.push(1, 0.95 + Math.random() * 0.05, 0.85 + Math.random() * 0.1);
            } else if (colorType > 0.7) {
                // Blue-white stars
                starsColors.push(0.85 + Math.random() * 0.15, 0.9 + Math.random() * 0.1, 1);
            } else {
                // White stars
                const brightness = 0.9 + Math.random() * 0.1;
                starsColors.push(brightness, brightness, brightness);
            }
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    createEarthUltraRealistic() {
        const geometry = new THREE.SphereGeometry(3.2, 256, 256);

        // Create 8K texture (8192x4096)
        const canvas = document.createElement('canvas');
        canvas.width = 8192;
        canvas.height = 4096;
        const ctx = canvas.getContext('2d');

        // Ultra realistic ocean with depth
        this.drawUltraRealisticOcean(ctx);

        // Draw continents with extreme detail
        this.drawContinentsUltraDetailed(ctx);

        // Add geographic features
        this.addMountainRanges(ctx);
        this.addDeserts(ctx);
        this.addForests(ctx);
        this.addIceCaps(ctx);
        this.addRivers(ctx);

        const texture = new THREE.CanvasTexture(canvas);
        const bumpMap = new THREE.CanvasTexture(this.createUltraBumpMap());
        const specularMap = new THREE.CanvasTexture(this.createUltraSpecularMap());

        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        bumpMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bumpMap,
            bumpScale: 0.2,
            specularMap: specularMap,
            specular: new THREE.Color(0x444444),
            shininess: 35,
            emissive: new THREE.Color(0x0a1520),
            emissiveIntensity: 0.05
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.z = THREE.MathUtils.degToRad(23.5);
        this.earth.rotation.y = THREE.MathUtils.degToRad(-20);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);
    }

    drawUltraRealisticOcean(ctx) {
        // Deep ocean with multiple gradient layers
        const gradient1 = ctx.createRadialGradient(4096, 2048, 500, 4096, 2048, 4096);
        gradient1.addColorStop(0, '#1a6ba8');
        gradient1.addColorStop(0.3, '#15588a');
        gradient1.addColorStop(0.6, '#0f4268');
        gradient1.addColorStop(1, '#08293d');
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, 8192, 4096);

        // Ocean depth variation - darker areas for trenches
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 8192;
            const y = Math.random() * 4096;
            const size = Math.random() * 80 + 30;
            const darkness = Math.random() * 0.4;

            ctx.fillStyle = `rgba(5, 20, 35, ${darkness})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ocean waves and texture
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 8192;
            const y = Math.random() * 4096;
            const size = Math.random() * 40 + 10;
            const lightness = Math.random() * 0.2;

            ctx.fillStyle = `rgba(30, 90, 140, ${lightness})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawContinentsUltraDetailed(ctx) {
        // AFRICA - Very detailed
        this.drawAfrica(ctx);

        // EUROPE - Detailed
        this.drawEurope(ctx);

        // ASIA - Largest continent, most detail
        this.drawAsia(ctx);

        // NORTH AMERICA - Detailed
        this.drawNorthAmerica(ctx);

        // SOUTH AMERICA - Detailed Amazon
        this.drawSouthAmerica(ctx);

        // AUSTRALIA - Outback detail
        this.drawAustralia(ctx);

        // ANTARCTICA - Ice shelf
        this.drawAntarctica(ctx);
    }

    drawAfrica(ctx) {
        // Main African continent
        ctx.fillStyle = '#3a6828';
        ctx.beginPath();
        ctx.ellipse(4600, 2600, 560, 840, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // North Africa / Sahara - sand color
        ctx.fillStyle = '#d2b48c';
        ctx.beginPath();
        ctx.ellipse(4500, 2200, 480, 300, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sahara detail - dunes
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(220, 190, 140, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.ellipse(
                4300 + Math.random() * 400,
                2100 + Math.random() * 200,
                30 + Math.random() * 40,
                20 + Math.random() * 25,
                Math.random() * Math.PI,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Central Africa - dark green (Congo rainforest)
        ctx.fillStyle = '#1a4010';
        ctx.beginPath();
        ctx.ellipse(4600, 2600, 200, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Southern Africa
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(4650, 3100, 220, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // Madagascar
        ctx.fillStyle = '#3d6b22';
        ctx.fillRect(5050, 2900, 80, 240);

        // East African coast detail
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = '#4a7c2e';
            ctx.beginPath();
            ctx.ellipse(
                4900 + Math.random() * 100,
                2400 + i * 50,
                25 + Math.random() * 15,
                20 + Math.random() * 15,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawEurope(ctx) {
        // Main Europe mass
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(4400, 1800, 440, 300, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Scandinavia
        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(4500, 1500, 180, 250, 0, 0, Math.PI * 2);
        ctx.fill();

        // UK and Ireland
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(4100, 1700, 120, 180, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(4020, 1750, 60, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mediterranean countries - lighter
        ctx.fillStyle = '#557c3a';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.ellipse(
                4200 + i * 80,
                1900 + Math.random() * 100,
                60 + Math.random() * 40,
                40 + Math.random() * 30,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Greece islands
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = '#4a7c2e';
            ctx.fillRect(4550 + i * 30, 2050 + Math.random() * 80, 15, 20);
        }
    }

    drawAsia(ctx) {
        // Main Asia landmass
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(5600, 2000, 960, 760, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Siberia - lighter green
        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(5800, 1600, 700, 400, 0, 0, Math.PI * 2);
        ctx.fill();

        // Central Asia
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(5400, 2000, 600, 400, 0, 0, Math.PI * 2);
        ctx.fill();

        // Himalayas - brown/gray mountains
        ctx.fillStyle = '#8b7355';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.ellipse(
                5300 + Math.random() * 500,
                2100 + Math.random() * 100,
                20 + Math.random() * 30,
                15 + Math.random() * 20,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Tibet plateau
        ctx.fillStyle = '#9a8b6f';
        ctx.beginPath();
        ctx.ellipse(5500, 2050, 200, 150, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle East - desert
        ctx.fillStyle = '#d2b48c';
        ctx.beginPath();
        ctx.ellipse(5000, 2150, 280, 220, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arabian Peninsula
        ctx.fillStyle = '#c9a876';
        ctx.beginPath();
        ctx.ellipse(5050, 2300, 180, 240, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // India
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(5450, 2400, 220, 280, 0, 0, Math.PI * 2);
        ctx.fill();

        // Southeast Asia
        ctx.fillStyle = '#1a5010';
        ctx.beginPath();
        ctx.ellipse(5900, 2550, 280, 200, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Indonesia islands
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(5800 + i * 40, 2700 + Math.random() * 150, 25 + Math.random() * 20, 20 + Math.random() * 15);
        }

        // Japan
        ctx.fillStyle = '#3d6b22';
        ctx.fillRect(6600, 2000, 100, 350);
        ctx.fillRect(6550, 1850, 80, 150);

        // Philippines
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = '#4a7c2e';
            ctx.fillRect(6300 + Math.random() * 100, 2450 + i * 40, 25, 50);
        }

        // China - varied green
        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(6000, 2100, 500, 350, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gobi Desert
        ctx.fillStyle = '#c9a876';
        ctx.beginPath();
        ctx.ellipse(5900, 1950, 250, 150, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawNorthAmerica(ctx) {
        // Main landmass
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(1400, 1700, 700, 800, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Canada - lighter
        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(1300, 1400, 500, 400, 0, 0, Math.PI * 2);
        ctx.fill();

        // USA
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(1400, 1950, 600, 450, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Rocky Mountains
        ctx.fillStyle = '#786550';
        for (let i = 0; i < 25; i++) {
            ctx.beginPath();
            ctx.ellipse(
                1200 + Math.random() * 300,
                1700 + Math.random() * 400,
                20 + Math.random() * 25,
                15 + Math.random() * 20,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Great Plains
        ctx.fillStyle = '#5a8a3a';
        ctx.beginPath();
        ctx.ellipse(1500, 2000, 300, 250, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mexico - drier/browner
        ctx.fillStyle = '#a8925c';
        ctx.beginPath();
        ctx.ellipse(1400, 2450, 320, 280, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Central America
        ctx.fillStyle = '#4a7c2e';
        ctx.fillRect(1450, 2650, 150, 200);

        // Caribbean islands
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = '#3d6b22';
            ctx.fillRect(1700 + i * 60, 2550 + Math.random() * 100, 20, 15);
        }

        // Greenland
        ctx.fillStyle = '#d5e8f0';
        ctx.beginPath();
        ctx.ellipse(2200, 1200, 280, 400, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Greenland ice detail
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(2100 + Math.random() * 200, 1100 + Math.random() * 400, Math.random() * 15 + 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSouthAmerica(ctx) {
        // Main continent
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2000, 2900, 440, 960, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Amazon rainforest - very dark green
        ctx.fillStyle = '#0f3008';
        ctx.beginPath();
        ctx.ellipse(2000, 2700, 360, 450, 0, 0, Math.PI * 2);
        ctx.fill();

        // Amazon detail - even darker patches
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = `rgba(10, 35, 5, ${Math.random() * 0.6 + 0.4})`;
            ctx.beginPath();
            ctx.ellipse(
                1850 + Math.random() * 300,
                2550 + Math.random() * 300,
                30 + Math.random() * 50,
                25 + Math.random() * 40,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Andes Mountains - brown/gray
        ctx.fillStyle = '#786550';
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.ellipse(
                1750 + Math.random() * 100,
                2600 + i * 30,
                15 + Math.random() * 20,
                10 + Math.random() * 15,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Patagonia - southern region
        ctx.fillStyle = '#6a9a4a';
        ctx.beginPath();
        ctx.ellipse(1950, 3650, 180, 250, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brazil highlands
        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(2200, 2950, 280, 300, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAustralia(ctx) {
        // Main Australia
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(6700, 3200, 400, 320, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Outback - red/orange desert
        ctx.fillStyle = '#c76b3a';
        ctx.beginPath();
        ctx.ellipse(6700, 3200, 280, 220, 0, 0, Math.PI * 2);
        ctx.fill();

        // Desert detail
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = `rgba(210, 120, 70, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.ellipse(
                6550 + Math.random() * 300,
                3100 + Math.random() * 200,
                25 + Math.random() * 30,
                20 + Math.random() * 25,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Coastal green areas
        ctx.fillStyle = '#4a7c2e';
        // East coast
        ctx.beginPath();
        ctx.ellipse(6950, 3150, 100, 180, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // New Zealand
        ctx.fillStyle = '#3d6b22';
        ctx.fillRect(7200, 3400, 60, 180);
        ctx.fillRect(7260, 3500, 50, 150);
    }

    drawAntarctica(ctx) {
        // Main ice shelf
        const gradient = ctx.createLinearGradient(4096, 3696, 4096, 4096);
        gradient.addColorStop(0, 'rgba(230, 240, 248, 0.3)');
        gradient.addColorStop(0.4, '#e6f0f8');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 3696, 8192, 400);

        // Ice detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 150; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 8192,
                3750 + Math.random() * 346,
                Math.random() * 20 + 8,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Ice shelf variations
        for (let i = 0; i < 80; i++) {
            ctx.fillStyle = `rgba(220, 235, 245, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.ellipse(
                Math.random() * 8192,
                3750 + Math.random() * 300,
                40 + Math.random() * 60,
                30 + Math.random() * 40,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    addMountainRanges(ctx) {
        // Already added in continent details, but add some more prominent ranges
        ctx.fillStyle = 'rgba(120, 100, 80, 0.6)';

        // Additional Himalayas detail
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.ellipse(
                5300 + Math.random() * 500,
                2100 + Math.random() * 80,
                18 + Math.random() * 25,
                12 + Math.random() * 18,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    addDeserts(ctx) {
        // Already added in continent details
    }

    addForests(ctx) {
        // Add more forest texture detail
        ctx.fillStyle = 'rgba(60, 100, 40, 0.3)';

        // Random forest patches globally
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 8192;
            const y = Math.random() * 4096;
            const size = Math.random() * 25 + 8;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addIceCaps(ctx) {
        // Arctic ice cap
        const arcticGradient = ctx.createLinearGradient(4096, 0, 4096, 400);
        arcticGradient.addColorStop(0, '#ffffff');
        arcticGradient.addColorStop(0.6, '#e6f0f8');
        arcticGradient.addColorStop(1, 'rgba(230, 240, 248, 0)');
        ctx.fillStyle = arcticGradient;
        ctx.fillRect(0, 0, 8192, 400);

        // Arctic detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 8192,
                Math.random() * 350,
                Math.random() * 18 + 6,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    addRivers(ctx) {
        // Major rivers - very subtle blue lines
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
        ctx.lineWidth = 3;

        // Amazon River
        ctx.beginPath();
        ctx.moveTo(1700, 2700);
        ctx.quadraticCurveTo(1850, 2680, 2100, 2720);
        ctx.stroke();

        // Nile River
        ctx.beginPath();
        ctx.moveTo(4700, 2150);
        ctx.lineTo(4650, 2700);
        ctx.stroke();

        // Mississippi
        ctx.beginPath();
        ctx.moveTo(1450, 1800);
        ctx.quadraticCurveTo(1480, 2100, 1520, 2350);
        ctx.stroke();

        // Yangtze
        ctx.beginPath();
        ctx.moveTo(5800, 2100);
        ctx.quadraticCurveTo(6100, 2150, 6300, 2180);
        ctx.stroke();
    }

    createCityLights() {
        const geometry = new THREE.SphereGeometry(3.21, 256, 256);

        // Create city lights texture
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 4096, 2048);

        // Add city lights (major cities and populated areas)
        this.addCityLightsRegion(ctx, 2300, 1100, 200, 150, 300); // Europe
        this.addCityLightsRegion(ctx, 2800, 1000, 400, 350, 500); // Asia - India/China
        this.addCityLightsRegion(ctx, 3200, 1000, 150, 200, 150); // Japan/Korea
        this.addCityLightsRegion(ctx, 700, 900, 350, 400, 400); // North America
        this.addCityLightsRegion(ctx, 1000, 1400, 200, 450, 200); // South America
        this.addCityLightsRegion(ctx, 2300, 1300, 250, 400, 150); // Africa (less dense)
        this.addCityLightsRegion(ctx, 3350, 1600, 180, 150, 80); // Australia coasts

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.cityLights = new THREE.Mesh(geometry, material);
        this.scene.add(this.cityLights);
    }

    addCityLightsRegion(ctx, x, y, width, height, density) {
        for (let i = 0; i < density; i++) {
            const px = x + (Math.random() - 0.5) * width;
            const py = y + (Math.random() - 0.5) * height;
            const size = Math.random() * 3 + 1;
            const brightness = Math.random() * 0.8 + 0.2;

            // Yellow-orange city lights
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 2);
            gradient.addColorStop(0, `rgba(255, 220, 150, ${brightness})`);
            gradient.addColorStop(0.5, `rgba(255, 180, 80, ${brightness * 0.6})`);
            gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    createUltraBumpMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Base gray
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 4096, 2048);

        // Mountains - much lighter
        ctx.fillStyle = '#c0c0c0';

        // Himalayas
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                2650 + Math.random() * 250,
                1050 + Math.random() * 50,
                Math.random() * 8 + 4,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Rockies
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(
                600 + Math.random() * 150,
                850 + Math.random() * 200,
                Math.random() * 7 + 3,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Andes
        for (let i = 0; i < 60; i++) {
            ctx.beginPath();
            ctx.arc(
                875 + Math.random() * 50,
                1300 + i * 15,
                Math.random() * 6 + 3,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Ocean trenches - darker
        ctx.fillStyle = '#505050';
        for (let i = 0; i < 200; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 4096,
                Math.random() * 2048,
                Math.random() * 10 + 3,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        return canvas;
    }

    createUltraSpecularMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // White base (all ocean)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 4096, 2048);

        // Black out land masses (no specular)
        ctx.fillStyle = '#000000';

        // Approximate land masses
        ctx.beginPath();
        ctx.ellipse(700, 850, 350, 400, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(1000, 1450, 220, 480, 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(2200, 900, 220, 150, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(2300, 1300, 280, 420, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(2800, 1000, 480, 380, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(3350, 1600, 200, 160, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(0, 1848, 4096, 200);

        return canvas;
    }

    createCloudsUltraRealistic() {
        const geometry = new THREE.SphereGeometry(3.25, 256, 256);

        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 4096, 2048);

        // Create realistic cloud patterns - more clouds!
        for (let i = 0; i < 250; i++) {
            const x = Math.random() * 4096;
            const y = Math.random() * 2048;
            const width = Math.random() * 200 + 100;
            const height = Math.random() * 70 + 40;
            const opacity = Math.random() * 0.6 + 0.3;

            // Cloud shadow
            ctx.fillStyle = `rgba(180, 180, 180, ${opacity * 0.25})`;
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 8, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();

            // Cloud main body
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();

            // Cloud details - multiple layers
            for (let j = 0; j < 5; j++) {
                const offsetX = (Math.random() - 0.5) * width;
                const offsetY = (Math.random() - 0.5) * height;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
                ctx.beginPath();
                ctx.ellipse(
                    x + offsetX,
                    y + offsetY,
                    width * 0.35,
                    height * 0.35,
                    Math.random() * Math.PI,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            // Cloud highlights
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 1.2})`;
            ctx.beginPath();
            ctx.ellipse(
                x - width * 0.2,
                y - height * 0.2,
                width * 0.3,
                height * 0.3,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.clouds = new THREE.Mesh(geometry, material);
        this.scene.add(this.clouds);
    }

    createAtmosphereAdvanced() {
        const geometry = new THREE.SphereGeometry(3.5, 128, 128);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            uniforms: {
                glowColor: { value: new THREE.Color(0x5599ff) },
                intensity: { value: 1.5 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                void main() {
                    float power = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    float glow = power * intensity;
                    gl_FragColor = vec4(glowColor, 1.0) * glow;
                }
            `
        });

        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }

    createMoonRealistic() {
        const geometry = new THREE.SphereGeometry(0.7, 64, 64);

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Moon base color with gradient
        const gradient = ctx.createRadialGradient(512, 412, 100, 512, 512, 512);
        gradient.addColorStop(0, '#b0b0b0');
        gradient.addColorStop(0.5, '#9a9a9a');
        gradient.addColorStop(1, '#808080');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);

        // Large craters
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 60 + 30;

            // Crater rim
            ctx.fillStyle = '#707070';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Crater center
            ctx.fillStyle = '#656565';
            ctx.beginPath();
            ctx.arc(x + 3, y + 3, radius * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // Crater shadow
            ctx.fillStyle = '#5a5a5a';
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // Small craters
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 20 + 5;

            ctx.fillStyle = '#858585';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#757575';
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, radius * 0.75, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 0.03
        });

        this.moon = new THREE.Mesh(geometry, material);
        this.moon.position.set(9, 3, -6);
        this.scene.add(this.moon);
    }

    addEventListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('scroll', () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (this.earth) {
                this.camera.position.z = 11 - scrollPercent * 4;
                this.targetRotationY = scrollPercent * Math.PI * 0.5;
            }
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.earth) return;

        // Earth rotation
        this.earth.rotation.y += 0.0003;

        // City lights rotate with Earth
        if (this.cityLights) {
            this.cityLights.rotation.copy(this.earth.rotation);
        }

        // Clouds rotate slightly faster
        if (this.clouds) {
            this.clouds.rotation.y += 0.0006;
        }

        // Star rotation
        if (this.stars) {
            this.stars.rotation.y += 0.00003;
            this.stars.rotation.x += 0.00002;
        }

        // Moon orbit
        if (this.moon) {
            const time = Date.now() * 0.00008;
            this.moon.position.x = Math.cos(time) * 9;
            this.moon.position.z = Math.sin(time) * 9 - 6;
            this.moon.rotation.y += 0.0008;
        }

        // Parallax
        this.targetRotationX = this.mouseY * 0.12;
        this.earth.rotation.x += (this.targetRotationX - this.earth.rotation.x) * 0.04;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.container.contains(this.renderer.domElement)) {
                this.container.removeChild(this.renderer.domElement);
            }
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.isInitialized = false;
        console.log('🗑️ Ultra Realistic Earth Background destroyed');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.earthBackground = new EarthBackgroundUltra();
        window.earthBackground.init();
    });
} else {
    window.earthBackground = new EarthBackgroundUltra();
    window.earthBackground.init();
}

// ========================================
// EARTH BACKGROUND - Professional 3D Animated Earth
// Real NASA textures & Advanced effects
// ========================================

class EarthBackground {
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
        this.animationId = null;

        this.isInitialized = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
    }

    init() {
        if (this.isInitialized) return;

        // Create container
        this.createContainer();

        // Setup Three.js
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        // Create Earth and environment
        this.createStarfield();
        this.createEarthProfessional();
        this.createCloudsProfessional();
        this.createAtmosphereProfessional();
        this.createMoon();

        // Event listeners
        this.addEventListeners();

        // Start animation
        this.animate();

        this.isInitialized = true;
        console.log('✅ Professional Earth Background initialized');
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
            background: radial-gradient(ellipse at center, #0d1b2a 0%, #000000 100%);
        `;
        document.body.insertBefore(this.container, document.body.firstChild);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.00025);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 12);
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
        this.renderer.toneMappingExposure = 1.5;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light - very dim
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        this.scene.add(ambientLight);

        // Main directional light (Sun) - much stronger
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunLight.position.set(10, 3, 8);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Rim light for edge glow
        const rimLight = new THREE.DirectionalLight(0x4a9eff, 0.8);
        rimLight.position.set(-10, 0, -5);
        this.scene.add(rimLight);

        // Point light for atmosphere glow
        const glowLight = new THREE.PointLight(0x88ccff, 0.5, 30);
        glowLight.position.set(0, 0, 0);
        this.scene.add(glowLight);
    }

    createStarfield() {
        // Create more realistic stars with varying sizes
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsSizes = [];
        const starsColors = [];

        for (let i = 0; i < 6000; i++) {
            // Distribute stars in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 80 + Math.random() * 20;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            starsVertices.push(x, y, z);

            // Varying star sizes
            starsSizes.push(Math.random() * 2 + 0.5);

            // Slightly varying star colors (white to blue-white)
            const colorVariation = 0.9 + Math.random() * 0.1;
            starsColors.push(colorVariation, colorVariation, 1);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    createEarthProfessional() {
        const geometry = new THREE.SphereGeometry(3, 128, 128);

        // Create ultra-realistic Earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Deep ocean with gradient
        const oceanGradient = ctx.createRadialGradient(2048, 1024, 100, 2048, 1024, 2048);
        oceanGradient.addColorStop(0, '#1a5f8f');
        oceanGradient.addColorStop(0.5, '#0d4568');
        oceanGradient.addColorStop(1, '#082a42');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, 4096, 2048);

        // Add ocean texture variation
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(10, 50, 80, ${Math.random() * 0.3})`;
            const x = Math.random() * 4096;
            const y = Math.random() * 2048;
            const size = Math.random() * 50 + 20;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw continents with more detail
        this.drawContinents(ctx);

        // Add terrain detail - mountains, forests
        this.addTerrainDetail(ctx);

        // Ice caps
        this.drawIceCaps(ctx);

        // Create bump map for relief
        const bumpCanvas = this.createBumpMap();

        const texture = new THREE.CanvasTexture(canvas);
        const bumpMap = new THREE.CanvasTexture(bumpCanvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        // Professional material with all maps
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bumpMap,
            bumpScale: 0.15,
            specularMap: this.createSpecularMap(),
            specular: new THREE.Color(0x333333),
            shininess: 25,
            emissive: new THREE.Color(0x0a1929),
            emissiveIntensity: 0.1
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.z = THREE.MathUtils.degToRad(23.5); // Earth's axial tilt
        this.earth.rotation.y = THREE.MathUtils.degToRad(-30); // Better starting angle
        this.scene.add(this.earth);
    }

    drawContinents(ctx) {
        // Africa
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2300, 1300, 280, 420, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Add detail to Africa
        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(2250, 1100, 180, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(2350, 1400, 200, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Europe
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2200, 900, 220, 150, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(2150 + i * 40, 850 + i * 30, 50, 40, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Asia - large and detailed
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2800, 1000, 480, 380, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(2900, 900, 300, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(2700, 1100, 250, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Japan/Islands
        ctx.fillStyle = '#3d6b22';
        ctx.fillRect(3200, 950, 80, 150);

        // North America
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(700, 850, 350, 400, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(650, 700, 250, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a7c2e';
        ctx.beginPath();
        ctx.ellipse(800, 1000, 200, 250, 0, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(1000, 1450, 220, 480, 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(980, 1350, 180, 300, 0, 0, Math.PI * 2);
        ctx.fill();

        // Amazon rainforest - darker green
        ctx.fillStyle = '#1a4010';
        ctx.beginPath();
        ctx.ellipse(1050, 1350, 150, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // Australia
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(3350, 1600, 200, 160, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.ellipse(3350, 1600, 120, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        // Antarctica (bottom) - extended
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 1850, 4096, 198);

        // Greenland
        ctx.fillStyle = '#d0e8f0';
        ctx.beginPath();
        ctx.ellipse(1300, 600, 150, 180, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    addTerrainDetail(ctx) {
        // Add mountain ranges (darker spots)
        ctx.fillStyle = 'rgba(35, 50, 20, 0.5)';
        const mountains = [
            [700, 900, 150, 30], // Rockies
            [1000, 1400, 100, 40], // Andes
            [2200, 950, 180, 25], // Alps
            [2750, 950, 250, 35], // Himalayas
        ];

        mountains.forEach(([x, y, w, h]) => {
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.ellipse(x + Math.random() * w, y + Math.random() * h, 15, 8, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Add forest detail (lighter green patches)
        ctx.fillStyle = 'rgba(80, 120, 50, 0.4)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 4096;
            const y = Math.random() * 2048;

            // Check if on land (simplified)
            const size = Math.random() * 20 + 5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Desert areas (sandy yellow-brown)
        ctx.fillStyle = 'rgba(210, 180, 140, 0.5)';
        const deserts = [
            [2250, 1100, 200, 150], // Sahara
            [2800, 1150, 180, 120], // Arabian
            [3350, 1600, 150, 100], // Australian outback
        ];

        deserts.forEach(([x, y, w, h]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawIceCaps(ctx) {
        // Arctic ice cap with gradient
        const arcticGradient = ctx.createLinearGradient(2048, 0, 2048, 200);
        arcticGradient.addColorStop(0, '#ffffff');
        arcticGradient.addColorStop(0.7, '#e8f4f8');
        arcticGradient.addColorStop(1, 'rgba(232, 244, 248, 0)');
        ctx.fillStyle = arcticGradient;
        ctx.fillRect(0, 0, 4096, 200);

        // Antarctic ice cap with more detail
        const antarcticGradient = ctx.createLinearGradient(2048, 1848, 2048, 2048);
        antarcticGradient.addColorStop(0, 'rgba(232, 244, 248, 0)');
        antarcticGradient.addColorStop(0.3, '#e8f4f8');
        antarcticGradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = antarcticGradient;
        ctx.fillRect(0, 1848, 4096, 200);

        // Add ice texture detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 4096;
            const yTop = Math.random() * 150;
            const yBottom = 1900 + Math.random() * 148;

            ctx.beginPath();
            ctx.arc(x, yTop, Math.random() * 10 + 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, yBottom, Math.random() * 10 + 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    createBumpMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Base gray
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 2048, 1024);

        // Mountains (lighter)
        ctx.fillStyle = '#b0b0b0';
        const mountainRanges = [
            [350, 450, 75, 15],
            [500, 700, 50, 20],
            [1100, 475, 90, 13],
            [1375, 475, 125, 18],
        ];

        mountainRanges.forEach(([x, y, w, h]) => {
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(x + Math.random() * w, y + Math.random() * h, Math.random() * 5 + 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Ocean trenches (darker)
        ctx.fillStyle = '#606060';
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 2048, Math.random() * 1024, Math.random() * 8 + 2, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas;
    }

    createSpecularMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Black base (no specular on land)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 2048, 1024);

        // White for oceans (specular reflection)
        ctx.fillStyle = '#ffffff';

        // Draw simplified ocean areas
        const oceanAreas = [
            [0, 0, 2048, 1024], // Base ocean
        ];

        // Then subtract land (draw black over continents)
        ctx.fillStyle = '#000000';
        // Simplified land masses for specular
        ctx.fillRect(350, 425, 175, 200); // North America
        ctx.fillRect(500, 725, 110, 240); // South America
        ctx.fillRect(1100, 450, 110, 150); // Europe
        ctx.fillRect(1150, 650, 140, 150); // Africa
        ctx.fillRect(1400, 500, 240, 190); // Asia
        ctx.fillRect(1675, 800, 100, 80); // Australia

        const specularTexture = new THREE.CanvasTexture(canvas);
        return specularTexture;
    }

    createCloudsProfessional() {
        const geometry = new THREE.SphereGeometry(3.05, 128, 128);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 2048, 1024);

        // Draw realistic cloud patterns
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const width = Math.random() * 150 + 80;
            const height = Math.random() * 50 + 30;
            const opacity = Math.random() * 0.5 + 0.3;

            // Cloud shadow
            ctx.fillStyle = `rgba(200, 200, 200, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(x + 5, y + 5, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();

            // Cloud highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();

            // Add smaller cloud details
            for (let j = 0; j < 3; j++) {
                const offsetX = (Math.random() - 0.5) * width;
                const offsetY = (Math.random() - 0.5) * height;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
                ctx.beginPath();
                ctx.ellipse(
                    x + offsetX,
                    y + offsetY,
                    width * 0.4,
                    height * 0.4,
                    Math.random() * Math.PI,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.clouds = new THREE.Mesh(geometry, material);
        this.scene.add(this.clouds);
    }

    createAtmosphereProfessional() {
        const geometry = new THREE.SphereGeometry(3.3, 64, 64);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            uniforms: {
                glowColor: { value: new THREE.Color(0x4a9eff) },
                intensity: { value: 1.2 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float power = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                    float glow = power * intensity;
                    gl_FragColor = vec4(glowColor, 1.0) * glow;
                }
            `
        });

        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }

    createMoon() {
        const geometry = new THREE.SphereGeometry(0.6, 32, 32);

        // Create moon texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Moon gray base
        ctx.fillStyle = '#9a9a9a';
        ctx.fillRect(0, 0, 512, 512);

        // Craters
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 30 + 10;

            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#707070';
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 0.02
        });

        this.moon = new THREE.Mesh(geometry, material);
        this.moon.position.set(8, 2, -5);
        this.scene.add(this.moon);
    }

    addEventListeners() {
        // Mouse move for smooth parallax
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Scroll for depth effect
        window.addEventListener('scroll', () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (this.earth) {
                // Smooth zoom as you scroll
                this.camera.position.z = 12 - scrollPercent * 3;

                // Slight rotation as you scroll
                this.targetRotationY = scrollPercent * Math.PI * 0.5;
            }
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.earth) return;

        // Earth rotation - slow and steady
        this.earth.rotation.y += 0.0005;

        // Clouds rotate slightly faster
        if (this.clouds) {
            this.clouds.rotation.y += 0.0008;
        }

        // Very slow star rotation for depth
        if (this.stars) {
            this.stars.rotation.y += 0.00005;
            this.stars.rotation.x += 0.00003;
        }

        // Moon orbit
        if (this.moon) {
            const time = Date.now() * 0.0001;
            this.moon.position.x = Math.cos(time) * 8;
            this.moon.position.z = Math.sin(time) * 8 - 5;
            this.moon.rotation.y += 0.001;
        }

        // Smooth parallax effect
        this.targetRotationX = this.mouseY * 0.15;
        this.targetRotationY += this.mouseX * 0.0005;

        // Smooth interpolation
        this.earth.rotation.x += (this.targetRotationX - this.earth.rotation.x) * 0.05;

        // Render
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
        console.log('🗑️ Earth Background destroyed');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.earthBackground = new EarthBackground();
        window.earthBackground.init();
    });
} else {
    window.earthBackground = new EarthBackground();
    window.earthBackground.init();
}

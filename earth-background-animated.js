// ========================================
// ANIMATED EARTH BACKGROUND - Day/Night Cycle
// For secondary pages (baiviet, aboutus, nguon, etc.)
// ========================================

class EarthBackgroundAnimated {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.clouds = null;
        this.atmosphere = null;
        this.stars = null;
        this.sun = null;
        this.sunLight = null;
        this.animationId = null;
        this.controls = null;

        this.isInitialized = false;
        this.rotationSpeed = 0.0008;
    }

    init() {
        if (this.isInitialized) return;

        this.createContainer();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        this.createStarfield();
        this.createSun();
        this.createEarthWithDayNight();
        this.createClouds();
        this.createAtmosphere();
        this.setupControls();

        this.addEventListeners();
        this.animate();

        this.isInitialized = true;
        console.log('🌍🌙 Animated Earth Background with Day/Night initialized');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'earth-background-animated';
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
        this.scene.fog = new THREE.Fog(0x000000, 50, 200);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 15);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light - very dim
        const ambientLight = new THREE.AmbientLight(0x111122, 0.1);
        this.scene.add(ambientLight);

        // Sun directional light
        this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
        this.sunLight.position.set(10, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0x4488ff, 0.5);
        rimLight.position.set(-10, 3, 5);
        this.scene.add(rimLight);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsColors = [];

        for (let i = 0; i < 5000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 100 + Math.random() * 50;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            starsVertices.push(x, y, z);

            const brightness = 0.85 + Math.random() * 0.15;
            starsColors.push(brightness, brightness, 1);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(40, 0, 0);

        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);

        this.scene.add(this.sun);
    }

    createEarthWithDayNight() {
        const geometry = new THREE.SphereGeometry(4, 128, 128);

        // Create realistic Earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Ocean
        const oceanGradient = ctx.createRadialGradient(2048, 1024, 100, 2048, 1024, 2048);
        oceanGradient.addColorStop(0, '#1a6ba8');
        oceanGradient.addColorStop(0.5, '#0f4268');
        oceanGradient.addColorStop(1, '#082a42');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, 4096, 2048);

        // Continents
        this.drawRealisticContinents(ctx);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        // Create night lights texture
        const nightCanvas = this.createNightLightsTexture();
        const nightTexture = new THREE.CanvasTexture(nightCanvas);
        nightTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        // Shader material for day/night transition
        const material = new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: texture },
                nightTexture: { value: nightTexture },
                sunDirection: { value: new THREE.Vector3(1, 0, 0) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform vec3 sunDirection;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // Calculate lighting
                    vec3 normal = normalize(vNormal);
                    float intensity = dot(normal, normalize(sunDirection));

                    // Smooth transition between day and night
                    float dayMix = smoothstep(-0.1, 0.3, intensity);

                    // Get colors from textures
                    vec4 dayColor = texture2D(dayTexture, vUv);
                    vec4 nightColor = texture2D(nightTexture, vUv);

                    // Mix day and night
                    vec4 color = mix(nightColor, dayColor, dayMix);

                    // Add slight ambient to night side
                    color.rgb += vec3(0.02, 0.02, 0.03) * (1.0 - dayMix);

                    gl_FragColor = color;
                }
            `
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.z = THREE.MathUtils.degToRad(23.5);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);
    }

    drawRealisticContinents(ctx) {
        // Africa
        ctx.fillStyle = '#3a6828';
        ctx.beginPath();
        ctx.ellipse(2300, 1300, 280, 420, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Sahara
        ctx.fillStyle = '#d2b48c';
        ctx.beginPath();
        ctx.ellipse(2250, 1100, 240, 150, 0, 0, Math.PI * 2);
        ctx.fill();

        // Europe
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2200, 900, 220, 150, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Asia
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(2800, 1000, 480, 380, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(2900, 900, 300, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // North America
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(700, 850, 350, 400, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6b22';
        ctx.beginPath();
        ctx.ellipse(650, 700, 250, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(1000, 1450, 220, 480, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Amazon
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

        // Antarctica
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 1850, 4096, 198);

        // Greenland
        ctx.fillStyle = '#d0e8f0';
        ctx.beginPath();
        ctx.ellipse(1300, 600, 150, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ice caps
        const arcticGradient = ctx.createLinearGradient(2048, 0, 2048, 200);
        arcticGradient.addColorStop(0, '#ffffff');
        arcticGradient.addColorStop(0.7, '#e8f4f8');
        arcticGradient.addColorStop(1, 'rgba(232, 244, 248, 0)');
        ctx.fillStyle = arcticGradient;
        ctx.fillRect(0, 0, 4096, 200);
    }

    createNightLightsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 2048, 1024);

        // Add city lights
        this.addCityLights(ctx, 1150, 450, 110, 75, 200); // Europe
        this.addCityLights(ctx, 1400, 500, 200, 150, 350); // Asia
        this.addCityLights(ctx, 1650, 525, 75, 100, 100); // Japan
        this.addCityLights(ctx, 350, 425, 175, 200, 300); // North America
        this.addCityLights(ctx, 500, 725, 110, 240, 150); // South America
        this.addCityLights(ctx, 1150, 650, 70, 100, 80); // Africa
        this.addCityLights(ctx, 1675, 800, 100, 80, 60); // Australia

        return canvas;
    }

    addCityLights(ctx, x, y, width, height, count) {
        for (let i = 0; i < count; i++) {
            const px = x + (Math.random() - 0.5) * width;
            const py = y + (Math.random() - 0.5) * height;
            const size = Math.random() * 2 + 0.5;
            const brightness = Math.random() * 0.8 + 0.2;

            const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 2);
            gradient.addColorStop(0, `rgba(255, 220, 150, ${brightness})`);
            gradient.addColorStop(0.5, `rgba(255, 180, 80, ${brightness * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    createClouds() {
        const geometry = new THREE.SphereGeometry(4.05, 128, 128);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 2048, 1024);

        for (let i = 0; i < 120; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const width = Math.random() * 120 + 60;
            const height = Math.random() * 40 + 25;
            const opacity = Math.random() * 0.5 + 0.3;

            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();

            for (let j = 0; j < 3; j++) {
                const offsetX = (Math.random() - 0.5) * width;
                const offsetY = (Math.random() - 0.5) * height;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
                ctx.beginPath();
                ctx.ellipse(x + offsetX, y + offsetY, width * 0.4, height * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });

        this.clouds = new THREE.Mesh(geometry, material);
        this.scene.add(this.clouds);
    }

    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(4.4, 64, 64);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            uniforms: {
                glowColor: { value: new THREE.Color(0x5599ff) },
                intensity: { value: 1.2 }
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
                    float power = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                    float glow = power * intensity;
                    gl_FragColor = vec4(glowColor, 1.0) * glow;
                }
            `
        });

        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }

    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.minDistance = 8;
            this.controls.maxDistance = 30;
            this.controls.autoRotate = false;
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('scroll', () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (this.earth) {
                this.camera.position.z = 15 - scrollPercent * 3;
            }
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.earth) return;

        // Rotate Earth
        this.earth.rotation.y += this.rotationSpeed;

        // Rotate clouds slightly faster
        if (this.clouds) {
            this.clouds.rotation.y += this.rotationSpeed * 1.3;
        }

        // Rotate stars very slowly
        if (this.stars) {
            this.stars.rotation.y += 0.00005;
        }

        // Update sun direction in shader
        const sunDir = new THREE.Vector3(1, 0, 0);
        sunDir.applyQuaternion(this.earth.quaternion);
        this.earth.material.uniforms.sunDirection.value = sunDir.normalize();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.controls) {
            this.controls.dispose();
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
        console.log('🗑️ Animated Earth Background destroyed');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.earthBackground = new EarthBackgroundAnimated();
        window.earthBackground.init();
    });
} else {
    window.earthBackground = new EarthBackgroundAnimated();
    window.earthBackground.init();
}

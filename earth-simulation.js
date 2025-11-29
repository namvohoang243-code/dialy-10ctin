// ========================================
// EARTH SIMULATION - 3D Geography Simulations
// Day/Night, Seasons, Rotation, Time Zones
// ========================================

class EarthSimulation {
    constructor(avatar3DEngine) {
        this.avatarEngine = avatar3DEngine;
        this.scene = avatar3DEngine.scene;
        this.isActive = false;
        this.currentSimulation = null;

        // Simulation objects
        this.earth = null;
        this.sun = null;
        this.orbit = null;
        this.axis = null;

        // Animation
        this.animationSpeed = 1.0;
        this.paused = false;
    }

    // ========================================
    // SIMULATION MANAGEMENT
    // ========================================

    /**
     * Show simulation for a specific topic
     * @param {string} type - 'rotation', 'daynight', 'seasons', 'timezones'
     */
    showSimulation(type) {
        this.hideSimulation();

        switch (type) {
            case 'rotation':
                this.createRotationSimulation();
                break;
            case 'daynight':
                this.createDayNightSimulation();
                break;
            case 'seasons':
                this.createSeasonsSimulation();
                break;
            case 'timezones':
                this.createTimeZonesSimulation();
                break;
            default:
                console.warn('Unknown simulation type:', type);
        }

        this.isActive = true;
        this.currentSimulation = type;
    }

    /**
     * Hide current simulation
     */
    hideSimulation() {
        if (!this.isActive) return;

        // Remove simulation objects
        if (this.earth) {
            this.scene.remove(this.earth);
            this.disposeObject(this.earth);
            this.earth = null;
        }

        if (this.sun) {
            this.scene.remove(this.sun);
            this.disposeObject(this.sun);
            this.sun = null;
        }

        if (this.orbit) {
            this.scene.remove(this.orbit);
            this.orbit = null;
        }

        if (this.axis) {
            this.scene.remove(this.axis);
            this.axis = null;
        }

        this.isActive = false;
        this.currentSimulation = null;
    }

    // ========================================
    // ROTATION SIMULATION
    // ========================================

    createRotationSimulation() {
        // Create Earth
        this.earth = this.createEarth();
        this.earth.position.set(0, 1.5, -3);
        this.scene.add(this.earth);

        // Create rotation axis
        this.createRotationAxis();

        // Create direction labels
        this.createDirectionLabels();

        // Start rotation animation
        this.animateRotation();
    }

    animateRotation() {
        if (!this.earth || this.paused || this.currentSimulation !== 'rotation') return;

        // Rotate Earth around Y axis (with 23.5° tilt)
        this.earth.rotation.y += 0.01 * this.animationSpeed;

        requestAnimationFrame(() => this.animateRotation());
    }

    // ========================================
    // DAY/NIGHT SIMULATION
    // ========================================

    createDayNightSimulation() {
        // Create Earth
        this.earth = this.createEarth();
        this.earth.position.set(0, 1.5, -3);
        this.scene.add(this.earth);

        // Create Sun
        this.createSun();

        // Create day/night shading
        this.setupDayNightShading();

        // Create labels
        this.createDayNightLabels();

        // Animate
        this.animateDayNight();
    }

    setupDayNightShading() {
        if (!this.earth || !this.sun) return;

        // Directional light from sun
        const sunLight = new THREE.DirectionalLight(0xFFFF99, 2);
        sunLight.position.copy(this.sun.position);
        sunLight.target = this.earth;
        this.scene.add(sunLight);
        this.earth.userData.sunLight = sunLight;
    }

    animateDayNight() {
        if (!this.earth || this.paused || this.currentSimulation !== 'daynight') return;

        // Rotate Earth to show day/night cycle
        this.earth.rotation.y += 0.005 * this.animationSpeed;

        // Update light position to stay with sun
        if (this.earth.userData.sunLight && this.sun) {
            this.earth.userData.sunLight.position.copy(this.sun.position);
        }

        requestAnimationFrame(() => this.animateDayNight());
    }

    createDayNightLabels() {
        // "Ban Ngày" and "Ban Đêm" text sprites
        const dayLabel = this.createTextSprite('Ban Ngày', '#FFD700');
        dayLabel.position.set(2, 1.5, -3);
        this.scene.add(dayLabel);
        this.earth.userData.dayLabel = dayLabel;

        const nightLabel = this.createTextSprite('Ban Đêm', '#4169E1');
        nightLabel.position.set(-2, 1.5, -3);
        this.scene.add(nightLabel);
        this.earth.userData.nightLabel = nightLabel;
    }

    // ========================================
    // SEASONS SIMULATION
    // ========================================

    createSeasonsSimulation() {
        // Create Sun at center
        this.sun = this.createSun();
        this.sun.position.set(0, 1.5, -5);
        this.scene.add(this.sun);

        // Create Earth orbit path
        this.createOrbitPath();

        // Create Earth at different positions
        this.createSeasonsEarths();

        // Labels for seasons
        this.createSeasonLabels();

        // Animate orbit
        this.animateSeasons();
    }

    createOrbitPath() {
        const curve = new THREE.EllipseCurve(
            0, 0,           // center x, y
            4, 3.5,         // xRadius, yRadius
            0, 2 * Math.PI, // start, end angle
            false,          // clockwise
            0               // rotation
        );

        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p.x, 1.5, p.y - 5))
        );

        const material = new THREE.LineBasicMaterial({
            color: 0x4169E1,
            transparent: true,
            opacity: 0.4
        });

        this.orbit = new THREE.Line(geometry, material);
        this.scene.add(this.orbit);
    }

    createSeasonsEarths() {
        // Create 4 Earths at different positions (simplified view)
        const positions = [
            { x: 4, z: -5, season: 'Xuân' },    // Spring
            { x: 0, z: -1.5, season: 'Hè' },    // Summer
            { x: -4, z: -5, season: 'Thu' },    // Fall
            { x: 0, z: -8.5, season: 'Đông' }   // Winter
        ];

        this.earth = new THREE.Group();

        positions.forEach((pos, index) => {
            const earthMesh = this.createEarth(0.4);
            earthMesh.position.set(pos.x, 1.5, pos.z);

            // Tilt based on season
            earthMesh.rotation.z = index * Math.PI / 2;

            this.earth.add(earthMesh);

            // Label
            const label = this.createTextSprite(pos.season, '#FFD700');
            label.position.set(pos.x, 2.5, pos.z);
            this.scene.add(label);
        });

        this.scene.add(this.earth);
    }

    createSeasonLabels() {
        // Add hemisphere labels showing which season is which
        // This can be expanded based on requirements
    }

    animateSeasons() {
        if (!this.earth || this.paused || this.currentSimulation !== 'seasons') return;

        // Rotate each Earth to show rotation
        this.earth.children.forEach(earthMesh => {
            earthMesh.rotation.y += 0.005 * this.animationSpeed;
        });

        requestAnimationFrame(() => this.animateSeasons());
    }

    // ========================================
    // TIME ZONES SIMULATION
    // ========================================

    createTimeZonesSimulation() {
        // Create Earth with time zone lines
        this.earth = this.createEarthWithTimeZones();
        this.earth.position.set(0, 1.5, -3);
        this.scene.add(this.earth);

        // Create Sun
        this.createSun();

        // Create time labels
        this.createTimeLabels();

        // Animate
        this.animateTimeZones();
    }

    createEarthWithTimeZones() {
        const earth = this.createEarth();

        // Add longitude lines for time zones
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const curve = new THREE.EllipseCurve(
                0, 0,
                1, 1,
                0, Math.PI * 2,
                false,
                0
            );

            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(
                points.map(p => new THREE.Vector3(
                    Math.cos(angle) * p.x,
                    p.y,
                    Math.sin(angle) * p.x
                ))
            );

            const material = new THREE.LineBasicMaterial({
                color: i % 2 === 0 ? 0xFFD700 : 0x4169E1,
                transparent: true,
                opacity: 0.5
            });

            const line = new THREE.Line(geometry, material);
            earth.add(line);
        }

        return earth;
    }

    createTimeLabels() {
        // Add labels for different time zones
        const times = ['0:00', '6:00', '12:00', '18:00'];
        const positions = [
            { x: 0, z: 1.5 },
            { x: 1.5, z: 0 },
            { x: 0, z: -1.5 },
            { x: -1.5, z: 0 }
        ];

        times.forEach((time, index) => {
            const label = this.createTextSprite(time, '#FFD700');
            label.position.set(
                positions[index].x,
                1.5,
                positions[index].z - 3
            );
            this.scene.add(label);
            if (!this.earth.userData.timeLabels) {
                this.earth.userData.timeLabels = [];
            }
            this.earth.userData.timeLabels.push(label);
        });
    }

    animateTimeZones() {
        if (!this.earth || this.paused || this.currentSimulation !== 'timezones') return;

        // Rotate Earth to show different time zones
        this.earth.rotation.y += 0.003 * this.animationSpeed;

        requestAnimationFrame(() => this.animateTimeZones());
    }

    // ========================================
    // HELPER METHODS - CREATE OBJECTS
    // ========================================

    createEarth(size = 1.0) {
        const geometry = new THREE.SphereGeometry(size, 64, 64);

        // Create a more detailed Earth texture with simple colors
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Ocean
        ctx.fillStyle = '#1E90FF';
        ctx.fillRect(0, 0, 512, 512);

        // Continents (simplified)
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(100, 150, 150, 100);
        ctx.fillRect(300, 200, 100, 80);
        ctx.fillRect(150, 300, 120, 90);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.2
        });

        const earth = new THREE.Mesh(geometry, material);
        earth.castShadow = true;
        earth.receiveShadow = true;

        // Add 23.5° tilt
        earth.rotation.z = THREE.MathUtils.degToRad(23.5);

        return earth;
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 1
        });

        const sun = new THREE.Mesh(geometry, material);
        sun.position.set(5, 1.5, -3);

        // Add sun glow
        const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sun.add(glow);

        // Point light
        const sunLight = new THREE.PointLight(0xFFFF99, 2, 20);
        sun.add(sunLight);

        return sun;
    }

    createRotationAxis() {
        const material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 3, 0)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.axis = new THREE.Line(geometry, material);
        this.axis.position.copy(this.earth.position);
        this.scene.add(this.axis);

        // Add arrow
        const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.y = 3;
        this.axis.add(arrow);
    }

    createDirectionLabels() {
        const labels = [
            { text: 'Đông', pos: { x: 1.5, z: -3 } },
            { text: 'Tây', pos: { x: -1.5, z: -3 } },
            { text: 'Nam', pos: { x: 0, z: -1.5 } },
            { text: 'Bắc', pos: { x: 0, z: -4.5 } }
        ];

        labels.forEach(label => {
            const sprite = this.createTextSprite(label.text, '#FFD700');
            sprite.position.set(label.pos.x, 1.5, label.pos.z);
            this.scene.add(sprite);
            if (!this.earth.userData.directionLabels) {
                this.earth.userData.directionLabels = [];
            }
            this.earth.userData.directionLabels.push(sprite);
        });
    }

    createTextSprite(text, color = '#FFFFFF') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        context.fillStyle = color;
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1, 0.5, 1);

        return sprite;
    }

    // ========================================
    // CONTROLS
    // ========================================

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;

        // Restart animation based on current simulation
        if (this.currentSimulation) {
            switch (this.currentSimulation) {
                case 'rotation':
                    this.animateRotation();
                    break;
                case 'daynight':
                    this.animateDayNight();
                    break;
                case 'seasons':
                    this.animateSeasons();
                    break;
                case 'timezones':
                    this.animateTimeZones();
                    break;
            }
        }
    }

    setSpeed(speed) {
        this.animationSpeed = speed;
    }

    // ========================================
    // CLEANUP
    // ========================================

    disposeObject(obj) {
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        }

        obj.children.forEach(child => this.disposeObject(child));
    }
}

// Export
window.EarthSimulation = EarthSimulation;

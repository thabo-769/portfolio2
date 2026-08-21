import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

interface CubeItem {
  mesh: THREE.Group;
  initialPos: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  floatSpeed: number;
  floatOffset: number;
  floatAmp: number;
  parallaxFactor: number;
}

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // 1. Three.js Scene Setup (Deep Pure Black Background)
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera: Perspective Framing
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 16);
    camera.lookAt(0, 0.5, 0);

    // 3. Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Procedural Studio HDRI Environment Map (Obsidian & Platinum Rim Cards)
    const generateStudioEnvMap = (): THREE.Texture => {
      const envCanvas = document.createElement('canvas');
      envCanvas.width = 1024;
      envCanvas.height = 512;
      const ctx = envCanvas.getContext('2d');
      if (ctx) {
        // Pure Black Base Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
        bgGrad.addColorStop(0, '#000000');
        bgGrad.addColorStop(0.5, '#080808');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 512);

        // Key Platinum Light Card
        const keySoftbox = ctx.createRadialGradient(250, 180, 0, 250, 180, 180);
        keySoftbox.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        keySoftbox.addColorStop(0.3, 'rgba(200, 200, 200, 0.8)');
        keySoftbox.addColorStop(0.7, 'rgba(60, 60, 60, 0.2)');
        keySoftbox.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = keySoftbox;
        ctx.fillRect(50, 20, 400, 320);

        // Rim Strip Softbox
        const rimSoftbox = ctx.createLinearGradient(700, 0, 850, 0);
        rimSoftbox.addColorStop(0, 'rgba(0, 0, 0, 0)');
        rimSoftbox.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        rimSoftbox.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rimSoftbox;
        ctx.fillRect(680, 50, 180, 360);
      }

      const texture = new THREE.CanvasTexture(envCanvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    };

    scene.environment = generateStudioEnvMap();

    // 5. Materials: Obsidian Black Gloss & Metallic Platinum Wireframe Accents
    const obsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a0a0a),
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
      ior: 1.6,
      envMapIntensity: 2.0,
    });

    const glassCubeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x18181b),
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.4,
      transparent: true,
      opacity: 0.85,
      ior: 1.5,
      envMapIntensity: 2.2,
    });

    const platinumEdgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.6,
      linewidth: 1,
    });

    const accentEdgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xa1a1aa),
      transparent: true,
      opacity: 0.4,
      linewidth: 1,
    });

    // 6. Floating Small Cubes Builder
    const cubesGroup = new THREE.Group();
    scene.add(cubesGroup);

    const cubesList: CubeItem[] = [];

    // Factory to create a sleek beveled floating cube with wireframe edges
    const createSleekCube = (size: number, isGlass = false): THREE.Group => {
      const group = new THREE.Group();

      // Main Solid Cube Mesh
      const geom = new THREE.BoxGeometry(size, size, size);
      const mesh = new THREE.Mesh(geom, isGlass ? glassCubeMaterial : obsidianMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Edge Wireframe Highlights
      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, size > 1.0 ? platinumEdgeMaterial : accentEdgeMaterial);
      group.add(line);

      // Inner Core Glow for larger cubes
      if (size > 1.2) {
        const coreGeom = new THREE.BoxGeometry(size * 0.4, size * 0.4, size * 0.4);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.3,
          roughness: 0.2,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        group.add(coreMesh);
      }

      return group;
    };

    // Coordinate configurations for floating small cubes ensemble
    const cubeConfigs = [
      // Central Hero Cube (Right side)
      { size: 2.0, pos: new THREE.Vector3(2.4, 0.6, 0), rot: [0.006, 0.008, 0.004], speed: 1.1, amp: 0.35, glass: false, factor: 0.8 },
      
      // Satellite Mid-sized Cubes
      { size: 1.1, pos: new THREE.Vector3(4.8, 2.8, -2.5), rot: [-0.008, 0.012, 0.006], speed: 0.9, amp: 0.4, glass: true, factor: 1.4 },
      { size: 0.9, pos: new THREE.Vector3(0.5, 3.4, -2.0), rot: [0.01, -0.007, 0.009], speed: 1.3, amp: 0.3, glass: false, factor: 1.1 },
      { size: 1.3, pos: new THREE.Vector3(5.2, -1.6, -1.5), rot: [0.007, -0.01, -0.005], speed: 1.0, amp: 0.35, glass: true, factor: 1.3 },
      { size: 0.8, pos: new THREE.Vector3(0.8, -2.2, -3.0), rot: [-0.012, 0.009, 0.008], speed: 1.4, amp: 0.25, glass: false, factor: 0.9 },
      
      // Background Depth Small Floating Cubes
      { size: 0.5, pos: new THREE.Vector3(-4.5, 2.5, -6.0), rot: [0.015, 0.01, 0.005], speed: 0.8, amp: 0.45, glass: false, factor: 1.8 },
      { size: 0.6, pos: new THREE.Vector3(-2.8, -2.0, -5.0), rot: [-0.009, -0.014, 0.011], speed: 1.2, amp: 0.3, glass: true, factor: 1.6 },
      { size: 0.45, pos: new THREE.Vector3(6.5, 4.2, -7.0), rot: [0.011, 0.016, -0.008], speed: 0.95, amp: 0.4, glass: false, factor: 2.1 },
      { size: 0.55, pos: new THREE.Vector3(3.8, -3.8, -6.5), rot: [-0.014, 0.008, 0.012], speed: 1.15, amp: 0.35, glass: false, factor: 1.9 },
      { size: 0.4, pos: new THREE.Vector3(-1.2, 4.8, -8.0), rot: [0.018, -0.011, 0.007], speed: 0.85, amp: 0.5, glass: true, factor: 2.4 },
      { size: 0.35, pos: new THREE.Vector3(7.2, -0.5, -8.5), rot: [0.01, 0.015, -0.013], speed: 1.3, amp: 0.35, glass: false, factor: 2.2 },
      { size: 0.4, pos: new THREE.Vector3(-5.8, -0.8, -9.0), rot: [-0.012, 0.011, 0.009], speed: 1.05, amp: 0.4, glass: false, factor: 2.5 },
    ];

    cubeConfigs.forEach((cfg, idx) => {
      const cubeGroup = createSleekCube(cfg.size, cfg.glass);
      cubeGroup.position.copy(cfg.pos);
      cubeGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cubesGroup.add(cubeGroup);

      cubesList.push({
        mesh: cubeGroup,
        initialPos: cfg.pos.clone(),
        rotSpeed: new THREE.Vector3(cfg.rot[0], cfg.rot[1], cfg.rot[2]),
        floatSpeed: cfg.speed,
        floatOffset: idx * 0.85,
        floatAmp: cfg.amp,
        parallaxFactor: cfg.factor,
      });
    });

    // 7. Dynamic Lighting Setup for Obsidian Black & Chrome
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-6, 10, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 4.5);
    rimLight.position.set(8, 6, -6);
    scene.add(rimLight);

    const fillPointLight = new THREE.PointLight(0xa1a1aa, 2.5, 30);
    fillPointLight.position.set(4, 2, 6);
    scene.add(fillPointLight);

    const ambientLight = new THREE.AmbientLight(0x18181b, 1.2);
    scene.add(ambientLight);

    // 8. Responsive Framing
    const updateResponsiveFraming = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (w < 640) {
        cubesGroup.scale.set(0.6, 0.6, 0.6);
        cubesGroup.position.set(0, 0.2, 0);
        camera.position.set(0, 1.4, 17);
      } else if (w < 1024) {
        cubesGroup.scale.set(0.8, 0.8, 0.8);
        cubesGroup.position.set(0.8, 0.2, 0);
        camera.position.set(0, 1.3, 16);
      } else {
        cubesGroup.scale.set(1.0, 1.0, 1.0);
        cubesGroup.position.set(0.5, 0, 0);
        camera.position.set(0, 1.2, 15.5);
      }
    };

    const resizeObserver = new ResizeObserver(updateResponsiveFraming);
    resizeObserver.observe(container);
    updateResponsiveFraming();

    // 9. Mouse Movement Interaction (Smooth Parallax)
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetMouseX = (e.clientX / innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 10. Animation Loop: Smooth Multi-Axis Floating & Parallax Rotation
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      // Camera Perspective Shift
      camera.position.x = currentMouseX * 1.4;
      camera.position.y = 1.2 + currentMouseY * 0.9;
      camera.lookAt(currentMouseX * 0.3, 0.5 + currentMouseY * 0.2, 0);

      // Key light tracking
      keyLight.position.x = -6 + currentMouseX * 3;
      keyLight.position.y = 10 + currentMouseY * 2;

      // Animate individual floating cubes
      cubesList.forEach((item) => {
        // Continuous organic rotation
        item.mesh.rotation.x += item.rotSpeed.x;
        item.mesh.rotation.y += item.rotSpeed.y;
        item.mesh.rotation.z += item.rotSpeed.z;

        // Smooth vertical levitation
        const floatY = Math.sin(elapsedTime * item.floatSpeed + item.floatOffset) * item.floatAmp;
        
        // Multi-depth cursor parallax displacement
        item.mesh.position.y = item.initialPos.y + floatY + currentMouseY * item.parallaxFactor * 0.7;
        item.mesh.position.x = item.initialPos.x + currentMouseX * item.parallaxFactor * 0.8;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [theme]);

  if (!webglSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="text-center font-mono text-8xl font-bold uppercase tracking-widest text-[#71717A]">
          [3D]
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};

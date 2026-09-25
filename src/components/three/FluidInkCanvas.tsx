'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Ripple {
  meshGroup: THREE.Group;
  rings: THREE.Mesh[];
  startTime: number;
  duration: number;
  maxRadius: number;
  active: boolean;
}

export const FluidInkCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.025);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Tilted view looking down onto the tranquil night lotus pond
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 0, -2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Water Plane (Mặt Nước Hồ Sen Tĩnh Lặng)
    const waterY = 0;
    const waterPlaneGeo = new THREE.PlaneGeometry(80, 80);
    const waterPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x050c18,
      transparent: true,
      opacity: 0.85
    });
    const waterPlane = new THREE.Mesh(waterPlaneGeo, waterPlaneMat);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.y = waterY - 0.05;
    scene.add(waterPlane);

    // Raycaster plane for click detection
    const raycastPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -waterY);
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();

    // 3. Floating Lotus Leaves (Lá Sen Ngọc Bích Cổ)
    const leafGroup = new THREE.Group();
    const leafCount = 9;
    const leaves: { mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number; phase: number }[] = [];

    const createLotusLeafGeo = (radius: number) => {
      // Shape with a classic notched V-cut like real lotus leaves
      const shape = new THREE.Shape();
      const segments = 40;
      const notchAngle = 0.28; // small notch angle
      shape.moveTo(0, 0);

      for (let i = 0; i <= segments; i++) {
        const theta = notchAngle + (i / segments) * (Math.PI * 2 - notchAngle * 2);
        // Subtle waviness at leaf rim
        const r = radius * (1 + Math.sin(theta * 7) * 0.04);
        shape.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
      }
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    };

    // Traditional Vietnamese Palette: Jade / Celadon Ink / Deep Moss
    const leafColors = [0x0d4f3e, 0x0f4035, 0x134e4a, 0x064e3b];

    for (let i = 0; i < leafCount; i++) {
      const radius = 1.6 + Math.random() * 1.8;
      const leafGeo = createLotusLeafGeo(radius);
      const leafMat = new THREE.MeshBasicMaterial({
        color: leafColors[i % leafColors.length],
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });

      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.rotation.x = -Math.PI / 2;
      leafMesh.rotation.z = Math.random() * Math.PI * 2;

      // Distribute naturally around the pond periphery
      const angle = (i / leafCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist = 6 + Math.random() * 9;
      leafMesh.position.set(Math.cos(angle) * dist, waterY + 0.02, Math.sin(angle) * dist * 0.7 - 2);

      leafGroup.add(leafMesh);
      leaves.push({
        mesh: leafMesh,
        initialY: leafMesh.position.y,
        speed: 0.8 + Math.random() * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }
    scene.add(leafGroup);

    // 4. Floating Lotus Petals (Cánh Sen Hồng Phai Trôi Lững Lờ)
    const petalCount = 18;
    const petalGroup = new THREE.Group();
    const petals: { mesh: THREE.Mesh; origin: THREE.Vector3; floatSpeed: number; driftSpeed: number; phase: number }[] = [];

    const createPetalShape = () => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.25, 0.4, 0, 0.9);
      shape.quadraticCurveTo(-0.25, 0.4, 0, 0);
      return new THREE.ShapeGeometry(shape);
    };

    const petalGeo = createPetalShape();
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6, // Soft antique lotus pink
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < petalCount; i++) {
      const petalMesh = new THREE.Mesh(petalGeo, petalMat);
      petalMesh.rotation.x = -Math.PI / 2;
      petalMesh.rotation.z = Math.random() * Math.PI * 2;
      const scale = 0.5 + Math.random() * 0.5;
      petalMesh.scale.set(scale, scale, scale);

      const posX = (Math.random() - 0.5) * 26;
      const posZ = (Math.random() - 0.5) * 18 - 2;
      petalMesh.position.set(posX, waterY + 0.04, posZ);

      petalGroup.add(petalMesh);
      petals.push({
        mesh: petalMesh,
        origin: petalMesh.position.clone(),
        floatSpeed: 0.6 + Math.random() * 0.7,
        driftSpeed: 0.15 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }
    scene.add(petalGroup);

    // 5. Fireflies & Ancient Ink Mist (Đom Đóm Đêm & Bụi Mực Vàng)
    const fireflyCount = 45;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyColors = new Float32Array(fireflyCount * 3);

    const warmGold = new THREE.Color(0xfde047);
    const paleGold = new THREE.Color(0xfef08a);

    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 30;
      fireflyPositions[i * 3 + 1] = 0.8 + Math.random() * 5.5; // Hovering above water
      fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 22;

      const c = Math.random() > 0.5 ? warmGold : paleGold;
      fireflyColors[i * 3] = c.r;
      fireflyColors[i * 3 + 1] = c.g;
      fireflyColors[i * 3 + 2] = c.b;
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyColors, 3));

    const fireflyMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);

    // 6. Water Ripples Pool (Gợn Sóng Nước Đồng Tâm)
    const maxRipples = 16;
    const ripplePool: Ripple[] = [];

    for (let i = 0; i < maxRipples; i++) {
      const meshGroup = new THREE.Group();
      meshGroup.position.set(0, waterY + 0.01, 0);
      meshGroup.rotation.x = -Math.PI / 2;
      meshGroup.visible = false;

      const rings: THREE.Mesh[] = [];
      const ringOffsets = [0, 0.35, 0.7]; // 3 concentric rings

      ringOffsets.forEach(() => {
        const ringGeo = new THREE.RingGeometry(0.1, 0.25, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        meshGroup.add(ringMesh);
        rings.push(ringMesh);
      });

      scene.add(meshGroup);
      ripplePool.push({
        meshGroup,
        rings,
        startTime: 0,
        duration: 3.2,
        maxRadius: 5.5,
        active: false
      });
    }

    const spawnRipple = (x: number, z: number, intensity = 1.0) => {
      // Find an inactive ripple or reuse oldest
      let ripple = ripplePool.find(r => !r.active);
      if (!ripple) {
        ripple = ripplePool[0];
      }

      ripple.active = true;
      ripple.startTime = performance.now() / 1000;
      ripple.duration = 2.8 + Math.random() * 0.8;
      ripple.maxRadius = (4.0 + Math.random() * 2.0) * intensity;
      ripple.meshGroup.position.set(x, waterY + 0.01, z);
      ripple.meshGroup.visible = true;
    };

    // 7. Interactive Click & Ambient Drops Handler
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      mousePos.x = (clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(raycastPlane, intersectPoint);

      if (intersectPoint) {
        spawnRipple(intersectPoint.x, intersectPoint.z, 1.2);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    // Natural ambient dewdrops falling every 2-4 seconds
    let nextAmbientDrop = performance.now() / 1000 + 1.2;

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Main Render Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now() / 1000;
      const elapsedTime = clock.getElapsedTime();

      // Ambient drop trigger
      if (currentTime > nextAmbientDrop) {
        const randX = (Math.random() - 0.5) * 22;
        const randZ = (Math.random() - 0.5) * 14 - 2;
        spawnRipple(randX, randZ, 0.85);
        nextAmbientDrop = currentTime + 2.2 + Math.random() * 2.5;
      }

      // Animate Ripples
      ripplePool.forEach(ripple => {
        if (!ripple.active) return;
        const progress = (currentTime - ripple.startTime) / ripple.duration;

        if (progress >= 1.0) {
          ripple.active = false;
          ripple.meshGroup.visible = false;
          return;
        }

        // Wave expansion curve with smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 2.5);
        const currentRadius = easeOut * ripple.maxRadius;
        const fade = Math.sin(progress * Math.PI) * (1 - progress * 0.4);

        ripple.rings.forEach((ring, idx) => {
          const delay = idx * 0.18;
          const ringProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          const ringEase = 1 - Math.pow(1 - ringProgress, 2.5);
          const r = ringEase * ripple.maxRadius;

          // Scale ring geometry dynamically
          ring.scale.set(r, r, 1);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, fade * 0.45 * (1 - idx * 0.25));
        });
      });

      // Animate Lotus Leaves (Dập dềnh bồng bềnh nhẹ nhàng)
      leaves.forEach(leaf => {
        leaf.mesh.position.y = leaf.initialY + Math.sin(elapsedTime * leaf.speed + leaf.phase) * 0.08;
        leaf.mesh.rotation.z += leaf.rotSpeed * 0.005;
        // Subtle tilt with wave
        leaf.mesh.rotation.x = -Math.PI / 2 + Math.sin(elapsedTime * leaf.speed * 0.8 + leaf.phase) * 0.02;
      });

      // Animate Petals (Trôi lững lờ theo dòng nước)
      petals.forEach(petal => {
        petal.mesh.position.y = waterY + 0.03 + Math.sin(elapsedTime * petal.floatSpeed + petal.phase) * 0.04;
        petal.mesh.position.x = petal.origin.x + Math.sin(elapsedTime * petal.driftSpeed + petal.phase) * 0.6;
        petal.mesh.position.z = petal.origin.z + Math.cos(elapsedTime * petal.driftSpeed * 0.7 + petal.phase) * 0.4;
        petal.mesh.rotation.z += 0.0015;
      });

      // Animate Fireflies (Đom đóm bay lượn trên hồ sen)
      const fireflyPos = fireflyGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        const idx = i * 3;
        fireflyPos[idx + 1] += Math.sin(elapsedTime * 1.8 + i) * 0.012; // vertical bob
        fireflyPos[idx] += Math.cos(elapsedTime * 0.8 + i * 2) * 0.01;   // horizontal float
      }
      fireflyGeo.attributes.position.needsUpdate = true;

      // Subtle camera breathing
      camera.position.x = Math.sin(elapsedTime * 0.1) * 0.6;
      camera.position.y = 14 + Math.cos(elapsedTime * 0.12) * 0.2;
      camera.lookAt(0, 0, -2);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);

      waterPlaneGeo.dispose();
      waterPlaneMat.dispose();
      leafGroup.clear();
      petalGroup.clear();
      fireflyGeo.dispose();
      fireflyMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-auto z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};


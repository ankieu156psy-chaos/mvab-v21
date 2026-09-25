'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ZenBreathingCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(240, 240);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Delicate Ancient Jade & Amber Relic (Viên Ngọc Thiền)
    const geometry = new THREE.IcosahedronGeometry(1.8, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0d9488, // Celadon Jade Green
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Inner Core Warm Amber Glow
    const coreGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Warm Amber Gold
      transparent: true,
      opacity: 0.25
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // 4-second breathing cycle (Inhale -> Exhale)
      const breath = Math.sin(t * (Math.PI / 4)) * 0.18 + 1.0;
      sphere.scale.set(breath, breath, breath);
      core.scale.set(breath * 0.9, breath * 0.9, breath * 0.9);

      // Slow meditation rotation
      sphere.rotation.y = t * 0.15;
      sphere.rotation.x = t * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="flex items-center justify-center pointer-events-none mb-2"
      aria-hidden="true"
    />
  );
};

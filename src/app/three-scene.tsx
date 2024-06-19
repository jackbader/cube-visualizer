// components/ThreeScene.js
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import audioFile from '@/app/sounds/yuh.wav';

const ThreeScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const soundRef = useRef<THREE.Audio | null>(null);
  const analyserRef = useRef<THREE.AudioAnalyser | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const mount = containerRef.current;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      mount.appendChild(renderer.domElement);

      // Example geometry and material
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      camera.position.z = 5;

      // Resize handler
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      // Audio setup
      const listener = new THREE.AudioListener();
      camera.add(listener);

      const sound = new THREE.Audio(listener);
      soundRef.current = sound;

      const audioLoader = new THREE.AudioLoader();
      audioLoader.load(audioFile, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        setAudioLoaded(true);

        // Create an AudioAnalyser
        const analyser = new THREE.AudioAnalyser(sound, 32);
        analyserRef.current = analyser;

        // Check if the audio buffer is correctly loaded and analyser is working
        console.log('Audio buffer loaded:', buffer);
        console.log('Analyser data:', analyser.getFrequencyData());
      });

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Get the average frequency value
        if (analyserRef.current) {
          const data = analyserRef.current.getAverageFrequency();
          console.log('Analyser data:', data);

          if (data > 100) {
            // Warp the sphere vertices based on audio data
            const scale = 1 + data / 256;
            sphere.scale.set(scale, scale, scale);

            const positionAttribute = sphere.geometry.attributes.position;
            const vertex = new THREE.Vector3();
            for (let i = 0; i < positionAttribute.count; i++) {
              vertex.fromBufferAttribute(positionAttribute, i);
              const offset = (data / 256) * 0.5;
              vertex.normalize().multiplyScalar(1 + offset);
              positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            positionAttribute.needsUpdate = true;
          } else {
            sphere.scale.set(1, 1, 1);
          }

          // Change sphere color based on audio data
          const colorValue = (data / 256) * 0xffffff; // Normalize data to fit in hex color range
          sphere.material.color.setHex(colorValue);
        }

        renderer.render(scene, camera);
      };
      animate();

      // Add event listener
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        mount.removeChild(renderer.domElement);
      };
    }
  }, []);

  const handlePlayAudio = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  };

  return (
    <div ref={containerRef}>
      {audioLoaded && (
        <button
          onClick={handlePlayAudio}
          style={{ position: 'absolute', top: '10px', left: '10px' }}
        >
          Play Audio
        </button>
      )}
    </div>
  );
};

export default ThreeScene;

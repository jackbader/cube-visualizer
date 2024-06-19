// components/ThreeScene.js
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import audioFile from '@/app/sounds/yuh.wav';

const ThreeScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const soundRef = useRef<THREE.Audio | null>(null);
  const analyserRef = useRef<THREE.AudioAnalyser | null>(null);

  const initScene = (mount: HTMLDivElement) => {
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

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 5;

    return { scene, camera, renderer, sphere };
  };

  const handleResize = (renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const setupAudio = (camera: THREE.PerspectiveCamera) => {
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

      const analyser = new THREE.AudioAnalyser(sound, 32);
      analyserRef.current = analyser;

      console.log('Audio buffer loaded:', buffer);
      console.log('Analyser data:', analyser.getFrequencyData());
    });
  };

  const animate = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, sphere: THREE.Mesh) => {
    const animateLoop = () => {
      requestAnimationFrame(animateLoop);

      if (analyserRef.current) {
        const data = analyserRef.current.getAverageFrequency();
        console.log('Analyser data:', data);

        if (data > 100) {
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

        const colorValue = (data / 256) * 0xffffff;
        sphere.material.color.setHex(colorValue);
      }

      renderer.render(scene, camera);
    };
    animateLoop();
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const mount = containerRef.current;
      const { scene, camera, renderer, sphere } = initScene(mount);

      setupAudio(camera);
      animate(scene, camera, renderer, sphere);

      const resizeHandler = () => handleResize(renderer, camera);
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
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

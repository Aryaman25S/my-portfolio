import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeStage() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(el.clientWidth, el.clientHeight);
    // Transparent clear so page bg shows through
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1),
      0.1,
      120
    );
    camera.position.set(3.2, 2.2, 6.0);
    camera.lookAt(0, 0, 0); // <-- ensure the cube is in view

    const hemi = new THREE.HemisphereLight(0x8aa0b5, 0x0a0f16, 0.8);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(-3, 6, 5);
    scene.add(dir);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x3aa0ff, roughness: 0.45, metalness: 0.35 })
    );
    cube.castShadow = true; cube.receiveShadow = true;
    scene.add(cube);

    const onResize = () => {
      if (!el) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let stop = false; const clock = new THREE.Clock();
    const render = () => {
      if (stop) return; requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      cube.rotation.x = t * 0.6; cube.rotation.y = t * 1.0;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      stop = true;
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.innerHTML = "";
    };
  }, []);

  // z-0 (not -z-10) so the canvas sits ABOVE the page bg but BELOW content
  return <div ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeStage() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c1118, 22, 62);

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1),
      0.1,
      220
    );
    camera.position.set(5.2, 3.4, 8.2);
    camera.lookAt(1.2, 1.2, 0);

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0x8aa0b5, 0x0a0f16, 0.7);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(-6, 10, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -12;
    dir.shadow.camera.right = 12;
    dir.shadow.camera.top = 12;
    dir.shadow.camera.bottom = -12;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 60;
    scene.add(dir);

    const fill = new THREE.PointLight(0x2a8cff, 0.35, 0, 2);
    fill.position.set(6, 4, -4);
    scene.add(fill);

    // --- Back wall gradient ---
    const wallGrad = (() => {
      const c = document.createElement("canvas");
      c.width = 2; c.height = 256; // vertical gradient
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#0b1220");
      grad.addColorStop(1, "#0a0f1a");
      g.fillStyle = grad; g.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.LinearFilter; return tex;
    })();
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 22),
      new THREE.MeshBasicMaterial({ map: wallGrad })
    );
    wall.position.set(0, 5.5, -9);
    scene.add(wall);

    // --- Table / Floor ---
    const tableMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a, // slate-900-ish
      roughness: 0.85,
      metalness: 0.05,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
    });
    const table = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 12), tableMat);
    table.position.set(0, -0.2, 0); // top around y=0
    table.receiveShadow = true;
    scene.add(table);

    // Extra soft shadow disk for grounding
    const makeRadialShadow = (size = 3.2, opacity = 1) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, "rgba(0,0,0,0.45)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
      m.rotation.x = -Math.PI / 2; m.position.set(1.2, 0.001, 0);
      return m;
    };
    const softShadow = makeRadialShadow(3.6, 1);
    scene.add(softShadow);

    // --- Materials ---
    const metal = new THREE.MeshPhysicalMaterial({
      color: 0x9aa3ad,
      metalness: 0.85,
      roughness: 0.25,
      reflectivity: 0.6,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });
    const darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x6b7280, metalness: 0.9, roughness: 0.35 });
    const blueAccent = new THREE.MeshStandardMaterial({
      color: 0x3aa0ff,
      emissive: 0x0041ff,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.3,
    });

    const addAccentRing = (group, radius = 0.28, thickness = 0.06) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 16, 64), blueAccent);
      ring.rotation.x = Math.PI / 2;
      ring.castShadow = true;
      ring.receiveShadow = true;
      group.add(ring);
      return ring;
    };

    // --- Dimensions ---
    const BASE_HEIGHT = 0.35;
    const L1 = 2.2;
    const L2 = 2.0;
    const L3 = 1.4;

    // --- Robot ---
    const robot = new THREE.Group();
    scene.add(robot);
    robot.position.set(1.2, 0, 0); // a bit right of center

    // Base
    const base = new THREE.Group();
    robot.add(base);
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, BASE_HEIGHT, 48), darkMetal);
    baseMesh.castShadow = true; baseMesh.receiveShadow = true; baseMesh.position.y = BASE_HEIGHT / 2;
    base.add(baseMesh);
    addAccentRing(base, 0.5, 0.05).position.y = BASE_HEIGHT * 0.65;

    // joints
    const j0 = new THREE.Group(); // base yaw
    base.add(j0);
    j0.position.y = BASE_HEIGHT;

    const shoulder = new THREE.Group();
    j0.add(shoulder);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, L1, 16, 32), metal);
    upperArm.position.set(0, L1 / 2, 0);
    upperArm.castShadow = true; upperArm.receiveShadow = true;
    shoulder.add(upperArm);
    addAccentRing(shoulder).position.y = 0.12;
    const j1 = shoulder;

    const elbow = new THREE.Group(); elbow.position.set(0, L1, 0); j1.add(elbow);
    const foreArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, L2, 16, 32), metal);
    foreArm.position.set(0, L2 / 2, 0);
    foreArm.castShadow = true; foreArm.receiveShadow = true;
    elbow.add(foreArm);
    addAccentRing(elbow).position.y = 0.07;
    const j2 = elbow;

    const wristYaw = new THREE.Group(); wristYaw.position.set(0, L2, 0); j2.add(wristYaw);
    addAccentRing(wristYaw).position.y = 0.07;
    const wristPitch = new THREE.Group(); wristPitch.position.set(0, 0.24, 0); wristYaw.add(wristPitch);
    const wristLink = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, L3, 16, 32), metal);
    wristLink.position.set(0, L3 / 2, 0);
    wristLink.castShadow = true; wristLink.receiveShadow = true;
    wristPitch.add(wristLink);
    const j3 = wristYaw; const j4 = wristPitch;

    // End effector head (visual only for now)
    const effector = new THREE.Group(); effector.position.set(0, L3, 0); j4.add(effector);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.25, 24), darkMetal);
    head.rotation.x = Math.PI / 2; head.castShadow = true; head.receiveShadow = true; effector.add(head);
    const sensorGlow = new THREE.Mesh(
      new THREE.RingGeometry(0.07, 0.11, 32),
      new THREE.MeshBasicMaterial({ color: 0x24a3ff, side: THREE.DoubleSide })
    );
    sensorGlow.position.z = 0.14; effector.add(sensorGlow);
    const blueLight = new THREE.PointLight(0x2aa4ff, 1.1, 6, 2.0); blueLight.position.set(0, 0.0, 0.2); effector.add(blueLight);
    const effectorTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x7fc4ff, emissive: 0x2fa2ff, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.2 })
    );
    effectorTip.position.z = 0.24; effector.add(effectorTip);

    // Slight tilt for natural stance
    j0.rotation.x = THREE.MathUtils.degToRad(-8);

    // --- Resize handling ---
    const onResize = () => {
      if (!el) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // --- Idle animation ---
    let stop = false; const clock = new THREE.Clock();
    const render = () => {
      if (stop) return; requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      j0.rotation.y = Math.sin(t * 0.35) * 0.15; // slow base yaw
      j1.rotation.x = Math.sin(t * 0.5) * 0.1 + 0.4; // shoulder bob
      j2.rotation.x = Math.sin(t * 0.62 + 0.6) * 0.12 + 0.8; // elbow
      j3.rotation.z = Math.sin(t * 0.8 + 1.0) * 0.08; // wrist yaw
      j4.rotation.x = Math.sin(t * 0.9 + 2.0) * 0.1; // wrist pitch
      renderer.render(scene, camera);
    };
    render();

    // --- Cleanup ---
    return () => {
      stop = true;
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.innerHTML = "";
    };
  }, []);

  // Stage sits behind UI, above page bg
  return <div ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}

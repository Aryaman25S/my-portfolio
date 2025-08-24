import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeStage() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current; if (!el) return; el.innerHTML = "";

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c1118, 22, 62);

    const camera = new THREE.PerspectiveCamera(45, Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1), 0.1, 220);
    camera.position.set(5.2, 3.4, 8.2);
    camera.lookAt(1.2, 1.2, 0);

    // Lights
    const hemi = new THREE.HemisphereLight(0x8aa0b5, 0x0a0f16, 0.7); scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9); dir.position.set(-6, 10, 6); dir.castShadow = true; dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -12; dir.shadow.camera.right = 12; dir.shadow.camera.top = 12; dir.shadow.camera.bottom = -12; dir.shadow.camera.near = 0.5; dir.shadow.camera.far = 60; scene.add(dir);
    const fill = new THREE.PointLight(0x2a8cff, 0.35, 0, 2); fill.position.set(6, 4, -4); scene.add(fill);

    // Back wall
    const wallGrad = (() => {
      const c = document.createElement("canvas"); c.width = 2; c.height = 256; const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 0, 256); grad.addColorStop(0, "#0b1220"); grad.addColorStop(1, "#0a0f1a");
      g.fillStyle = grad; g.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.LinearFilter; return tex;
    })();
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 22), new THREE.MeshBasicMaterial({ map: wallGrad })); wall.position.set(0, 5.5, -9); scene.add(wall);

    // Table & soft shadow
    const tableMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.05, clearcoat: 0.25, clearcoatRoughness: 0.5 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 12), tableMat); table.position.set(0, -0.2, 0); table.receiveShadow = true; scene.add(table);

    const makeRadialShadow = (size = 3.6, opacity = 1) => {
      const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
      const grad = g.createRadialGradient(128, 128, 10, 128, 128, 120); grad.addColorStop(0, "rgba(0,0,0,0.45)"); grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); m.rotation.x = -Math.PI / 2; m.position.set(1.2, 0.001, 0); return m;
    };
    scene.add(makeRadialShadow());

    // Materials
    const metal = new THREE.MeshPhysicalMaterial({ color: 0x9aa3ad, metalness: 0.85, roughness: 0.25, reflectivity: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x6b7280, metalness: 0.9, roughness: 0.35 });
    const blueAccent = new THREE.MeshStandardMaterial({ color: 0x3aa0ff, emissive: 0x0041ff, emissiveIntensity: 0.35, metalness: 0.7, roughness: 0.3 });
    const addAccentRing = (group, radius = 0.28, thickness = 0.06) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 16, 64), blueAccent); ring.rotation.x = Math.PI / 2; ring.castShadow = true; ring.receiveShadow = true; group.add(ring); return ring; };

    // Dimensions & workspace
    const BASE_HEIGHT = 0.35, L1 = 2.2, L2 = 2.0, L3 = 1.4; const MAX_REACH = L1 + L2 + L3 - 0.1;
    const TABLE_TOP_Y = 0.0, MAX_LINK_RADIUS = 0.24, EE_CLEARANCE = MAX_LINK_RADIUS + 0.06; const BASE_MIN_EE_Y = TABLE_TOP_Y + EE_CLEARANCE; const getMinEEY = () => BASE_MIN_EE_Y;

    // Robot hierarchy
    const robot = new THREE.Group(); scene.add(robot); robot.position.set(1.2, 0, 0);
    const base = new THREE.Group(); robot.add(base);
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, BASE_HEIGHT, 48), darkMetal); baseMesh.castShadow = true; baseMesh.receiveShadow = true; baseMesh.position.y = BASE_HEIGHT / 2; base.add(baseMesh); addAccentRing(base, 0.5, 0.05).position.y = BASE_HEIGHT * 0.65;

    const j0 = new THREE.Group(); base.add(j0); j0.position.y = BASE_HEIGHT;
    const shoulder = new THREE.Group(); j0.add(shoulder);
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, L1, 16, 32), metal); upperArm.position.set(0, L1 / 2, 0); upperArm.castShadow = true; upperArm.receiveShadow = true; shoulder.add(upperArm); addAccentRing(shoulder).position.y = 0.12; const j1 = shoulder;
    const elbow = new THREE.Group(); elbow.position.set(0, L1, 0); j1.add(elbow);
    const foreArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, L2, 16, 32), metal); foreArm.position.set(0, L2 / 2, 0); foreArm.castShadow = true; foreArm.receiveShadow = true; elbow.add(foreArm); addAccentRing(elbow).position.y = 0.07; const j2 = elbow;
    const wristYaw = new THREE.Group(); wristYaw.position.set(0, L2, 0); j2.add(wristYaw); addAccentRing(wristYaw).position.y = 0.07; const j3 = wristYaw;
    const wristPitch = new THREE.Group(); wristPitch.position.set(0, 0.24, 0); wristYaw.add(wristPitch);
    const wristLink = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, L3, 16, 32), metal); wristLink.position.set(0, L3 / 2, 0); wristLink.castShadow = true; wristLink.receiveShadow = true; wristPitch.add(wristLink); const j4 = wristPitch;

    const effector = new THREE.Group(); effector.position.set(0, L3, 0); j4.add(effector);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.25, 24), darkMetal); head.rotation.x = Math.PI / 2; head.castShadow = true; head.receiveShadow = true; effector.add(head);
    const sensorGlow = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.11, 32), new THREE.MeshBasicMaterial({ color: 0x24a3ff, side: THREE.DoubleSide })); sensorGlow.position.z = 0.14; effector.add(sensorGlow);
    const blueLight = new THREE.PointLight(0x2aa4ff, 1.1, 6, 2.0); blueLight.position.set(0, 0.0, 0.2); effector.add(blueLight);
    const effectorTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 16), new THREE.MeshStandardMaterial({ color: 0x7fc4ff, emissive: 0x2fa2ff, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.2 })); effectorTip.position.z = 0.24; effector.add(effectorTip);

    j0.rotation.x = THREE.MathUtils.degToRad(-8);

    // IK utils + limits
    const joints = [j0, j1, j2, j3, j4];
    const limits = [
      [THREE.MathUtils.degToRad(-15), THREE.MathUtils.degToRad(15),  THREE.MathUtils.degToRad(-150), THREE.MathUtils.degToRad(150), THREE.MathUtils.degToRad(-15), THREE.MathUtils.degToRad(15)],
      [THREE.MathUtils.degToRad(-25), THREE.MathUtils.degToRad(95),  THREE.MathUtils.degToRad(-20),  THREE.MathUtils.degToRad(20),  THREE.MathUtils.degToRad(-35), THREE.MathUtils.degToRad(35)],
      [THREE.MathUtils.degToRad(-5),  THREE.MathUtils.degToRad(140), THREE.MathUtils.degToRad(-15),  THREE.MathUtils.degToRad(15),  THREE.MathUtils.degToRad(-35), THREE.MathUtils.degToRad(35)],
      [THREE.MathUtils.degToRad(-25), THREE.MathUtils.degToRad(25),  THREE.MathUtils.degToRad(-150), THREE.MathUtils.degToRad(150), THREE.MathUtils.degToRad(-25), THREE.MathUtils.degToRad(25)],
      [THREE.MathUtils.degToRad(-90), THREE.MathUtils.degToRad(85),  THREE.MathUtils.degToRad(-25),  THREE.MathUtils.degToRad(25),  THREE.MathUtils.degToRad(-25), THREE.MathUtils.degToRad(25)],
    ];

    const clampEuler = (obj, lim) => { const e = new THREE.Euler().setFromQuaternion(obj.quaternion, "XYZ"); e.x = THREE.MathUtils.clamp(e.x, lim[0], lim[1]); e.y = THREE.MathUtils.clamp(e.y, lim[2], lim[3]); e.z = THREE.MathUtils.clamp(e.z, lim[4], lim[5]); obj.quaternion.setFromEuler(e); };
    const getWorldPos = (obj) => { obj.updateWorldMatrix(true, false); return new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld); };
    const clampToReach = (basePos, desired) => { const to = desired.clone().sub(basePos); const len = to.length(); if (!Number.isFinite(len) || len < 1e-6) return basePos.clone(); if (len > MAX_REACH) to.multiplyScalar(MAX_REACH / len); return basePos.clone().add(to); };
    const clampToWorkspace = (basePos, desired) => { const r = clampToReach(basePos, desired); const minY = getMinEEY(); if (r.y < minY) r.y = minY; return r; };

    // Targeting
    const target = new THREE.Vector3(2.4, 1.6, 1.2);
    const smoothed = target.clone();
    const targetPlane = new THREE.Plane();
    const updateTargetPlane = () => { const n = new THREE.Vector3(); camera.getWorldDirection(n); const anchor = new THREE.Vector3(1.2, 1.2, 0); targetPlane.setFromNormalAndCoplanarPoint(n, anchor); };
    updateTargetPlane();

    const raycaster = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    const setTargetFromNDC = (x, y) => { ndc.set(x, y); raycaster.setFromCamera(ndc, camera); const hit = new THREE.Vector3(); if (raycaster.ray.intersectPlane(targetPlane, hit)) target.copy(hit); };

    const setTargetFromElement = (el) => { if (!el) return; const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const x = (cx / window.innerWidth) * 2 - 1; const y = -((cy / window.innerHeight) * 2 - 1); setTargetFromNDC(x, y); };

    const onPointerMove = (e) => { const x = (e.clientX / window.innerWidth) * 2 - 1; const y = -((e.clientY / window.innerHeight) * 2 - 1); setTargetFromNDC(x, y); };
    window.addEventListener("pointermove", onPointerMove);

    // CCD IK
    const tmpV1 = new THREE.Vector3(); const tmpV2 = new THREE.Vector3(); const lastTarget = new THREE.Vector3();
    const safeNormalize = (v, fallback = new THREE.Vector3(0, 1, 0)) => { const len = v.length(); return (!Number.isFinite(len) || len < 1e-6) ? fallback.clone() : v.multiplyScalar(1 / len); };
    const IK_ALPHA = prefersReduced ? 0.06 : 0.12;

    const solveIK = () => {
      if (lastTarget.distanceToSquared(target) < 1e-5) return;
      smoothed.set(
        THREE.MathUtils.lerp(smoothed.x, target.x, IK_ALPHA),
        THREE.MathUtils.lerp(smoothed.y, target.y, IK_ALPHA),
        THREE.MathUtils.lerp(smoothed.z, target.z, IK_ALPHA)
      );
      const basePos = getWorldPos(j0); const working = clampToWorkspace(basePos, smoothed);
      const iterations = prefersReduced ? 4 : 8;
      for (let it = 0; it < iterations; it++) {
        scene.updateMatrixWorld(true);
        for (let i = joints.length - 1; i >= 0; i--) {
          const joint = joints[i]; if (!joint) continue;
          const effW = getWorldPos(effector);
          const jInv = new THREE.Matrix4().copy(joint.matrixWorld).invert();
          const elp = tmpV1.copy(effW).applyMatrix4(jInv);
          const tlp = tmpV2.copy(working).applyMatrix4(jInv);
          safeNormalize(elp); safeNormalize(tlp);
          const q = new THREE.Quaternion().setFromUnitVectors(elp, tlp); if (Number.isNaN(q.x)) continue;
          const newQ = new THREE.Quaternion().multiplyQuaternions(joint.quaternion, q);
          joint.quaternion.slerp(newQ, 0.5); clampEuler(joint, limits[i]);
        }
      }
      const camPos = new THREE.Vector3(); camera.getWorldPosition(camPos); effector.lookAt(camPos);
      lastTarget.copy(target);
    };

    // Resize
    const onResize = () => { if (!el) return; renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1); camera.updateProjectionMatrix(); updateTargetPlane(); };
    window.addEventListener("resize", onResize);

    // Render loop
    let stop = false; const clock = new THREE.Clock();
    const render = () => {
      if (stop) return; requestAnimationFrame(render);
      const t = clock.getElapsedTime(); if (!prefersReduced) { j0.rotation.y += Math.sin(t * 0.5) * 0.0002; }
      solveIK();
      try {
        const eff = projectScreen(getWorldPos(effector)); const baseScreen = projectScreen(getWorldPos(j0));
        if (window.robotAPI?.onEffectorScreenPos) window.robotAPI.onEffectorScreenPos(eff);
        if (window.robotAPI?.onBaseScreenPos) window.robotAPI.onBaseScreenPos(baseScreen);
      } catch {}
      renderer.render(scene, camera);
    };

    const projectScreen = (v) => { const p = v.clone().project(camera); const x = (p.x + 1) * 0.5 * el.clientWidth; const y = (1 - p.y) * 0.5 * el.clientHeight; return { x, y }; };

    // Expose hooks
    window.robotAPI = { setTargetFromElement, onEffectorScreenPos: null, onBaseScreenPos: null };

    render();

    // Cleanup
    return () => { stop = true; window.removeEventListener("resize", onResize); window.removeEventListener("pointermove", onPointerMove); renderer.dispose(); el.innerHTML = ""; if (window.robotAPI) { window.robotAPI.onEffectorScreenPos = null; window.robotAPI.onBaseScreenPos = null; } };
  }, []);

  return <div ref={ref} className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />;
}
import * as THREE from "three";

// Theme toggle

const themeButton = document.querySelector("#theme-toggle");
const themeSymbol = document.querySelector("#theme-symbol");
const html = document.documentElement;

const savedTheme = localStorage.getItem("aditya-theme");

if (savedTheme === "light" || savedTheme === "dark") {
  html.setAttribute("data-theme", savedTheme);
}

function updateThemeIcon() {
  const currentTheme = html.getAttribute("data-theme");

  if (themeSymbol) {
    themeSymbol.textContent = currentTheme === "dark" ? "☼" : "☾";
  }

  if (themeButton) {
    themeButton.setAttribute(
      "aria-label",
      currentTheme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme"
    );
  }
}

updateThemeIcon();

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", nextTheme);
    localStorage.setItem("aditya-theme", nextTheme);
    updateThemeIcon();
  });
}

// Year in footer

const yearEl = document.querySelector("#year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// WebGL scene

const canvas = document.querySelector("#webgl-canvas");
if (!canvas) {
  console.warn("No WebGL canvas found");
} else {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(0, 1.2, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

  // Object

  const geometry = new THREE.IcosahedronGeometry(1.6, 1);

  const material = new THREE.MeshNormalMaterial({
    flatShading: false,
    wireframe: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const wireGeo = new THREE.IcosahedronGeometry(1.62, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x47e6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });

  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // Rings

  const ringGeo = new THREE.TorusGeometry(3.2, 0.025, 16, 120);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x78ddff,
    transparent: true,
    opacity: 0.25
  });

  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2.2;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.rotation.x = -Math.PI / 2.2;
  scene.add(ring2);

  // Lights

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 4, 2);
  scene.add(dir);

  // Stars

  const starsGeo = new THREE.BufferGeometry();
  const starCount = 800;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 30;
    positions[i + 1] = (Math.random() - 0.5) * 30;
    positions[i + 2] = (Math.random() - 0.5) * 30;
  }

  starsGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const starsMat = new THREE.PointsMaterial({
    color: 0x9b8cff,
    size: 0.035,
    transparent: true,
    opacity: 0.7
  });

  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // Floor grid

  const grid = new THREE.GridHelper(30, 30, 0x47e6d4, 0x47e6d4);
  grid.position.y = -2.5;
  grid.material.opacity = 0.12;
  grid.material.transparent = true;
  scene.add(grid);

  // Animation

  let time = 0;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function animate() {
    requestAnimationFrame(animate);

    time += 0.005;

    if (!reducedMotion) {
      mesh.rotation.y += 0.0025;
      mesh.rotation.x += 0.0012;

      wire.rotation.y += 0.0025;
      wire.rotation.x += 0.0012;

      ring1.rotation.z += 0.0018;
      ring2.rotation.z -= 0.0018;

      stars.rotation.y += 0.0004;

      mesh.position.y = Math.sin(time) * 0.08;
      wire.position.y = Math.sin(time) * 0.08;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Mouse interaction

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("pointermove", (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    mouseX = x;
    mouseY = y;

    if (!reducedMotion) {
      mesh.rotation.y += x * 0.002;
      mesh.rotation.x += y * 0.002;
    }
  });
}

// Active nav link

const navLinks = document.querySelectorAll(".nav-list a");
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const isActive =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isActive);
          });
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

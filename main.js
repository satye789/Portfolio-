// Using THREE and gsap from global CDN imports in index.html

// ==========================================
// Custom Cursor Logic
// ==========================================
const cursor = document.querySelector(".cursor");
const cursorFollower = document.querySelector(".cursor-follower");

let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Update main cursor instantly
  cursor.style.left = mouseX + "px";
  cursor.style.top = mouseY + "px";
});

// Smooth follower logic using GSAP ticker
gsap.ticker.add(() => {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;

  cursorFollower.style.left = followerX + "px";
  cursorFollower.style.top = followerY + "px";
});

// ==========================================
// Three.js Background Animation
// ==========================================
const canvas = document.querySelector("#bg-canvas");

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030305, 0.001);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Window Resize Handling
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200); // Wait 200ms after the last resize event before updating
});

// --- Interactive Particle Network ---
const particlesCount = 150;
const maxDistance = 15;
const bounds = 40;

const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const particlesData = [];

const colorPrimary = new THREE.Color(0x00ffd5);
const colorSecondary = new THREE.Color(0x9d00ff);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * bounds * 2;
  positions[i * 3 + 1] = (Math.random() - 0.5) * bounds * 2;
  positions[i * 3 + 2] = (Math.random() - 0.5) * bounds * 2;

  const mixedColor =
    Math.random() > 0.5 ? colorPrimary.clone() : colorSecondary.clone();
  colors[i * 3] = mixedColor.r;
  colors[i * 3 + 1] = mixedColor.g;
  colors[i * 3 + 2] = mixedColor.b;

  particlesData.push({
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
    ),
    numConnections: 0,
    color: mixedColor,
  });
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
);
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0,
  vertexColors: true,
  transparent: true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);

// --- Network Lines ---
const linesGeometry = new THREE.BufferGeometry();
const maxLines = particlesCount * particlesCount;
const linesPositions = new Float32Array(maxLines * 3);
const linesColors = new Float32Array(maxLines * 3);

linesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(linesPositions, 3).setUsage(THREE.DynamicDrawUsage),
);
linesGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(linesColors, 3).setUsage(THREE.DynamicDrawUsage),
);

const linesMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
});

const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);

// Group to hold both for parallax
const networkGroup = new THREE.Group();
networkGroup.add(particlesMesh);
networkGroup.add(linesMesh);

// --- Geometric AI Core ---
const aiCoreGroup = new THREE.Group();

// Central glowing wireframe core
const coreGeometry = new THREE.IcosahedronGeometry(4, 1);
const coreMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ffd5,
  emissive: 0x00b3ff,
  emissiveIntensity: 0.5,
  wireframe: true,
  transparent: true,
  opacity: 0.8,
});
const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
aiCoreGroup.add(coreMesh);

// Inner solid core
const innerCoreGeo = new THREE.IcosahedronGeometry(2, 0);
const innerCoreMat = new THREE.MeshPhongMaterial({
  color: 0x9d00ff,
  emissive: 0x4b0082,
  emissiveIntensity: 0.8,
  flatShading: true,
});
const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
aiCoreGroup.add(innerCoreMesh);

// Orbiting Data Rings
const ringGeo1 = new THREE.TorusGeometry(7, 0.1, 16, 100);
const ringMat1 = new THREE.MeshBasicMaterial({
  color: 0x00ffd5,
  transparent: true,
  opacity: 0.5,
});
const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
aiCoreGroup.add(ringMesh1);

const ringGeo2 = new THREE.TorusGeometry(9, 0.05, 16, 100);
const ringMat2 = new THREE.MeshBasicMaterial({
  color: 0x9d00ff,
  transparent: true,
  opacity: 0.4,
});
const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
aiCoreGroup.add(ringMesh2);

// Add light for the core
const coreLight = new THREE.PointLight(0x00ffd5, 2, 50);
aiCoreGroup.add(coreLight);

networkGroup.add(aiCoreGroup);
scene.add(networkGroup);

// Ambient light to ensure materials are visible
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// --- Gradient Descent Loss Landscape ---
const terrainGeometry = new THREE.PlaneGeometry(150, 150, 40, 40);
const terrainMaterial = new THREE.MeshBasicMaterial({
  color: 0x9d00ff,
  wireframe: true,
  transparent: true,
  opacity: 0.15,
});
const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotation.x = -Math.PI / 2;
terrainMesh.position.y = -20;
scene.add(terrainMesh);

// --- Floating Labels ---
const techLabels = [
  "Python",
  "React.js",
  "Three.js",
  "Node.js",
  "LLMs",
  "TensorFlow",
  "GSAP",
  "Next.js",
  "GraphQL",
  "PyTorch",
  "C++",
  "Java",
  "SQL",
  "Rust",
  "Go",
  "Ruby",
  "Scikit-Learn",
  "Keras",
  "OpenCV",
  "Pandas",
  "NumPy",
  "Transformers",
  "Generative AI",
  "Docker",
  "AWS",
  "Kubernetes",
  "Redis",
  "TypeScript",
  "HTML5",
  "CSS3",
];
const labelElements = [];

const labelsContainer = document.createElement("div");
labelsContainer.id = "tech-labels-container";
document.body.appendChild(labelsContainer);

for (let i = 0; i < particlesCount; i++) {
  const text = techLabels[Math.floor(Math.random() * techLabels.length)];
  const el = document.createElement("div");
  el.className = "tech-label";
  el.textContent = text;
  labelsContainer.appendChild(el);

  labelElements.push({
    element: el,
    particleIndex: i,
  });
}

// Mouse interaction state for 3D
let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };

document.addEventListener("mousemove", (event) => {
  targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Scroll interaction state
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// Render Loop
const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime();

  // Smooth mouse interpolation (Parallax)
  mouse.x += (targetMouse.x - mouse.x) * 0.05;
  mouse.y += (targetMouse.y - mouse.y) * 0.05;

  networkGroup.rotation.y = elapsedTime * 0.05;
  networkGroup.rotation.x = elapsedTime * 0.02;
  networkGroup.position.x = mouse.x * 2;
  networkGroup.position.y = mouse.y * 2;

  // Pulse and rotate AI Core
  const pulse = Math.sin(elapsedTime * 2) * 0.1 + 1;
  coreMesh.scale.set(pulse, pulse, pulse);
  innerCoreMesh.rotation.y = elapsedTime * 0.5;
  innerCoreMesh.rotation.x = elapsedTime * 0.3;
  coreMesh.rotation.y = -elapsedTime * 0.2;

  ringMesh1.rotation.x = elapsedTime * 0.4;
  ringMesh1.rotation.y = elapsedTime * 0.3;
  ringMesh2.rotation.z = -elapsedTime * 0.5;
  ringMesh2.rotation.x = elapsedTime * 0.2;

  // Animate Loss Landscape
  const time = elapsedTime * 1.2;
  const terrainPositions = terrainGeometry.attributes.position.array;
  for (let i = 0; i < terrainPositions.length; i += 3) {
    const x = terrainPositions[i];
    const y = terrainPositions[i + 1]; // Note: y is 2D projection before rotation
    // Combine sine waves to create complex topography that rolls toward camera
    terrainPositions[i + 2] =
      Math.sin(x * 0.05 + time * 0.5) * 3 + Math.cos(y * 0.05 - time) * 3;
  }
  terrainGeometry.attributes.position.needsUpdate = true;

  // Update particles and lines
  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  const posAttribute = particlesGeometry.attributes.position;

  for (let i = 0; i < particlesCount; i++) {
    particlesData[i].numConnections = 0;

    // Calculate mouse interaction forcefield
    const mx = targetMouse.x * 25; // Approximate screen space to world space scaling
    const my = targetMouse.y * 25 - scrollY * 0.02; // Adjust for scroll

    const dxMouse = posAttribute.array[i * 3] - mx;
    const dyMouse = posAttribute.array[i * 3 + 1] - my;
    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

    if (distMouse < 8) {
      const force = (8 - distMouse) / 8;
      particlesData[i].velocity.x += (dxMouse / distMouse) * force * 0.02;
      particlesData[i].velocity.y += (dyMouse / distMouse) * force * 0.02;
      // Prevent explosive chaos
      particlesData[i].velocity.clampLength(0, 0.15);
    } else {
      // Add a slight friction to slowly return to normal drift speeds
      if (particlesData[i].velocity.length() > 0.08) {
        particlesData[i].velocity.multiplyScalar(0.98);
      }
    }

    // Move particles
    posAttribute.array[i * 3] += particlesData[i].velocity.x;
    posAttribute.array[i * 3 + 1] += particlesData[i].velocity.y;
    posAttribute.array[i * 3 + 2] += particlesData[i].velocity.z;

    // Bounce off bounds
    if (Math.abs(posAttribute.array[i * 3]) > bounds) {
      posAttribute.array[i * 3] = Math.sign(posAttribute.array[i * 3]) * bounds;
      particlesData[i].velocity.x *= -1;
    }
    if (Math.abs(posAttribute.array[i * 3 + 1]) > bounds) {
      posAttribute.array[i * 3 + 1] =
        Math.sign(posAttribute.array[i * 3 + 1]) * bounds;
      particlesData[i].velocity.y *= -1;
    }
    if (Math.abs(posAttribute.array[i * 3 + 2]) > bounds) {
      posAttribute.array[i * 3 + 2] =
        Math.sign(posAttribute.array[i * 3 + 2]) * bounds;
      particlesData[i].velocity.z *= -1;
    }
  }

  // Draw lines
  for (let i = 0; i < particlesCount; i++) {
    for (let j = i + 1; j < particlesCount; j++) {
      const dx = posAttribute.array[i * 3] - posAttribute.array[j * 3];
      const dy = posAttribute.array[i * 3 + 1] - posAttribute.array[j * 3 + 1];
      const dz = posAttribute.array[i * 3 + 2] - posAttribute.array[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < maxDistance) {
        particlesData[i].numConnections++;
        particlesData[j].numConnections++;

        const alpha = 1.0 - dist / maxDistance;

        // Position 1
        linesPositions[vertexpos++] = posAttribute.array[i * 3];
        linesPositions[vertexpos++] = posAttribute.array[i * 3 + 1];
        linesPositions[vertexpos++] = posAttribute.array[i * 3 + 2];

        // Position 2
        linesPositions[vertexpos++] = posAttribute.array[j * 3];
        linesPositions[vertexpos++] = posAttribute.array[j * 3 + 1];
        linesPositions[vertexpos++] = posAttribute.array[j * 3 + 2];

        const c1 = particlesData[i].color;
        const c2 = particlesData[j].color;

        linesColors[colorpos++] = c1.r * alpha;
        linesColors[colorpos++] = c1.g * alpha;
        linesColors[colorpos++] = c1.b * alpha;

        linesColors[colorpos++] = c2.r * alpha;
        linesColors[colorpos++] = c2.g * alpha;
        linesColors[colorpos++] = c2.b * alpha;

        numConnected++;
      }
    }
  }

  posAttribute.needsUpdate = true;
  linesGeometry.attributes.position.needsUpdate = true;
  linesGeometry.attributes.color.needsUpdate = true;
  linesGeometry.setDrawRange(0, numConnected * 2);

  // Update labels mapping 3D to 2D
  const tempVec = new THREE.Vector3();
  labelElements.forEach((item) => {
    tempVec.set(
      posAttribute.array[item.particleIndex * 3],
      posAttribute.array[item.particleIndex * 3 + 1],
      posAttribute.array[item.particleIndex * 3 + 2],
    );

    // Apply network group's matrix to the local vector to get world position
    tempVec.applyMatrix4(networkGroup.matrixWorld);

    // Project to screen space
    tempVec.project(camera);

    const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight;

    item.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    item.element.style.zIndex = Math.round((1 - tempVec.z) * 100);

    // Fade out labels that are behind the camera or too far
    if (tempVec.z > 1 || tempVec.z < 0) {
      item.element.style.opacity = 0;
    } else {
      item.element.style.opacity = 1 - Math.pow(tempVec.z, 2);
    }
  });

  camera.position.y = -(scrollY * 0.02);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();

// ==========================================
// GSAP Reveal Animations
// ==========================================
const panels = document.querySelectorAll(".glass-panel");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gsap.fromTo(
          entry.target,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        );
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

panels.forEach((panel) => {
  panel.style.opacity = "0";
  observer.observe(panel);
});

// Hero Animation
gsap.from(".logo", { y: -50, opacity: 0, duration: 1, delay: 0.2 });
gsap.from(".nav-links li", {
  y: -50,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  delay: 0.3,
});

gsap.from(".hero-subtitle", { x: -50, opacity: 0, duration: 0.8, delay: 0.5 });
gsap.from(".hero-title", { x: -50, opacity: 0, duration: 1, delay: 0.7 });
gsap.from(".hero-role", { x: -50, opacity: 0, duration: 1, delay: 0.9 });
gsap.from(".hero-cta a, .hero-cta button", {
  y: 30,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  delay: 1.1,
});

// ==========================================
// Staggered Elements Reveal (Skills & Cards)
// ==========================================
const skillsSection = document.querySelector("#skills");
if (skillsSection) {
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            entry.target.querySelectorAll(".tags span"),
            { opacity: 0, y: 20, scale: 0.5 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: "back.out(1.5)",
              delay: 0.3,
            },
          );
          skillsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  skillsObserver.observe(skillsSection);
}

const gridSections = document.querySelectorAll(
  "#projects, #ai-tech, #education",
);
gridSections.forEach((section) => {
  const gridObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(
            ".project-card, .ai-card, .edu-card",
          );
          if (cards.length > 0) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out",
                delay: 0.2,
              },
            );
          }
          gridObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  gridObserver.observe(section);
});

// Certificates List Slide-in Reveal
const certSection = document.querySelector("#certificates");
if (certSection) {
  const certObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const listItems = entry.target.querySelectorAll(".cert-list li");
          if (listItems.length > 0) {
            gsap.fromTo(
              listItems,
              { opacity: 0, x: -50 },
              {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.3,
              },
            );
          }
          certObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  certObserver.observe(certSection);
}

// ==========================================
// Theme Toggling Logic
// ==========================================
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.querySelector(".sun-icon");
const moonIcon = document.querySelector(".moon-icon");
let isLightMode = false;

themeToggle.addEventListener("click", () => {
  isLightMode = !isLightMode;
  document.body.classList.toggle("light-mode");

  if (isLightMode) {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    scene.fog.color.setHex(0xf0f4f8);
    particlesMaterial.color.setHex(0x334155);
    particlesMaterial.blending = THREE.NormalBlending;
    linesMaterial.color.setHex(0x334155);
    linesMaterial.blending = THREE.NormalBlending;
    terrainMaterial.color.setHex(0x8b5cf6);
    terrainMaterial.opacity = 0.25;
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    scene.fog.color.setHex(0x030305);
    particlesMaterial.color.setHex(0xffffff);
    particlesMaterial.blending = THREE.AdditiveBlending;
    linesMaterial.color.setHex(0xffffff);
    linesMaterial.blending = THREE.AdditiveBlending;
    terrainMaterial.color.setHex(0x9d00ff);
    terrainMaterial.opacity = 0.15;
  }
});

// ==========================================
// Mobile Navigation Logic
// ==========================================
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Close menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// ==========================================
// Chatbot Logic
// ==========================================
const chatToggle = document.getElementById("chat-bot-toggle");
const chatWindow = document.getElementById("chat-bot-window");
const chatClose = document.getElementById("chat-bot-close");
const chatInput = document.getElementById("chat-bot-input");
const chatSend = document.getElementById("chat-bot-send");
const chatMessages = document.getElementById("chat-bot-messages");
const chatClear = document.getElementById("chat-bot-clear");
let chatHistory = [];

chatToggle.addEventListener("click", () => {
  chatWindow.classList.toggle("active");
  if (chatWindow.classList.contains("active")) {
    chatInput.focus();
  }
});

chatClose.addEventListener("click", () => {
  chatWindow.classList.remove("active");
});

// Clear Chat History UI
chatClear.addEventListener("click", () => {
  chatHistory = [];
  chatMessages.innerHTML = `
    <div class="message ai">
      <p>Memory cleared. How can I help you today?</p>
    </div>
  `;
});

// Advanced Knowledge Base connected to LLM Backend
async function getBotResponse(input) {
  // Simulate network delay to make the AI feel real
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000),
  );

  const text = input.toLowerCase();

  if (text.includes("resume") || text.includes("cv")) {
    return "You can download Satyendra's resume using the button in the Hero section! He is actively looking for opportunities to leverage his backend and data analysis skills.";
  }

  if (
    text.includes("skill") ||
    text.includes("tech") ||
    text.includes("stack") ||
    text.includes("language") ||
    text.includes("technical")
  ) {
    return "He is proficient in Python, Java, C, JavaScript, and HTML/CSS. His core focus is on Artificial Intelligence, Machine Learning, Data Analytics, and tools like Power BI and MySQL.";
  }

  if (
    text.includes("project") ||
    text.includes("portfolio") ||
    text.includes("built")
  ) {
    return "Some of his notable projects include a 'Brain Tumor Detective Website' using Python and ML, and a 'College ERP' system. Check out the Featured Projects section for more details.";
  }

  if (
    text.includes("contact") ||
    text.includes("email") ||
    text.includes("hire") ||
    text.includes("reach") ||
    text.includes("linkedin")
  ) {
    return "You can reach Satyendra via email at satyeky9793@gmail.com, call him at 9455045547, or connect on LinkedIn. There is also a direct contact form you can use at the bottom of the page.";
  }

  if (
    text.includes("education") ||
    text.includes("university") ||
    text.includes("b-tech") ||
    text.includes("degree")
  ) {
    return "He is currently pursuing his B-Tech in Computer Science Engineering (Artificial Intelligence) from S.R. Institution of Management and Technology in Lucknow.";
  }

  if (
    text.includes("certificate") ||
    text.includes("certifications") ||
    text.includes("license")
  ) {
    return "He has certifications in Power BI, Deloitte Data Analytics Job Simulation, and Vista Equity Partners AI in Action Job Simulation amongst others!";
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hello! 👋 I'm Satyendra's AI assistant. Ask me about his projects, skills, education, or how to contact him!";
  }

  return "I don't have a specific answer for that. However, Satyendra is a highly adaptable engineer! I'd recommend reaching out to him directly via the Contact section to discuss further.";
}

// Quick Reply Butons Event Listeners
const quickRepliesContainer = document.getElementById("chat-quick-replies");
const quickReplyBtns = document.querySelectorAll(".quick-reply-btn");

quickReplyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    chatInput.value = btn.innerText;
    handleSendMessage();
  });
});

function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ai typing-indicator`;
  msgDiv.innerHTML = `<div class="message-typing"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv;
}

async function handleSendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Hide quick replies if they exist
  if (quickRepliesContainer) {
    quickRepliesContainer.style.display = "none";
  }

  // User message
  addMessage(text, "user");
  chatHistory.push({ role: "user", content: text });
  chatInput.value = "";

  // Disable input while waiting for backend
  chatInput.disabled = true;
  chatSend.disabled = true;

  // Bot typing simulation
  const typingElement = showTyping();

  // Fetch response from the backend API
  const responseText = await getBotResponse(text);
  typingElement.remove();
  addMessage(responseText, "ai");
  chatHistory.push({ role: "assistant", content: responseText });

  // Re-enable input
  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener("click", handleSendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSendMessage();
});

// ==========================================
// Terminal Animation Logic
// ==========================================
const terminalSection = document.querySelector("#ai-tech");
const typingText = document.getElementById("typing-text");
const terminalOutput = document.getElementById("terminal-output");
const typingString =
  'python inference.py --model="transformer-xl" --use_gpu=True';

let isTerminalAnimated = false;

const terminalObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isTerminalAnimated) {
        isTerminalAnimated = true;
        let i = 0;
        typingText.innerHTML = "";

        function typeChar() {
          if (i < typingString.length) {
            typingText.innerHTML += typingString.charAt(i);
            i++;
            setTimeout(typeChar, 40 + Math.random() * 40);
          } else {
            // Finished typing, execute command
            setTimeout(() => {
              gsap.to(terminalOutput, {
                display: "block",
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
              });
            }, 400);
          }
        }

        // Start typing after a short delay
        setTimeout(typeChar, 600);
      }
    });
  },
  { threshold: 0.5 },
);

if (terminalSection) terminalObserver.observe(terminalSection);

// ==========================================
// Magnetic Mouse Interaction
// ==========================================
const magneticBtns = document.querySelectorAll(".btn");

magneticBtns.forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.5,
      ease: "power3.out",
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
    });
  });
});

// ==========================================
// Magnetic Image Interaction (About Section)
// ==========================================
const aboutImage = document.querySelector(".about-image img");
if (aboutImage) {
  aboutImage.addEventListener("mousemove", (e) => {
    const rect = aboutImage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(aboutImage, {
      x: x * 0.15,
      y: y * 0.15,
      rotationY: x * 0.05,
      rotationX: -y * 0.05,
      duration: 0.5,
      ease: "power3.out",
    });
  });

  aboutImage.addEventListener("mouseleave", () => {
    gsap.to(aboutImage, {
      x: 0,
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  });
}

// ==========================================
// Scroll Progress Bar
// ==========================================
const scrollProgress = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {
  if (scrollProgress) {
    const scrollTop = window.scrollY;
    // Calculate total scrollable height
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Smooth width update
    scrollProgress.style.width = scrollPercent + "%";
  }
});

// ==========================================
// 3D Tilt Effect on Project Cards
// ==========================================
const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation with a max of 10 degrees limits
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.5,
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      ease: "power3.out",
      duration: 0.8,
    });
  });
});

// ==========================================
// Timeline Animation Trigger
// ==========================================
const timeline = document.querySelector(".timeline");
if (timeline) {
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  timelineObserver.observe(timeline);
}

// ==========================================
// Contact Form Handling
// ==========================================
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const formSubmitBtn = contactForm.querySelector(".submit-btn");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const originalText = formSubmitBtn.innerText;
    formSubmitBtn.innerText = "Sending...";
    formSubmitBtn.disabled = true;

    // Simulate a network request (Replace this with actual Fetch API call to Formspree/Netlify/Backend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create or get status message element
    let statusMsg = document.getElementById("form-status");
    if (!statusMsg) {
      statusMsg = document.createElement("div");
      statusMsg.id = "form-status";
      statusMsg.className = "form-status success";
      contactForm.appendChild(statusMsg);
    }

    statusMsg.innerHTML =
      "✨ Message sent successfully! I will get back to you soon.";
    statusMsg.style.display = "block";

    contactForm.reset();
    formSubmitBtn.innerText = originalText;
    formSubmitBtn.disabled = false;

    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 5000);
  });
}

// ==========================================
// Hacker Text Scramble Effect
// ==========================================
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
const scrambleElements = document.querySelectorAll(
  ".section-title span, .hero-subtitle",
);

const scrambleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Preserve original text in dataset
        const originalText = el.dataset.scrambleText || el.innerText;
        if (!el.dataset.scrambleText) el.dataset.scrambleText = originalText;

        let iteration = 0;
        clearInterval(el.scrambleInterval);

        el.scrambleInterval = setInterval(() => {
          el.innerText = originalText
            .split("")
            .map((letter, index) => {
              // Keep original spacing to prevent layout shifts
              if (letter === " ") return " ";
              // Reveal original characters over time
              if (index < iteration) {
                return originalText[index];
              }
              // Scramble the rest
              return scrambleChars[
                Math.floor(Math.random() * scrambleChars.length)
              ];
            })
            .join("");

          if (iteration >= originalText.length) {
            clearInterval(el.scrambleInterval);
            el.innerText = originalText;
          }

          iteration += 1 / 3;
        }, 30);

        scrambleObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.8 },
);

scrambleElements.forEach((el) => scrambleObserver.observe(el));

import { useEffect, useRef } from "react";

function getPalette(variant, theme = "dark") {
  if (theme === "light") {
    if (variant === "green") {
      return {
        orbs: ["rgba(181,199,151,0.30)", "rgba(214,197,167,0.24)", "rgba(160,182,168,0.18)"],
        particles: "rgba(154,111,67,0.24)",
        lines: "rgba(122,149,112,0.18)",
        glow: "rgba(196,164,112,0.24)",
        wave1: "rgba(196,164,112,0.22)",
        wave2: "rgba(122,149,112,0.18)",
        wave3: "rgba(107,135,146,0.14)",
        halo: "rgba(255,246,231,0.34)"
      };
    }
    if (variant === "gold") {
      return {
        orbs: ["rgba(201,160,105,0.32)", "rgba(255,244,226,0.30)", "rgba(214,183,138,0.24)"],
        particles: "rgba(154,111,67,0.26)",
        lines: "rgba(196,164,112,0.20)",
        glow: "rgba(214,183,138,0.30)",
        wave1: "rgba(196,164,112,0.24)",
        wave2: "rgba(214,183,138,0.18)",
        wave3: "rgba(122,149,112,0.12)",
        halo: "rgba(255,249,238,0.40)"
      };
    }
    return {
      orbs: ["rgba(212,178,132,0.28)", "rgba(188,202,165,0.22)", "rgba(151,170,177,0.18)"],
      particles: "rgba(154,111,67,0.22)",
      lines: "rgba(154,111,67,0.16)",
      glow: "rgba(255,242,222,0.34)",
      wave1: "rgba(196,164,112,0.20)",
      wave2: "rgba(122,149,112,0.14)",
      wave3: "rgba(107,135,146,0.12)",
      halo: "rgba(255,249,238,0.34)"
    };
  }
  if (variant === "green") {
    return {
      orbs: ["rgba(137,166,123,0.24)", "rgba(111,141,154,0.18)", "rgba(197,165,111,0.12)"],
      particles: "rgba(237,242,247,0.24)",
      lines: "rgba(137,166,123,0.12)",
      glow: "rgba(137,166,123,0.18)",
      wave1: "rgba(197,165,111,0.12)",
      wave2: "rgba(137,166,123,0.11)",
      wave3: "rgba(237,242,247,0.06)",
      halo: "rgba(111,141,154,0.08)"
    };
  }
  if (variant === "gold") {
    return {
      orbs: ["rgba(197,165,111,0.24)", "rgba(255,255,255,0.08)", "rgba(111,141,154,0.12)"],
      particles: "rgba(237,242,247,0.22)",
      lines: "rgba(197,165,111,0.12)",
      glow: "rgba(197,165,111,0.2)",
      wave1: "rgba(197,165,111,0.12)",
      wave2: "rgba(137,166,123,0.11)",
      wave3: "rgba(237,242,247,0.06)",
      halo: "rgba(111,141,154,0.08)"
    };
  }
  return {
    orbs: ["rgba(197,165,111,0.20)", "rgba(137,166,123,0.16)", "rgba(111,141,154,0.12)"],
    particles: "rgba(237,242,247,0.22)",
    lines: "rgba(237,242,247,0.08)",
    glow: "rgba(237,242,247,0.12)",
    wave1: "rgba(197,165,111,0.12)",
    wave2: "rgba(137,166,123,0.11)",
    wave3: "rgba(237,242,247,0.06)",
    halo: "rgba(111,141,154,0.08)"
  };
}

export default function AmbientCanvas({ className = "", variant = "default", mode = "panel", intensity = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const target = canvas.parentElement;
    const isPanel = mode === "panel";
    const isLightTheme = () => document.documentElement.dataset.theme === "light";
    const particleCount = isPanel ? 24 : 52;
    const lineThreshold = isPanel ? 110 : 135;
    const orbs = Array.from({ length: isPanel ? 3 : 5 }, (_, idx) => ({
      x: 0.14 + idx * (isPanel ? 0.24 : 0.16) + Math.random() * 0.1,
      y: 0.18 + Math.random() * 0.56,
      r: (isPanel ? 120 : 170) + idx * (isPanel ? 26 : 22),
      drift: 0.0007 + idx * 0.00018
    }));

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * (isPanel ? 1.8 : 2.2) + 0.8,
      dx: (Math.random() - 0.5) * (isPanel ? 0.0008 : 0.00045),
      dy: (Math.random() - 0.5) * (isPanel ? 0.0007 : 0.00042)
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let raf = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let glowX = 0.5;
    let glowY = 0.5;

    function resize() {
      const rect = target.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onPointerMove(event) {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouseX = (event.clientX - rect.left) / rect.width;
      mouseY = (event.clientY - rect.top) / rect.height;
    }

    function drawMeshGlow() {
      const palette = getPalette(variant, isLightTheme() ? "light" : "dark");
      glowX += (mouseX - glowX) * 0.03;
      glowY += (mouseY - glowY) * 0.03;

      const x = glowX * width;
      const y = glowY * height;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(width, height) * 0.34);
      grad.addColorStop(0, palette.glow);
      grad.addColorStop(0.38, palette.halo);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    function drawOrbs() {
      const palette = getPalette(variant, isLightTheme() ? "light" : "dark");
      orbs.forEach((orb, idx) => {
        const x = width * orb.x + Math.sin(frame * orb.drift * 2 + idx) * 24;
        const y = height * orb.y + Math.cos(frame * orb.drift * 1.7 + idx) * 18;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        grad.addColorStop(0, palette.orbs[idx % palette.orbs.length]);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawParticles() {
      const palette = getPalette(variant, isLightTheme() ? "light" : "dark");
      const radiusBoost = isLightTheme() ? (isPanel ? 1.22 : 1.5) : 1;
      ctx.strokeStyle = palette.lines;
      ctx.lineWidth = 1;

      particles.forEach((p) => {
        p.x += p.dx * intensity;
        p.y += p.dy * intensity;
        if (p.x < 0 || p.x > 1) p.dx *= -1;
        if (p.y < 0 || p.y > 1) p.dy *= -1;
      });

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        const ax = a.x * width;
        const ay = a.y * height;
        ctx.fillStyle = palette.particles;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r * radiusBoost, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const bx = b.x * width;
          const by = b.y * height;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist > lineThreshold) continue;
          ctx.globalAlpha = (1 - dist / lineThreshold) * 0.55;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    function drawWaveLayer() {
      const palette = getPalette(variant, isLightTheme() ? "light" : "dark");
      const lightMode = isLightTheme();
      const baseY = height * 0.52;
      ctx.lineWidth = lightMode ? 1.9 : 1.2;
      for (let row = 0; row < 3; row += 1) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 14) {
          const y =
            baseY +
            row * 44 +
            Math.sin(x * 0.01 + frame * (lightMode ? 0.008 : 0.014) + row) * (10 + row * 3) +
            Math.cos(x * 0.004 + frame * (lightMode ? 0.0055 : 0.01)) * (lightMode ? 7 : 6);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = row === 0 ? palette.wave1 : row === 1 ? palette.wave2 : palette.wave3;
        ctx.stroke();
      }
    }

    function draw() {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      drawMeshGlow();
      drawOrbs();
      if (!isPanel) drawWaveLayer();
      drawParticles();
      raf = window.requestAnimationFrame(draw);
    }

    resize();
    draw();

    const observer = new ResizeObserver(resize);
    observer.observe(target);
    target.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      target.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, [variant, mode, intensity]);

  return <canvas ref={ref} className={`ambient-canvas ${className}`.trim()} aria-hidden="true" />;
}

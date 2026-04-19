/* ============================================================
   MICHELL DESIGN — animations.js
   Incluye: cursor, reveal, navbar, cotizador, reseñas/estrellas
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     1. CURSOR PERSONALIZADO
  ================================================ */
  const cursor = document.getElementById("cursor");
  const follower = document.getElementById("cursorFollower");
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  // Suavizado del follower
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + "px";
    follower.style.top  = followerY + "px";
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Efecto al hacer hover en links/botones
  const hoverTargets = document.querySelectorAll("a, button, .cotizador__opcion, .estrella-form, input[type=range], label");
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1.8)";
      follower.style.transform = "translate(-50%,-50%) scale(1.4)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1)";
      follower.style.transform = "translate(-50%,-50%) scale(1)";
    });
  });


  /* ================================================
     2. NAVBAR — scroll
  ================================================ */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });


  /* ================================================
     3. MENÚ MÓVIL
  ================================================ */
  const menuBtn    = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuBtn.classList.remove("open");
      mobileMenu.classList.remove("open");
      document.body.style.overflow = "";
    });
  });


  /* ================================================
     4. REVEAL ON SCROLL (Intersection Observer)
  ================================================ */
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));


  /* ================================================
     5. CONTADOR DE STATS EN HERO
  ================================================ */
  const statNums = document.querySelectorAll(".hero__stat-num");
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNums.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count"), 10);
        animateCount(el, 0, target, 1200);
      });
    }
  }, { threshold: 0.5 });

  if (statNums.length) statsObserver.observe(statNums[0].closest(".hero__stats"));

  function animateCount(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.round(from + (to - from) * ease);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  /* ================================================
     6. COTIZADOR
  ================================================ */
  // Precios base por m²
  const PRECIOS = {
    planos:    { base: 15, plantas: { "1": 1, "2": 1.4 } },
    renders:   { base: 22, plantas: { "1": 1, "2": 1.45 } },
    completo:  { base: 35, plantas: { "1": 1, "2": 1.5  } },
  };
  const MIN_PRECIO = { planos: 1800, renders: 2500, completo: 3500 };

  let estado = {
    tipo: "planos",
    plantas: "1",
    m2: 100,
    extras: { instalaciones: false, estructura: false, urgente: false },
  };

  const precioEl = document.getElementById("precioEstimado");
  const m2Slider = document.getElementById("m2Slider");
  const m2Display = document.getElementById("m2Display");

  function calcularPrecio() {
    if (!precioEl) return;
    const p = PRECIOS[estado.tipo];
    let precio = estado.m2 * p.base * p.plantas[estado.plantas];
    precio = Math.max(precio, MIN_PRECIO[estado.tipo]);

    if (estado.extras.instalaciones) precio += 800;
    if (estado.extras.estructura)    precio += 600;
    if (estado.extras.urgente)       precio *= 1.3;

    // Animación del precio
    const current = parseInt(precioEl.textContent.replace(/\D/g, ""), 10) || 0;
    animatePrecio(current, Math.round(precio));
  }

  function animatePrecio(from, to) {
    const duration = 400;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const val = Math.round(from + (to - from) * p);
      precioEl.textContent = "$" + val.toLocaleString("es-MX");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Botones tipo servicio
  document.querySelectorAll(".cotizador__opcion[data-tipo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cotizador__opcion[data-tipo]").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      estado.tipo = btn.getAttribute("data-tipo");
      calcularPrecio();
    });
  });

  // Botones plantas
  document.querySelectorAll(".cotizador__opcion[data-plantas]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cotizador__opcion[data-plantas]").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      estado.plantas = btn.getAttribute("data-plantas");
      calcularPrecio();
    });
  });

  // Slider m²
  if (m2Slider) {
    m2Slider.addEventListener("input", () => {
      estado.m2 = parseInt(m2Slider.value, 10);
      m2Display.textContent = estado.m2 + " m²";
      calcularPrecio();
    });
  }

  // Checkboxes extras
  document.querySelectorAll(".cotizador__check input").forEach((cb) => {
    cb.addEventListener("change", () => {
      estado.extras[cb.getAttribute("data-extra")] = cb.checked;
      calcularPrecio();
    });
  });

  calcularPrecio(); // Precio inicial


  /* ================================================
     7. RESEÑAS — Estrellas interactivas + formulario
  ================================================ */
  const estrellasForm = document.querySelectorAll(".estrella-form");
  let calificacion = 0;

  estrellasForm.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.getAttribute("data-val"), 10);
      estrellasForm.forEach((s, i) => {
        s.classList.toggle("hover", i < val);
        s.classList.remove("activo");
      });
    });

    star.addEventListener("mouseleave", () => {
      estrellasForm.forEach((s) => s.classList.remove("hover"));
      // Restaurar estado activo
      estrellasForm.forEach((s, i) => {
        s.classList.toggle("activo", i < calificacion);
      });
    });

    star.addEventListener("click", () => {
      calificacion = parseInt(star.getAttribute("data-val"), 10);
      estrellasForm.forEach((s, i) => {
        s.classList.toggle("activo", i < calificacion);
        if (i < calificacion) {
          // Animación bounce con delay escalonado
          s.classList.remove("bounce");
          void s.offsetWidth; // force reflow
          setTimeout(() => s.classList.add("bounce"), i * 60);
        }
      });
    });
  });

  // Contador de caracteres
  const resenaText  = document.getElementById("resenaText");
  const charCount   = document.getElementById("charCount");
  if (resenaText) {
    resenaText.addEventListener("input", () => {
      charCount.textContent = resenaText.value.length + " / 300";
    });
  }

  // Enviar reseña
  const enviarBtn = document.getElementById("enviarResena");
  const formMsg   = document.getElementById("formMsg");
  const resenaName = document.getElementById("resenaName");
  const resenasList = document.getElementById("resenasList");
  const totalResenas = document.getElementById("totalResenas");
  const promedioNum  = document.getElementById("promedioNum");

  let resenas = [
    { nombre: "Juan Ramírez", texto: "Excelente trabajo, los planos quedaron muy bien detallados y el render superó mis expectativas. Muy puntual con los tiempos de entrega.", cal: 5 },
    { nombre: "María López",  texto: "Muy profesional y con mucho talento. Me ayudó a visualizar mi casa antes de construir. Recomiendo totalmente el servicio.", cal: 4.5 },
    { nombre: "Carlos Acosta", texto: "Solicité los planos y fachada de mi proyecto. Todo impecable, muy detallado y con excelente comunicación durante el proceso.", cal: 5 },
  ];

  function actualizarPromedio() {
    const suma = resenas.reduce((a, r) => a + r.cal, 0);
    const prom = (suma / resenas.length).toFixed(1);
    if (promedioNum)  promedioNum.textContent = prom;
    if (totalResenas) totalResenas.textContent = resenas.length;
  }

  function crearIniciales(nombre) {
    return nombre.trim().split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  function crearEstrellasHTML(cal) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(cal)) html += `<span class="estrella activo">★</span>`;
      else if (i - cal < 1)      html += `<span class="estrella medio">★</span>`;
      else                        html += `<span class="estrella">★</span>`;
    }
    return html;
  }

  if (enviarBtn) {
    enviarBtn.addEventListener("click", () => {
      const nombre = resenaName ? resenaName.value.trim() : "";
      const texto  = resenaText  ? resenaText.value.trim()  : "";
      formMsg.className = "resena__form-msg";
      formMsg.textContent = "";

      if (!calificacion) {
        formMsg.textContent = "Por favor selecciona una calificación.";
        formMsg.classList.add("err");
        return;
      }
      if (!nombre) {
        formMsg.textContent = "Por favor ingresa tu nombre.";
        formMsg.classList.add("err");
        return;
      }
      if (texto.length < 10) {
        formMsg.textContent = "Tu reseña debe tener al menos 10 caracteres.";
        formMsg.classList.add("err");
        return;
      }

      // Añadir reseña a la lista
      resenas.push({ nombre, texto, cal: calificacion });
      actualizarPromedio();

      const tarjeta = document.createElement("div");
      tarjeta.className = "resena__tarjeta";
      tarjeta.style.animationDelay = "0s";
      tarjeta.innerHTML = `
        <div class="resena__header">
          <div class="resena__avatar">${crearIniciales(nombre)}</div>
          <div>
            <p class="resena__nombre">${escapeHtml(nombre)}</p>
            <div class="resena__estrellas">${crearEstrellasHTML(calificacion)}</div>
          </div>
          <span class="resena__fecha">Ahora mismo</span>
        </div>
        <p class="resena__texto">${escapeHtml(texto)}</p>
      `;
      resenasList.appendChild(tarjeta);

      // Scroll suave a la nueva tarjeta
      setTimeout(() => tarjeta.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);

      // Limpiar formulario
      resenaName.value = "";
      resenaText.value = "";
      charCount.textContent = "0 / 300";
      calificacion = 0;
      estrellasForm.forEach((s) => { s.classList.remove("activo", "hover", "bounce"); });

      formMsg.textContent = "¡Gracias por tu reseña! 🎉";
      formMsg.classList.add("ok");
      setTimeout(() => { formMsg.textContent = ""; }, 4000);
    });
  }


  /* ================================================
     8. ANIMACIÓN DE LÍNEAS DE FONDO AL MOVER MOUSE
  ================================================ */
  const heroBgLines = document.querySelector(".hero__bg-lines");
  if (heroBgLines) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroBgLines.style.transform = `translate(${x}px, ${y}px)`;
    });
  }


  /* ================================================
     9. SMOOTH SCROLL ACTIVO EN LINKS DE NAV
  ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });


  /* ================================================
     UTILIDADES
  ================================================ */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

});

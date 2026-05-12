gsap.registerPlugin(SplitText);

const loaderContainer = document.querySelector("#lottie-loader");
const loaderScreen = document.querySelector("#loader-screen");
const mainContent = document.querySelector("#main-content");
const transitionPanel = document.querySelector(".transition-panel");

// Nouvelle animation Lottie de fond
const backgroundLottieContainer = document.querySelector("#background-lottie");

let contentIsShown = false;

// Chargement de l’animation Lottie du loader
const loaderAnimation = lottie.loadAnimation({
  container: loaderContainer,
  renderer: "svg",
  loop: 1,                 // Nombre de lectures de l’animation
  autoplay: true,
  path: "logo.json"
});

// Vitesse de l'animation du loader
// 1 = vitesse normale
loaderAnimation.setSpeed(1.4);

// Chargement de l’animation Lottie de fond
const backgroundAnimation = lottie.loadAnimation({
  container: backgroundLottieContainer,
  renderer: "svg",
  loop: 1,
  autoplay: false,         // Elle démarrera seulement au moment où le contenu apparaît
  path: "logo-slide01.json"
});

// Vitesse de l’animation de fond
backgroundAnimation.setSpeed(1);

// État initial de l’animation de fond
gsap.set(backgroundLottieContainer, {
  xPercent: -50,
  yPercent: -50,
  scale: 1.15,
  autoAlpha: 0
});

// Fonction appelée quand Lottie est terminée
function showContent() {
  if (contentIsShown) return;
  contentIsShown = true;

  // On attend que les polices soient prêtes avant de découper le texte.
  // C’est important pour que SplitText calcule correctement les lignes.
  document.fonts.ready.then(() => {
    revealPage();
  });
}

// Timeline principale GSAP
function revealPage() {
  // SplitText découpe le titre en lignes et mots.
  // mask: "lines" crée un masque pour chaque ligne,
  // ce qui permet une apparition verticale propre.
  const splitTitle = SplitText.create(".split", {
    type: "words, lines",
    linesClass: "line",
    mask: "lines",
    autoSplit: true
  });

  const tl = gsap.timeline({
    defaults: {
      ease: "power4.inOut"
    },
    onComplete: () => {
      // Nettoyage après la transition
      loaderAnimation.destroy();
      loaderScreen.remove();
      transitionPanel.remove();

      // Le contenu devient réellement disponible
      mainContent.setAttribute("aria-busy", "false");
      mainContent.removeAttribute("inert");

      // On réactive le scroll
      document.body.style.overflow = "";
    }
  });

  tl
    // 1. Le Lottie principal sort par le haut de l’écran
    .to(loaderContainer, {
      y: "-120vh",
      scale: 0.75,
      opacity: 0,
      duration: 0.7,
      ease: "expo.in"
    })

    // 2. Le texte de chargement disparaît en même temps
    .to(".loader-text", {
      y: -24,
      opacity: 0,
      duration: 0.35,
      ease: "expo.in"
    }, "<")

    // 3. Le panneau monte et recouvre l’écran plus rapidement
    .to(transitionPanel, {
      yPercent: -100,
      duration: 0.5,
      ease: "expo.in"
    }, "-=0.25")

    // 4. Le loader screen disparaît pendant le passage du panneau
    .to(loaderScreen, {
      opacity: 0,
      duration: 0.2
    }, "-=0.35")

    // 5. On rend le contenu visible derrière le panneau
    .set(mainContent, {
      autoAlpha: 1
    })

    // 6. On lance la Lottie de fond
    .call(() => {
      backgroundAnimation.play();
    })

    // 7. Apparition douce de la Lottie de fond
    .fromTo(backgroundLottieContainer,
      {
        scale: 1.15,
        autoAlpha: 0
      },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.4,
        ease: "expo.out"
      },
      "<"
    )

    // 8. Le panneau quitte l’écran vers le haut
    .to(transitionPanel, {
      yPercent: -200,
      duration: 0.8,
      ease: "expo.inOut"
    })

    // 9. Apparition du petit label
    .fromTo(".eyebrow",
      {
        y: 24,
        opacity: 0
      },
      {
        y: 0,
        opacity: 0.75,
        duration: 0.6,
        ease: "expo.out"
      },
      "-=0.25"
    )

    // 10. Apparition du titre ligne par ligne
    .set(".split", {
      opacity: 1
    }, "<")

    .from(splitTitle.lines, {
      yPercent: 100,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "expo.out"
    }, "<")

    // 11. Apparition du paragraphe
    .fromTo(".hero-text",
      {
        y: 32,
        opacity: 0
      },
      {
        y: 0,
        opacity: 0.8,
        duration: 0.8,
        ease: "expo.out"
      },
      "-=0.45"
    );
}

// Quand l’animation Lottie du loader arrive à sa fin
loaderAnimation.addEventListener("complete", showContent);

// En cas d’erreur, on révèle quand même le contenu
loaderAnimation.addEventListener("data_failed", showContent);
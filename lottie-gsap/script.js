gsap.registerPlugin(SplitText);

const loaderContainer = document.querySelector("#lottie-loader");
const loaderScreen = document.querySelector("#loader-screen");
const mainContent = document.querySelector("#main-content");
const transitionPanel = document.querySelector(".transition-panel");

let contentIsShown = false;

// Chargement de l’animation Lottie
const loaderAnimation = lottie.loadAnimation({
  container: loaderContainer,
  renderer: "svg",
  loop: 1,                 // L’animation est jouée 2 fois
  autoplay: true,
  path: "../animation.json"
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
    // 1. Petit impact sur le loader
.to(loaderContainer, {
  y: "-120vh",          // Le Lottie sort complètement par le haut
  scale: 0.85,          // Optionnel : il rétrécit légèrement en sortant
  opacity: 0,
  duration: 0.9,
  ease: "expo.in"
})

    // 2. Disparition brutale du texte de chargement
    .to(".loader-text", {
      y: -24,
      opacity: 0,
      duration: 0.35
    }, "<")

    // 3. Le panneau blanc monte et recouvre l’écran
    .to(transitionPanel, {
      yPercent: -100,
      duration: 0.8,
      ease: "expo.inOut"
    }, "-=0.1")

    // 4. Le loader disparaît pendant le passage du panneau
    .to(loaderScreen, {
      opacity: 0,
      duration: 0.2
    }, "-=0.35")

    // 5. On rend le contenu visible derrière le panneau
    .set(mainContent, {
      autoAlpha: 1
    })

    // 6. Le panneau quitte l’écran vers le haut
    .to(transitionPanel, {
      yPercent: -200,
      duration: 0.9,
      ease: "expo.inOut"
    })

    // 7. Apparition du petit label
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

    // 8. Apparition du titre ligne par ligne
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

    // 9. Apparition du paragraphe
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

// Quand l’animation Lottie arrive à sa fin
loaderAnimation.addEventListener("complete", showContent);

// En cas d’erreur, on révèle quand même le contenu
loaderAnimation.addEventListener("data_failed", showContent);
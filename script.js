const loaderContainer = document.querySelector("#lottie-loader");
const mainContent = document.querySelector("#main-content");
const loaderScreen = document.querySelector("#loader-screen");

const loaderAnimation = lottie.loadAnimation({
  container: loaderContainer,
  renderer: "svg",
  loop: 2,               // L’animation sera jouée 2 fois
  autoplay: true,
  path: "animation.json"
});

// Sécurité pour éviter d’appeler showContent plusieurs fois
let contentIsShown = false;

// Fonction appelée quand l’animation est terminée
function showContent() {
  if (contentIsShown) return;
  contentIsShown = true;

  // On indique que le contenu principal est prêt
  mainContent.setAttribute("aria-busy", "false");

  // Quand la transition CSS du loader est terminée,
  // on détruit l’animation et on retire le loader du DOM
  loaderScreen.addEventListener("transitionend", () => {
    loaderAnimation.destroy();
    loaderScreen.remove();
  }, { once: true });

  // On change l’état global de la page
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
}

// Quand l’animation Lottie arrive à sa fin
loaderAnimation.addEventListener("complete", showContent);

// En cas d’erreur de chargement du JSON,
// on affiche quand même le contenu
loaderAnimation.addEventListener("data_failed", showContent);
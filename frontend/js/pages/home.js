bbRenderNavigation("#bb-nav", "home");
bbRenderFooter("#bb-footer");
bbRenderHeroCarousel("#bb-hero");

const bbHomePetsEl = document.getElementById("bb-home-pets");

async function bbLoadHomePets() {
  if (!bbHomePetsEl) return;
  bbHomePetsEl.innerHTML = typeof bbSkeletonGridHtml === "function" ? bbSkeletonGridHtml(4) : "Carregando animais...";
  try {
    const list = await animalService.list({ tipo_servico: "ADOCAO" });
    const pets = Array.isArray(list) ? list.slice(0, 4) : [];
    if (pets.length === 0) {
      bbHomePetsEl.innerHTML = bbStateHtml({
        title: "Nenhum animal disponível para adoção no momento.",
        description: "Que tal anunciar um pet e ajudar a encontrar um lar?",
      });
      return;
    }
    bbHomePetsEl.innerHTML = pets.map(bbAnimalCardHtml).join("");
  } catch (err) {
    bbHomePetsEl.innerHTML = bbStateHtml({
      title: "Não foi possível carregar os animais.",
      description: err.message,
      isError: true,
    });
  }
}

function bbCheckSessionExpiredNotice() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("session") === "expired") {
    const banner = document.createElement("div");
    banner.className =
      "bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-between";
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span>Sua sessão expirou por inatividade. Você pode continuar navegando ou entrar novamente quando quiser.</span>
      </div>
      <button type="button" class="text-amber-300 hover:text-white text-xs font-bold uppercase tracking-wider ml-4" onclick="this.parentElement.remove()">✕</button>
    `;
    const container = document.querySelector(".bb-container");
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

bbCheckSessionExpiredNotice();
bbLoadHomePets();


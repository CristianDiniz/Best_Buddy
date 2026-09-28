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

bbLoadHomePets();

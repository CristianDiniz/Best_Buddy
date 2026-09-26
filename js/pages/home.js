bbRenderNavigation("#bb-nav", "home");
bbRenderFooter("#bb-footer");
bbRenderHeroCarousel("#bb-hero");

const bbNewsEl = document.getElementById("bb-news");

async function bbLoadNews() {
  bbNewsEl.innerHTML = typeof bbLoadingHtml !== "undefined" ? bbLoadingHtml : "Carregando notícias...";
  try {
    const news = await communityService.listNews();
    if (news.length === 0) {
      bbNewsEl.innerHTML = bbStateHtml({ title: "Nenhuma novidade por aqui ainda.", description: "" });
      return;
    }
    bbNewsEl.innerHTML = `<div class="flex flex-col gap-3 bb-stagger">${news
      .map(
        (item) => `
        <div class="bb-card animate-fade-in-up flex gap-3 items-start">
          <span class="text-xl mt-0.5">📰</span>
          <div>
            <strong class="text-ink-100">${item.titulo}</strong>
            <p class="text-ink-300 mt-1 mb-0">${item.resumo || item.conteudo || ""}</p>
          </div>
        </div>`
      )
      .join("")}</div>`;
  } catch (err) {
    bbNewsEl.innerHTML = bbStateHtml({ title: "Não foi possível carregar as notícias.", description: err.message, isError: true });
  }
}

bbLoadNews();

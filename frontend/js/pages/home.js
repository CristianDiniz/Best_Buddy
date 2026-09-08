bbRenderNavigation("#bb-nav", "home");
bbRenderFooter("#bb-footer");
bbRenderHeroCarousel("#bb-hero");

const bbNewsEl = document.getElementById("bb-news");
const bbPostsEl = document.getElementById("bb-posts");

async function bbLoadNews() {
  bbNewsEl.innerHTML = bbLoadingHtml;
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
            <p class="text-ink-300 mt-1 mb-0">${item.resumo}</p>
          </div>
        </div>`
      )
      .join("")}</div>`;
  } catch (err) {
    bbNewsEl.innerHTML = bbStateHtml({ title: "Não foi possível carregar as notícias.", description: err.message, isError: true });
  }
}

async function bbLoadPosts() {
  bbPostsEl.innerHTML = bbSkeletonGridHtml(4);
  try {
    const posts = await communityService.listPosts();
    if (posts.length === 0) {
      bbPostsEl.innerHTML = bbStateHtml({ title: "Ainda não há posts da comunidade.", description: "Seja o primeiro a compartilhar algo!" });
      return;
    }
    bbPostsEl.innerHTML = posts.map(bbPostCardHtml).join("");
  } catch (err) {
    bbPostsEl.innerHTML = bbStateHtml({ title: "Não foi possível carregar os posts.", description: err.message, isError: true });
  }
}

bbLoadNews();
bbLoadPosts();

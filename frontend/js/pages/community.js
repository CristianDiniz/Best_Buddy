bbRenderNavigation("#bb-nav", "community");
bbRenderFooter("#bb-footer");

const bbPostsEl = document.getElementById("bb-posts");
const bbMissingEl = document.getElementById("bb-missing");

async function bbLoadPosts() {
  bbPostsEl.innerHTML = bbSkeletonGridHtml(4);
  try {
    const posts = await communityService.listPosts();
    bbPostsEl.innerHTML = posts.length
      ? posts.map(bbPostCardHtml).join("")
      : bbStateHtml({ title: "Ainda não há posts da comunidade." });
  } catch (err) {
    bbPostsEl.innerHTML = bbStateHtml({ title: "Erro ao carregar posts.", description: err.message, isError: true });
  }
}

async function bbLoadMissing() {
  bbMissingEl.innerHTML = bbSkeletonGridHtml(3);
  try {
    const missing = await communityService.listMissingAnimals();
    bbMissingEl.innerHTML = missing.length
      ? missing.map(bbMissingAnimalCardHtml).join("")
      : bbStateHtml({ title: "Nenhum animal desaparecido reportado.", description: "Boas notícias!" });
  } catch (err) {
    bbMissingEl.innerHTML = bbStateHtml({ title: "Erro ao carregar desaparecidos.", description: err.message, isError: true });
  }
}

document.getElementById("bb-report-btn").addEventListener("click", async () => {
  const nome = prompt("Nome do animal:");
  if (!nome) return;
  const local = prompt("Onde foi visto por último?") || "";
  const contato = prompt("Seu contato:") || "";
  const descricao = prompt("Descreva o animal:") || "";

  try {
    await communityService.reportMissingAnimal({ nome, local, contato, descricao });
    bbLoadMissing();
  } catch (err) {
    alert(`Não foi possível registrar: ${err.message}`);
  }
});

bbLoadPosts();
bbLoadMissing();

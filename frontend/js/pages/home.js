if (typeof bbRenderNavigation === "function") {
  bbRenderNavigation("#bb-nav", "home");
}
if (typeof bbRenderFooter === "function") {
  bbRenderFooter("#bb-footer");
}
if (typeof bbRenderHeroCarousel === "function") {
  bbRenderHeroCarousel("#bb-hero");
}

const bbHomeFiltersEl = document.getElementById("bb-home-filters");
const bbHomePetsAdoptEl = document.getElementById("bb-home-pets-adopt");
const bbHomePetsLostEl = document.getElementById("bb-home-pets-lost");
const bbHomePetsAdoptedEl = document.getElementById("bb-home-pets-adopted");

let allHomePets = [];
let activeHomeFilter = "ALL";

function renderSectionCards(containerEl, petsList, emptyIcon, emptyTitle, emptyDesc) {
  if (!containerEl) return;

  if (petsList.length === 0) {
    containerEl.innerHTML = `
      <div class="col-span-full py-8 px-6 text-center text-slate-500 bg-white border border-slate-200/80 rounded-2xl w-full">
        <span class="text-2xl block mb-1">${emptyIcon}</span>
        <p class="font-semibold text-slate-700 text-sm">${emptyTitle}</p>
        <p class="text-xs text-slate-400 mt-0.5">${emptyDesc}</p>
      </div>
    `;
    return;
  }

  containerEl.innerHTML = petsList.map(bbAnimalCardHtml).join("");
}

function renderHomePets() {
  if (!allHomePets) return;

  // Filtro por espécie (Todos, Cães, Gatos)
  let filtered = allHomePets;
  if (activeHomeFilter !== "ALL") {
    filtered = allHomePets.filter(
      (pet) => (pet.tipo_animal || "").toUpperCase() === activeHomeFilter.toUpperCase()
    );
  }

  // 1. Categoria: Animais para Adoção (máximo 5 mais recentes)
  const adocaoPets = filtered.filter((pet) => {
    const servico = (pet.tipo_servico || "ADOCAO").toUpperCase();
    const status = (pet.status || "").toUpperCase();
    return servico === "ADOCAO" && status !== "ADOTADO" && status !== "ENCONTRADO";
  });
  const displayAdocao = adocaoPets.slice(0, 5);

  // 2. Categoria: Animais Desaparecidos (máximo 5 mais recentes)
  const perdidosPets = filtered.filter((pet) => {
    const servico = (pet.tipo_servico || "").toUpperCase();
    const status = (pet.status || "").toUpperCase();
    return (
      (servico === "PERDIDO" || servico === "ENCONTRO" || status === "PERDIDO") &&
      status !== "ENCONTRADO" &&
      status !== "ADOTADO"
    );
  });
  const displayPerdidos = perdidosPets.slice(0, 5);

    // 3. Categoria: Animais Já Adotados / Concluídos (máximo 5 mais recentes)
    const adotadosPets = filtered.filter((pet) => {
      const status = (pet.status || "").toUpperCase();
      return status === "ADOTADO" || status === "ENCONTRADO";
    });
    const displayAdotados = adotadosPets.slice(0, 5);

            // Renderiza cada faixa/carrossel
            renderSectionCards(
              bbHomePetsAdoptEl,
              displayAdocao,
              "🐾",
              "Nenhum pet para adoção encontrado para esta categoria.",
              "Que tal anunciar um pet e ajudar a encontrar um lar?"
            );

            renderSectionCards(
              bbHomePetsLostEl,
              displayPerdidos,
              "🎉",
              "Nenhum animal desaparecido registrado nesta categoria.",
              "Todos os pets conhecidos estão seguros e com suas famílias!"
            );

            renderSectionCards(
              bbHomePetsAdoptedEl,
              displayAdotados,
              "💙",
              "Nenhum pet marcado como adotado nesta visualização ainda.",
              "Assim que um companheiro encontrar seu novo lar, ele aparecerá aqui comemorando seu final feliz!"
            );

            attachCardEvents();
          }

          function attachCardEvents() {
            const containers = [bbHomePetsAdoptEl, bbHomePetsLostEl, bbHomePetsAdoptedEl].filter(Boolean);

            containers.forEach((container) => {
              // Clique no card redireciona para a página de detalhes
              container.querySelectorAll(".bb-pet-card, .bb-animal-card").forEach((card) => {
                card.addEventListener("click", (e) => {
                  if (
                    e.target.closest("button") ||
                    e.target.closest("a") ||
                    e.target.closest(".bb-owner-actions")
                  ) {
                    return;
                  }
        const petId = card.getAttribute("data-card-id");
                if (petId) {
                  window.location.href = `/pages/animals/detail.html?id=${petId}`;
                }
              });
            });

          // Ações do dono: Excluir anúncio
          container.querySelectorAll(".btn-delete-animal").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const id = btn.getAttribute("data-id");
              if (confirm("Tem certeza que deseja excluir este anúncio?")) {
                try {
                  await animalService.remove(id);
                  allHomePets = allHomePets.filter((p) => String(p.id) !== String(id));
                  renderHomePets();
                } catch (err) {
                  alert("Erro ao excluir: " + err.message);
                }
              }
            });
          });

            // Ações do dono: Editar anúncio
            container.querySelectorAll(".btn-edit-animal").forEach((btn) => {
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                if (window.bbOpenEditModal) {
                  window.bbOpenEditModal(id);
                } else {
                  window.location.href = `/pages/animals/index.html?edit=${id}`;
                }
              });
            });

              // Ações do dono: Concluir anúncio (Marcar Adotado / Encontrado)
              container.querySelectorAll(".btn-finish-animal").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                  e.stopPropagation();
                  const id = btn.getAttribute("data-id");
                  const targetStatus = btn.getAttribute("data-status") || "ADOTADO";
                  const isPerdido = targetStatus === "ENCONTRADO";
                  const confirmMsg = isPerdido
                    ? "Deseja marcar este pet como ENCONTRADO? O anúncio será dado como concluído."
                    : "Deseja marcar este pet como ADOTADO? Ele passará para a categoria de adotados e somará no contador!";
                  if (!confirm(confirmMsg)) return;

                      btn.disabled = true;
                      try {
                        await animalService.update(id, { status: targetStatus });

                        // Atualiza o pet em memória para o novo status
                        const idx = allHomePets.findIndex((item) => String(item.id) === String(id));
                        if (idx !== -1) {
                          allHomePets[idx].status = targetStatus;
                        }
                        renderHomePets();

                        if (targetStatus === "ADOTADO") {
                          const adoptedCountEl = document.getElementById("bb-home-adopted-count");
                          if (adoptedCountEl) {
                            const current = parseInt(adoptedCountEl.textContent, 10) || 0;
                            adoptedCountEl.textContent = current + 1;
                            adoptedCountEl.classList.add("scale-125", "transition-transform", "duration-300");
                            setTimeout(() => adoptedCountEl.classList.remove("scale-125"), 600);
                          }
                        }
                      } catch (err) {
                        alert("Erro ao atualizar status: " + err.message);
                        btn.disabled = false;
                      }
                  });
              });
            });
        }

function setupFilterEvents() {
            if (!bbHomeFiltersEl) return;

            const buttons = bbHomeFiltersEl.querySelectorAll(".bb-filter-pill");
            buttons.forEach((btn) => {
              btn.addEventListener("click", () => {
                const filter = btn.getAttribute("data-filter") || "ALL";
                activeHomeFilter = filter;

                buttons.forEach((b) => {
                  b.classList.remove(
                    "bg-[#2f80ed]",
                    "bg-brand-500",
                    "text-white",
                    "shadow-sm",
                    "active"
                  );
                  b.classList.add(
                    "bg-white",
                    "border",
                    "border-border",
                    "text-ink-300"
                  );
                });

                btn.classList.remove("bg-white", "border", "border-border", "text-ink-300");
                btn.classList.add("bg-[#2f80ed]", "text-white", "shadow-sm", "active");

                renderHomePets();
              });
            });
          }

async function bbLoadHomePets() {
            try {
              const [list, stats] = await Promise.all([
                animalService.list(),
                animalService.getStats().catch(() => null),
              ]);

              const rawList = Array.isArray(list) ? list : [];
              // Ordena por data decrescente ou id decrescente para garantir mais recentes primeiro
              allHomePets = rawList.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
                const dateB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
                return dateB - dateA;
              });

              renderHomePets();

              const adoptedCountEl = document.getElementById("bb-home-adopted-count");
              if (adoptedCountEl && stats && typeof stats.total_adotados === "number") {
                adoptedCountEl.textContent = stats.total_adotados;
              }
            } catch (err) {
    const errorHtml = `
                < div class="col-span-full py-10 text-center text-danger" >
        <p class="font-bold text-sm">Não foi possível carregar os animais.</p>
        <p class="text-xs text-ink-300 mt-1">${err.message}</p>
      </div >
                `;
    if (bbHomePetsAdoptEl) bbHomePetsAdoptEl.innerHTML = errorHtml;
    if (bbHomePetsLostEl) bbHomePetsLostEl.innerHTML = "";
    if (bbHomePetsAdoptedEl) bbHomePetsAdoptedEl.innerHTML = "";
  }
}

function bbCheckSessionExpiredNotice() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("session") === "expired") {
    const banner = document.createElement("div");
    banner.className =
      "bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-between";
    banner.innerHTML = `
                < div class="flex items-center gap-2" >
                  <span>Sua sessão expirou por inatividade. Você pode continuar navegando ou entrar novamente quando quiser.</span>
      </div >
                <button type="button" class="text-amber-700 hover:text-ink-100 text-xs font-bold uppercase tracking-wider ml-4 cursor-pointer" onclick="this.parentElement.remove()">&times;</button>
              `;
    const container = document.querySelector(".bb-container");
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

setupFilterEvents();
bbCheckSessionExpiredNotice();
bbLoadHomePets();

if (typeof bbRenderNavigation === "function") {
  bbRenderNavigation("#bb-nav", "home");
}
if (typeof bbRenderFooter === "function") {
  bbRenderFooter("#bb-footer");
}
if (typeof bbRenderHeroCarousel === "function") {
  bbRenderHeroCarousel("#bb-hero");
}

const bbHomePetsEl = document.getElementById("bb-home-pets");
const bbHomeFiltersEl = document.getElementById("bb-home-filters");

let allHomePets = [];
let activeHomeFilter = "ALL";

function renderHomePets() {
  if (!bbHomePetsEl) return;

  let filtered = allHomePets;
  if (activeHomeFilter !== "ALL") {
    filtered = allHomePets.filter(
      (pet) => (pet.tipo_animal || "").toUpperCase() === activeHomeFilter.toUpperCase()
    );
  }

  if (filtered.length === 0) {
    bbHomePetsEl.innerHTML = `
      <div class="col-span-full py-12 text-center text-ink-300 bg-white border border-border/80 rounded-2xl p-8">
        <h4 class="font-bold text-ink-100 text-base mb-1">Nenhum animal encontrado para esta categoria</h4>
        <p class="text-xs text-ink-300">Que tal anunciar um pet e ajudar a encontrar um lar?</p>
      </div>
    `;
    return;
  }

  // Exibe os animais (máx 10 para 2 linhas perfeitas de 5 cards)
  const displayPets = filtered.slice(0, 10);
  bbHomePetsEl.innerHTML = displayPets.map(bbAnimalCardHtml).join("");

  // Event listener para clique no card (redireciona para o detalhe)
  bbHomePetsEl.querySelectorAll(".bb-pet-card, .bb-animal-card").forEach((card) => {
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

  // Ações do dono (caso o usuário logado seja tutor de algum pet)
  bbHomePetsEl.querySelectorAll(".btn-delete-animal").forEach((btn) => {
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

  bbHomePetsEl.querySelectorAll(".btn-edit-animal").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      window.location.href = `/pages/animals/index.html?edit=${id}`;
    });
  });

  bbHomePetsEl.querySelectorAll(".btn-finish-animal").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const targetStatus = btn.getAttribute("data-status") || "ADOTADO";
      const isPerdido = targetStatus === "ENCONTRADO";
      const confirmMsg = isPerdido
        ? "Deseja marcar este pet como ENCONTRADO? O anúncio será dado como concluído."
        : "Deseja marcar este pet como ADOTADO? Ele sairá da lista de animais disponíveis e somará no contador de adotados.";
      if (!confirm(confirmMsg)) return;

      btn.disabled = true;
      try {
        await animalService.update(id, { status: targetStatus });
        // REGRA DE NEGÓCIO: animal adotado sai imediatamente da lista de animais!
        allHomePets = allHomePets.filter((item) => String(item.id) !== String(id));
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
  if (!bbHomePetsEl) return;
  bbHomePetsEl.innerHTML = typeof bbSkeletonGridHtml === "function" ? bbSkeletonGridHtml(5) : `
    <div class="col-span-full py-12 text-center text-ink-300">
      <div class="inline-block w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-xs">Carregando pets para adoção...</p>
    </div>
  `;

  try {
    const [list, stats] = await Promise.all([
      animalService.list({ tipo_servico: "ADOCAO", exclude_status: "ADOTADO" }),
      animalService.getStats().catch(() => null),
    ]);
    // REGRA DE NEGÓCIO: animais adotados saem da vitrine de pets esperando por um lar!
    const rawList = Array.isArray(list) ? list : [];
    allHomePets = rawList.filter((pet) => (pet.status || "").toUpperCase() !== "ADOTADO");
    renderHomePets();

    const adoptedCountEl = document.getElementById("bb-home-adopted-count");
    if (adoptedCountEl && stats && typeof stats.total_adotados === "number") {
      adoptedCountEl.textContent = stats.total_adotados;
    }
  } catch (err) {
    bbHomePetsEl.innerHTML = `
      <div class="col-span-full py-10 text-center text-danger">
        <p class="font-bold text-sm">Não foi possível carregar os animais.</p>
        <p class="text-xs text-ink-300 mt-1">${err.message}</p>
      </div>
    `;
  }
}

function bbCheckSessionExpiredNotice() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("session") === "expired") {
    const banner = document.createElement("div");
    banner.className = "bb-session-notice";
    banner.style = "background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;";
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; min-width: 250px; flex: 1;">
        <div style="width: 42px; height: 42px; min-width: 42px; border-radius: 10px; background: #fef3c7; border: 1px solid #fcd34d; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
          ⏱️
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 700; color: #92400e; margin: 0 0 2px 0; line-height: 1.3;">
            Sua sessão expirou por inatividade
          </h4>
          <p style="font-size: 12px; color: #b45309; margin: 0; line-height: 1.4;">
            Faça login novamente para gerenciar seus anúncios e acessar sua conta com segurança.
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: auto; flex-wrap: wrap;">
        <a href="/pages/auth/login.html" style="font-size: 12px; font-weight: 700; color: #ffffff; background: #d97706; padding: 8px 16px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); transition: background 0.15s ease;">
          <span>🔑</span> Fazer Login
        </a>
        <button type="button" onclick="this.closest('.bb-session-notice').remove()" title="Continuar navegando" style="font-size: 12px; font-weight: 600; color: #92400e; background: #ffffff; border: 1px solid #fcd34d; padding: 7px 12px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease;">
          Dispensar
        </button>
      </div>
    `;

    const container = document.querySelector("main.bb-main .bb-container") || document.querySelector("main .bb-container") || document.querySelector(".bb-container");
    if (container) {
      container.insertBefore(banner, container.firstChild);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

setupFilterEvents();
bbCheckSessionExpiredNotice();
bbLoadHomePets();

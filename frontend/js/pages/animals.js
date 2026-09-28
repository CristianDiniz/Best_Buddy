bbRenderNavigation("#bb-nav", "animals");
bbRenderFooter("#bb-footer");

// Elementos principais
const bbLostGridEl = document.getElementById("bb-lost-grid");
const bbAdoptGridEl = document.getElementById("bb-adopt-grid");
const bbLostCountEl = document.getElementById("bb-lost-count");
const bbAdoptCountEl = document.getElementById("bb-adopt-count");
const bbLostToggleWrapEl = document.getElementById("bb-lost-toggle-wrap");
const bbAdoptToggleWrapEl = document.getElementById("bb-adopt-toggle-wrap");
const bbLostToggleBtn = document.getElementById("bb-lost-toggle-btn");
const bbAdoptToggleBtn = document.getElementById("bb-adopt-toggle-btn");
const bbAnimalsAlertEl = document.getElementById("bb-animals-alert");

// Filtros e Abas
const tabAllPets = document.getElementById("tab-all-pets");
const tabMyPets = document.getElementById("tab-my-pets");
const filterCidadeInput = document.getElementById("filter-cidade");
const filterTipoAnimalSelect = document.getElementById("filter-tipo-animal");
const filterTempoSelect = document.getElementById("filter-tempo");
const filterApplyBtn = document.getElementById("filter-apply-btn");
const filterClearBtn = document.getElementById("filter-clear-btn");

// Modal
const announceBtn = document.getElementById("bb-announce-pet-btn");
const adoptModal = document.getElementById("adopt-modal");
const modalCloseBtn = document.getElementById("modal-adopt-close-btn");
const modalCancelBtn = document.getElementById("modal-adopt-cancel-btn");
const modalAlertEl = document.getElementById("modal-adopt-alert");
const formAdoptPet = document.getElementById("form-adopt-pet");
const modalSubmitBtn = document.getElementById("modal-adopt-submit-btn");

// Estado
const INITIAL_LIMIT = 4;
let allLostAnimals = [];
let allAdoptAnimals = [];
let lostExpanded = false;
let adoptExpanded = false;
let activeTab = "all"; // "all" | "my"
let filterCidade = "";
let filterTipoAnimal = "";
let filterTempo = "";

function renderLost() {
  bbLostCountEl.textContent = allLostAnimals.length;

  if (!allLostAnimals.length) {
    bbLostGridEl.innerHTML = bbStateHtml({
      title: "Nenhum animal desaparecido encontrado.",
      description: "Esperamos que todos estejam em segurança com suas famílias!",
    });
    bbLostToggleWrapEl.classList.add("hidden");
    return;
  }

  const items = lostExpanded ? allLostAnimals : allLostAnimals.slice(0, INITIAL_LIMIT);
  bbLostGridEl.innerHTML = items.map(bbAnimalCardHtml).join("");

  if (allLostAnimals.length > INITIAL_LIMIT) {
    bbLostToggleWrapEl.classList.remove("hidden");
    const remaining = allLostAnimals.length - INITIAL_LIMIT;
    bbLostToggleBtn.textContent = lostExpanded
      ? "Recolher vitrine de desaparecidos ↑"
      : `Ver mais animais perdidos (${remaining}) ↓`;
  } else {
    bbLostToggleWrapEl.classList.add("hidden");
  }
}

function renderAdopt() {
  bbAdoptCountEl.textContent = allAdoptAnimals.length;

  if (!allAdoptAnimals.length) {
    bbAdoptGridEl.innerHTML = bbStateHtml({
      title: "Nenhum animal para adoção encontrado.",
      description: "Tente ajustar ou limpar seus filtros para ver mais pets.",
    });
    bbAdoptToggleWrapEl.classList.add("hidden");
    return;
  }

  const items = adoptExpanded ? allAdoptAnimals : allAdoptAnimals.slice(0, INITIAL_LIMIT);
  bbAdoptGridEl.innerHTML = items.map(bbAnimalCardHtml).join("");

  if (allAdoptAnimals.length > INITIAL_LIMIT) {
    bbAdoptToggleWrapEl.classList.remove("hidden");
    const remaining = allAdoptAnimals.length - INITIAL_LIMIT;
    bbAdoptToggleBtn.textContent = adoptExpanded
      ? "Recolher vitrine de adoção ↑"
      : `Ver mais animais para adoção (${remaining}) ↓`;
  } else {
    bbAdoptToggleWrapEl.classList.add("hidden");
  }
}

async function bbLoadAnimals() {
  bbLostGridEl.innerHTML = bbSkeletonGridHtml(INITIAL_LIMIT);
  bbAdoptGridEl.innerHTML = bbSkeletonGridHtml(INITIAL_LIMIT);
  bbAnimalsAlertEl.innerHTML = "";

  const currentUser = typeof bbStorage !== "undefined" && bbStorage.getUser();

  const commonParams = {};
  if (filterCidade) commonParams.cidade = filterCidade;
  if (filterTipoAnimal) commonParams.tipo_animal = filterTipoAnimal;
  if (filterTempo) commonParams.tempo = filterTempo;
  if (activeTab === "my" && currentUser) commonParams.tutor_id = currentUser.id;

  try {
    const [lostList, adoptList] = await Promise.all([
      animalService.list({ ...commonParams, tipo_servico: "PERDIDO" }),
      animalService.list({ ...commonParams, tipo_servico: "ADOCAO" }),
    ]);

    let rawLost = Array.isArray(lostList) ? lostList : [];
    let rawAdopt = Array.isArray(adoptList) ? adoptList : [];

    // Filtros de reforço no front-end para tempo
    if (filterTempo === "semana") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      rawLost = rawLost.filter((a) => !a.created_at || new Date(a.created_at).getTime() >= weekAgo);
      rawAdopt = rawAdopt.filter((a) => !a.created_at || new Date(a.created_at).getTime() >= weekAgo);
    } else if (filterTempo === "mes") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      rawLost = rawLost.filter((a) => !a.created_at || new Date(a.created_at).getTime() >= monthAgo);
      rawAdopt = rawAdopt.filter((a) => !a.created_at || new Date(a.created_at).getTime() >= monthAgo);
    }

    allLostAnimals = rawLost;
    allAdoptAnimals = rawAdopt;

    renderLost();
    renderAdopt();
  } catch (err) {
    bbLostGridEl.innerHTML = bbStateHtml({
      title: "Não foi possível carregar os animais desaparecidos.",
      description: err.message,
      isError: true,
    });
    bbAdoptGridEl.innerHTML = bbStateHtml({
      title: "Não foi possível carregar os animais para adoção.",
      description: err.message,
      isError: true,
    });
  }
}

// Expansão / Recolhimento
bbLostToggleBtn.addEventListener("click", () => {
  lostExpanded = !lostExpanded;
  renderLost();
});

bbAdoptToggleBtn.addEventListener("click", () => {
  adoptExpanded = !adoptExpanded;
  renderAdopt();
});

// Ações de Filtro (RF08)
function applyFilters() {
  filterCidade = filterCidadeInput ? filterCidadeInput.value.trim() : "";
  filterTipoAnimal = filterTipoAnimalSelect ? filterTipoAnimalSelect.value : "";
  filterTempo = filterTempoSelect ? filterTempoSelect.value : "";
  lostExpanded = false;
  adoptExpanded = false;
  bbLoadAnimals();
}

filterApplyBtn.addEventListener("click", applyFilters);
filterCidadeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyFilters();
});
filterTipoAnimalSelect.addEventListener("change", applyFilters);
if (filterTempoSelect) filterTempoSelect.addEventListener("change", applyFilters);

filterClearBtn.addEventListener("click", () => {
  if (filterCidadeInput) filterCidadeInput.value = "";
  if (filterTipoAnimalSelect) filterTipoAnimalSelect.value = "";
  if (filterTempoSelect) filterTempoSelect.value = "";
  filterCidade = "";
  filterTipoAnimal = "";
  filterTempo = "";
  lostExpanded = false;
  adoptExpanded = false;
  bbLoadAnimals();
});

// Abas (Todos os pets vs Meus Anúncios)
function updateTabStyles() {
  if (activeTab === "all") {
    tabAllPets.className = "px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all bg-brand-500 text-white shadow-sm";
    tabMyPets.className = "px-4 py-2 text-xs md:text-sm font-medium rounded-lg text-ink-300 hover:text-ink-100 hover:bg-black/5 transition-all";
  } else {
    tabMyPets.className = "px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all bg-brand-500 text-white shadow-sm";
    tabAllPets.className = "px-4 py-2 text-xs md:text-sm font-medium rounded-lg text-ink-300 hover:text-ink-100 hover:bg-black/5 transition-all";
  }
}

tabAllPets.addEventListener("click", () => {
  if (activeTab === "all") return;
  activeTab = "all";
  updateTabStyles();
  lostExpanded = false;
  adoptExpanded = false;
  bbLoadAnimals();
});

tabMyPets.addEventListener("click", () => {
  if (!bbStorage.isAuthenticated()) {
    window.location.href = `/pages/auth/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }
  if (activeTab === "my") return;
  activeTab = "my";
  updateTabStyles();
  lostExpanded = false;
  adoptExpanded = false;
  bbLoadAnimals();
});

// Modal de Criação de Pet para Adoção
async function openAdoptModal() {
  if (!bbStorage.isAuthenticated()) {
    window.location.href = `/pages/auth/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  // Verificar se o usuário possui telefone cadastrado
  try {
    const profile = await authService.getProfile();
    if (!profile.telefone_validado && !profile.telefone) {
      bbAnimalsAlertEl.innerHTML = `
        <div class="bb-alert bb-alert--error mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <strong>Telefone não informado:</strong> Cadastre seu telefone de contato no perfil para poder anunciar pets para adoção ou perdidos.
          </div>
          <a href="/pages/auth/profile.html" class="bb-btn bb-btn--xs bb-btn--primary shrink-0">
            Ir para Meu Perfil →
          </a>
        </div>
      `;
      bbAnimalsAlertEl.scrollIntoView({ behavior: "smooth" });
      return;
    }
  } catch (err) {
    bbAnimalsAlertEl.innerHTML = `<div class="bb-alert bb-alert--error mb-6">${err.message}</div>`;
    return;
  }

  modalAlertEl.innerHTML = "";
  formAdoptPet.reset();
  adoptModal.classList.remove("hidden");
}

function closeAdoptModal() {
  adoptModal.classList.add("hidden");
}

announceBtn.addEventListener("click", openAdoptModal);
document.querySelectorAll(".btn-trigger-adopt-modal").forEach((btn) => {
  btn.addEventListener("click", openAdoptModal);
});
modalCloseBtn.addEventListener("click", closeAdoptModal);
modalCancelBtn.addEventListener("click", closeAdoptModal);
adoptModal.addEventListener("click", (e) => {
  if (e.target === adoptModal) closeAdoptModal();
});

formAdoptPet.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalAlertEl.innerHTML = "";

  const payload = {
    tipo_servico: "ADOCAO",
    status: "DISPONIVEL",
    nome: document.getElementById("pet-nome").value.trim(),
    tipo_animal: document.getElementById("pet-tipo").value,
    sexo: document.getElementById("pet-sexo").value,
    raca: document.getElementById("pet-raca").value.trim() || undefined,
    idade_aproximada: document.getElementById("pet-idade").value.trim() || undefined,
    cidade: document.getElementById("pet-cidade").value.trim(),
    descricao: document.getElementById("pet-descricao").value.trim(),
    vacinacao: document.getElementById("pet-vacinacao").value.trim() || undefined,
    medicamento: document.getElementById("pet-medicamento").value.trim() || undefined,
    imagem: document.getElementById("pet-imagem").value.trim() || undefined,
  };

  modalSubmitBtn.disabled = true;
  modalSubmitBtn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Publicando...';

  try {
    await animalService.create(payload);
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--success">Animal anunciado com sucesso!</div>`;
    setTimeout(() => {
      closeAdoptModal();
      bbLoadAnimals();
    }, 1000);
  } catch (err) {
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    modalSubmitBtn.disabled = false;
    modalSubmitBtn.textContent = "Publicar Anúncio";
  }
});

// Ações do Dono no Card (Concluir status e Excluir)
document.addEventListener("click", async (e) => {
  const finishBtn = e.target.closest(".btn-finish-animal");
  if (finishBtn) {
    e.stopPropagation();
    const id = finishBtn.dataset.id;
    const targetStatus = finishBtn.dataset.status;
    const confirmMsg = targetStatus === "ENCONTRADO"
      ? "Deseja marcar este pet como ENCONTRADO? O anúncio será dado como concluído."
      : "Deseja marcar este pet como ADOTADO? O anúncio será dado como concluído.";

    if (!confirm(confirmMsg)) return;

    finishBtn.disabled = true;
    try {
      await animalService.update(id, { status: targetStatus });
      bbLoadAnimals();
    } catch (err) {
      alert("Erro ao atualizar anúncio: " + err.message);
      finishBtn.disabled = false;
    }
    return;
  }

  const deleteBtn = e.target.closest(".btn-delete-animal");
  if (deleteBtn) {
    e.stopPropagation();
    const id = deleteBtn.dataset.id;
    if (!confirm("Tem certeza que deseja excluir permanentemente este anúncio?")) return;

    deleteBtn.disabled = true;
    try {
      await animalService.delete(id);
      bbLoadAnimals();
    } catch (err) {
      alert("Erro ao excluir anúncio: " + err.message);
      deleteBtn.disabled = false;
    }
  }
});

// Carregamento inicial
bbLoadAnimals();

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
const filterEstadoSelect = document.getElementById("filter-estado");
const filterCidadeInput = document.getElementById("filter-cidade");
const filterCidadesDatalist = document.getElementById("filter-cidades-list");
const filterTipoAnimalSelect = document.getElementById("filter-tipo-animal");
const filterTempoSelect = document.getElementById("filter-tempo");
const filterApplyBtn = document.getElementById("filter-apply-btn");
const filterClearBtn = document.getElementById("filter-clear-btn");

// Modal
const announceBtn = document.getElementById("bb-announce-pet-btn");
const reportLostBtn = document.getElementById("bb-report-lost-btn");
const adoptModal = document.getElementById("adopt-modal");
const modalCloseBtn = document.getElementById("modal-adopt-close-btn");
const modalCancelBtn = document.getElementById("modal-adopt-cancel-btn");
const modalAlertEl = document.getElementById("modal-adopt-alert");
const formAdoptPet = document.getElementById("form-adopt-pet");
const modalSubmitBtn = document.getElementById("modal-adopt-submit-btn");
const petServicoSelect = document.getElementById("pet-servico");
const wrapPetLocal = document.getElementById("wrap-pet-local");
const petLocalInput = document.getElementById("pet-local");
const petEstadoSelect = document.getElementById("pet-estado");
const petCidadeInput = document.getElementById("pet-cidade");
const petCidadesDatalist = document.getElementById("pet-cidades-list");
const petPhoneInput = document.getElementById("pet-telefone");
const wrapPetStatus = document.getElementById("wrap-pet-status");
const petStatusSelect = document.getElementById("pet-status");
let currentEditingAnimalId = null;

const petImageInput = document.getElementById("pet-imagem");
const petImagePreviewWrap = document.getElementById("pet-imagem-preview-wrap");
const petImagePreview = document.getElementById("pet-imagem-preview");
const petImageFilename = document.getElementById("pet-imagem-filename");
const petImageFilesize = document.getElementById("pet-imagem-filesize");
const petImageClearBtn = document.getElementById("pet-imagem-clear-btn");

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

function isValidImageType(file) {
  if (!file) return false;
  const mime = (file.type || "").toLowerCase();
  const mimeValid = ALLOWED_IMAGE_TYPES.includes(mime);
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  const extValid = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  return mimeValid || extValid;
}

function resetImageInput() {
  if (petImageInput) petImageInput.value = "";
  if (petImagePreviewWrap) {
    petImagePreviewWrap.classList.add("hidden");
    petImagePreviewWrap.style.display = "none";
  }
  if (petImagePreview) petImagePreview.src = "";
  if (petImageFilename) petImageFilename.textContent = "";
  if (petImageFilesize) petImageFilesize.textContent = "";
}

function setImagePreview(src, name, sizeText) {
  if (!petImagePreviewWrap) return;
  petImagePreview.src = src;
  petImageFilename.textContent = name || "Foto do pet";
  petImageFilesize.textContent = sizeText || "";
  petImagePreviewWrap.classList.remove("hidden");
  petImagePreviewWrap.style.display = "flex";
}

// Estado
const INITIAL_LIMIT = 4;
let allLostAnimals = [];
let allAdoptAnimals = [];
let lostExpanded = false;
let adoptExpanded = false;
let activeTab = "all"; // "all" | "my"
let filterEstado = "";
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
  if (filterEstado) commonParams.estado = filterEstado;
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
  filterEstado = filterEstadoSelect ? filterEstadoSelect.value : "";
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

if (filterEstadoSelect) {
  filterEstadoSelect.addEventListener("change", async () => {
    const uf = filterEstadoSelect.value;
    filterCidadeInput.value = "";
    if (filterCidadesDatalist) filterCidadesDatalist.innerHTML = "";

    if (!uf) {
      filterCidadeInput.placeholder = "🔍 Buscar por cidade...";
    } else {
      filterCidadeInput.placeholder = "Carregando cidades...";
      try {
        const cidades = await ibgeService.getCidadesPorEstado(uf);
        if (filterCidadesDatalist) {
          filterCidadesDatalist.innerHTML = cidades.map((c) => `<option value="${c.nome}">`).join("");
        }
        filterCidadeInput.placeholder = `Cidades de ${uf} (digite para filtrar)...`;
      } catch (err) {
        filterCidadeInput.placeholder = "Digite o nome da cidade...";
      }
    }
    applyFilters();
  });
}

filterClearBtn.addEventListener("click", () => {
  if (filterEstadoSelect) filterEstadoSelect.value = "";
  if (filterCidadesDatalist) filterCidadesDatalist.innerHTML = "";
  if (filterCidadeInput) {
    filterCidadeInput.value = "";
    filterCidadeInput.placeholder = "🔍 Buscar por cidade...";
  }
  if (filterTipoAnimalSelect) filterTipoAnimalSelect.value = "";
  if (filterTempoSelect) filterTempoSelect.value = "";
  filterEstado = "";
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

// Máscara de telefone brasileiro (XX) XXXXX-XXXX
function applyPhoneMask(input) {
  if (!input) return;
  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      e.target.value = `(${value}`;
    }
  });
}

applyPhoneMask(petPhoneInput);

// Atualização de UI conforme o serviço (Adoção vs Animal Perdido)
function updateModalServiceUI(service) {
  const modalHeading = document.querySelector("#adopt-modal h2");
  const modalDesc = document.getElementById("modal-adopt-desc");
  if (service === "PERDIDO") {
    if (wrapPetLocal) wrapPetLocal.classList.remove("hidden");
    if (petLocalInput) petLocalInput.required = true;
    if (modalHeading) modalHeading.innerHTML = `<span>🚨</span> Reportar Animal Perdido`;
    if (modalDesc) modalDesc.textContent = "Preencha as informações do animal desaparecido para que a comunidade possa ajudar a localizá-lo.";
    modalSubmitBtn.textContent = "Publicar Animal Perdido";
  } else {
    if (wrapPetLocal) wrapPetLocal.classList.add("hidden");
    if (petLocalInput) {
      petLocalInput.required = false;
      petLocalInput.value = "";
    }
    if (modalHeading) modalHeading.innerHTML = `<span>🐾</span> Anunciar Pet para Adoção`;
    if (modalDesc) modalDesc.textContent = "Preencha os dados do animal. O telefone informado será o canal direto para interessados entrarem em contato via WhatsApp.";
    modalSubmitBtn.textContent = "Publicar Anúncio";
  }
}

// Modal de Criação / Relato de Animal
async function openAdoptModal(defaultService = "ADOCAO") {
  if (!bbStorage.isAuthenticated()) {
    window.location.href = `/pages/auth/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  currentEditingAnimalId = null;
  modalAlertEl.innerHTML = "";
  formAdoptPet.reset();
  resetImageInput();

  if (wrapPetStatus) wrapPetStatus.classList.add("hidden");

  if (petServicoSelect) {
    petServicoSelect.value = defaultService;
    updateModalServiceUI(defaultService);
  }

  if (petCidadeInput) {
    petCidadeInput.disabled = true;
    petCidadeInput.placeholder = "Selecione a UF primeiro...";
  }
  if (petCidadesDatalist) {
    petCidadesDatalist.innerHTML = "";
  }

  // Pré-preenche o telefone de contato se o usuário já tiver no perfil (RF08)
  try {
    const profile = await authService.getProfile();
    const phoneInput = document.getElementById("pet-telefone");
    if (phoneInput && profile && profile.telefone) {
      phoneInput.value = profile.telefone;
      phoneInput.dispatchEvent(new Event("input"));
    }
  } catch (err) {
    console.warn("Não foi possível carregar dados do perfil:", err);
  }

  if (adoptModal) adoptModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Modal de Edição de Anúncio de Animal
async function openEditPetModal(animal) {
  if (!bbStorage.isAuthenticated()) {
    window.location.href = `/pages/auth/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  currentEditingAnimalId = animal.id;
  modalAlertEl.innerHTML = "";
  formAdoptPet.reset();

  const modalHeading = document.querySelector("#adopt-modal h2");
  const modalDesc = document.getElementById("modal-adopt-desc");
  if (modalHeading) modalHeading.innerHTML = `<span>✏️</span> Editar Anúncio do Pet`;
  if (modalDesc) modalDesc.textContent = "Atualize os dados e o status do anúncio do seu animal.";
  if (modalSubmitBtn) modalSubmitBtn.textContent = "Salvar Alterações";

  if (wrapPetStatus) wrapPetStatus.classList.remove("hidden");
  if (petStatusSelect) petStatusSelect.value = animal.status || "DISPONIVEL";

  if (petServicoSelect) {
    petServicoSelect.value = animal.tipo_servico || "ADOCAO";
    updateModalServiceUI(animal.tipo_servico || "ADOCAO");
    if (modalHeading) modalHeading.innerHTML = `<span>✏️</span> Editar Anúncio do Pet`;
    if (modalSubmitBtn) modalSubmitBtn.textContent = "Salvar Alterações";
  }

  // Preenche dados do animal no formulário
  const nomeEl = document.getElementById("pet-nome");
  if (nomeEl) nomeEl.value = animal.nome || "";

  const tipoEl = document.getElementById("pet-tipo");
  if (tipoEl) tipoEl.value = animal.tipo_animal || "CACHORRO";

  const sexoEl = document.getElementById("pet-sexo");
  if (sexoEl) sexoEl.value = animal.sexo || "M";

  const racaEl = document.getElementById("pet-raca");
  if (racaEl) racaEl.value = animal.raca || "";

  const idadeEl = document.getElementById("pet-idade");
  if (idadeEl) idadeEl.value = animal.idade_aproximada || "";

  const castradoEl = document.getElementById("pet-castrado");
  if (castradoEl) castradoEl.value = animal.castrado || "";

  const medEl = document.getElementById("pet-medicamento");
  if (medEl) medEl.value = animal.medicamento || "";

  const descEl = document.getElementById("pet-descricao");
  if (descEl) descEl.value = animal.descricao || "";

  resetImageInput();
  if (animal.imagem) {
    setImagePreview(animal.imagem, "Foto cadastrada", "");
  }

  if (animal.local && petLocalInput) petLocalInput.value = animal.local;

  const phoneInput = document.getElementById("pet-telefone");
  if (phoneInput) {
    phoneInput.value = animal.telefone_contato || "";
    phoneInput.dispatchEvent(new Event("input"));
  }

  // Preenche Estado e Cidade
  if (petEstadoSelect && animal.estado) {
    petEstadoSelect.value = animal.estado;
    try {
      const cidades = await ibgeService.getCidadesPorEstado(animal.estado);
      if (petCidadesDatalist) {
        petCidadesDatalist.innerHTML = cidades.map((c) => `<option value="${c.nome}">`).join("");
      }
      if (petCidadeInput) {
        petCidadeInput.disabled = false;
        petCidadeInput.value = animal.cidade || "";
      }
    } catch (_) {
      if (petCidadeInput) {
        petCidadeInput.disabled = false;
        petCidadeInput.value = animal.cidade || "";
      }
    }
  } else if (petCidadeInput) {
    petCidadeInput.disabled = false;
    petCidadeInput.value = animal.cidade || "";
  }

  if (adoptModal) adoptModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeAdoptModal() {
  currentEditingAnimalId = null;
  resetImageInput();
  if (wrapPetStatus) wrapPetStatus.classList.add("hidden");
  if (adoptModal) adoptModal.classList.add("hidden");
  document.body.style.overflow = "";
}

if (announceBtn) announceBtn.addEventListener("click", () => openAdoptModal("ADOCAO"));
if (reportLostBtn) reportLostBtn.addEventListener("click", () => openAdoptModal("PERDIDO"));

document.querySelectorAll(".btn-trigger-adopt-modal").forEach((btn) => {
  btn.addEventListener("click", () => openAdoptModal("ADOCAO"));
});

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeAdoptModal);
if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeAdoptModal);
if (adoptModal) {
  adoptModal.addEventListener("click", (e) => {
    if (e.target === adoptModal) closeAdoptModal();
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && adoptModal && !adoptModal.classList.contains("hidden")) {
    closeAdoptModal();
  }
});

if (petImageInput) {
  petImageInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    modalAlertEl.innerHTML = "";
    if (!file) {
      resetImageInput();
      return;
    }

    if (!isValidImageType(file)) {
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">Formato de arquivo inválido. Por favor, envie uma imagem nos formatos JPEG ou PNG (.jpg, .jpeg, .png).</div>`;
      resetImageInput();
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">O arquivo selecionado tem ${sizeMB} MB. O tamanho máximo permitido é de 5 MB.</div>`;
      resetImageInput();
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const sizeKB = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;
    setImagePreview(previewUrl, file.name, sizeKB);
  });
}

if (petImageClearBtn) {
  petImageClearBtn.addEventListener("click", () => {
    resetImageInput();
  });
}

if (petServicoSelect) {
  petServicoSelect.addEventListener("change", (e) => {
    updateModalServiceUI(e.target.value);
  });
}

if (petEstadoSelect) {
  petEstadoSelect.addEventListener("change", async () => {
    const uf = petEstadoSelect.value;
    petCidadeInput.value = "";
    if (petCidadesDatalist) petCidadesDatalist.innerHTML = "";

    if (!uf) {
      petCidadeInput.disabled = true;
      petCidadeInput.placeholder = "Selecione a UF primeiro...";
      return;
    }

    petCidadeInput.disabled = true;
    petCidadeInput.placeholder = "Carregando cidades do IBGE...";

    try {
      const cidades = await ibgeService.getCidadesPorEstado(uf);
      if (petCidadesDatalist) {
        petCidadesDatalist.innerHTML = cidades.map((c) => `<option value="${c.nome}">`).join("");
      }
      petCidadeInput.disabled = false;
      petCidadeInput.placeholder = "Digite ou selecione a cidade...";
      petCidadeInput.focus();
    } catch (err) {
      console.error("Erro ao carregar cidades do IBGE:", err);
      petCidadeInput.disabled = false;
      petCidadeInput.placeholder = "Digite sua cidade manualmente...";
    }
  });
}

formAdoptPet.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalAlertEl.innerHTML = "";

  const isEdit = Boolean(currentEditingAnimalId);
  const servico = (document.getElementById("pet-servico")?.value || "ADOCAO");
  const phoneInput = document.getElementById("pet-telefone");
  const rawPhone = phoneInput ? phoneInput.value.trim() : "";
  const phoneDigits = rawPhone.replace(/\D/g, "");

  // 1. Validação estrita do Telefone de Contato (DDD + Número obrigatório)
  const ddd = phoneDigits.slice(0, 2);
  const isValidDDD = phoneDigits.length >= 2 && parseInt(ddd, 10) >= 11 && parseInt(ddd, 10) <= 99;
  const isValidPhone = (phoneDigits.length === 10 || phoneDigits.length === 11) && isValidDDD;

  if (!isValidPhone) {
    const errorMsg = "É necessário um número de contato para cadastrar o animal.";
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error font-semibold">⚠️ ${errorMsg}</div>`;
    alert(errorMsg);
    if (phoneInput) {
      phoneInput.focus();
      phoneInput.classList.add("border-rose-500");
      setTimeout(() => phoneInput.classList.remove("border-rose-500"), 3500);
    }
    return; // BLOQUEIA A CHAMADA DA ROTA
  }

  const estado = (document.getElementById("pet-estado")?.value || "").trim().toUpperCase();
  const cidade = document.getElementById("pet-cidade").value.trim();

  if (!estado) {
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">Por favor, selecione o Estado (UF).</div>`;
    return;
  }
  if (!cidade) {
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">Por favor, selecione ou informe a Cidade.</div>`;
    return;
  }

  const statusVal = isEdit
    ? (document.getElementById("pet-status")?.value || (servico === "PERDIDO" ? "PERDIDO" : "DISPONIVEL"))
    : (servico === "PERDIDO" ? "PERDIDO" : "DISPONIVEL");

  const selectedFile = petImageInput && petImageInput.files && petImageInput.files[0];
  if (selectedFile) {
    if (!isValidImageType(selectedFile)) {
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">Formato de arquivo inválido. Apenas imagens JPEG ou PNG (.jpg, .jpeg, .png) são permitidas.</div>`;
      petImageInput.focus();
      return;
    }
    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">O arquivo de imagem excede o tamanho máximo de 5 MB (${sizeMB} MB).</div>`;
      petImageInput.focus();
      return;
    }
  }

  const nomeVal = document.getElementById("pet-nome").value.trim();
  const tipoVal = document.getElementById("pet-tipo").value;
  const sexoVal = document.getElementById("pet-sexo").value;
  const racaVal = document.getElementById("pet-raca").value.trim();
  const idadeVal = document.getElementById("pet-idade").value.trim();
  const descVal = document.getElementById("pet-descricao").value.trim();
  const castradoVal = document.getElementById("pet-castrado")?.value.trim();
  const medVal = document.getElementById("pet-medicamento")?.value.trim();
  const localVal = document.getElementById("pet-local")?.value.trim();

  let payload;
  if (selectedFile) {
    payload = new FormData();
    payload.append("tipo_servico", servico);
    payload.append("status", statusVal);
    payload.append("nome", nomeVal);
    payload.append("tipo_animal", tipoVal);
    payload.append("sexo", sexoVal);
    if (racaVal) payload.append("raca", racaVal);
    if (idadeVal) payload.append("idade_aproximada", idadeVal);
    payload.append("estado", estado);
    payload.append("cidade", cidade);
    payload.append("telefone_contato", rawPhone);
    payload.append("descricao", descVal);
    if (castradoVal) payload.append("castrado", castradoVal);
    if (medVal) payload.append("medicamento", medVal);
    if (servico === "PERDIDO" && localVal) payload.append("local", localVal);
    payload.append("imagem", selectedFile);
  } else {
    payload = {
      tipo_servico: servico,
      status: statusVal,
      nome: nomeVal,
      tipo_animal: tipoVal,
      sexo: sexoVal,
      raca: racaVal || undefined,
      idade_aproximada: idadeVal || undefined,
      estado,
      cidade,
      telefone_contato: rawPhone,
      descricao: descVal,
      castrado: castradoVal || undefined,
      medicamento: medVal || undefined,
      local: servico === "PERDIDO" ? (localVal || undefined) : undefined,
    };
  }

  modalSubmitBtn.disabled = true;
  modalSubmitBtn.innerHTML = isEdit
    ? '<span class="bb-btn__spinner" aria-hidden="true"></span> Salvando alterações...'
    : '<span class="bb-btn__spinner" aria-hidden="true"></span> Publicando...';

  try {
    if (isEdit) {
      await animalService.update(currentEditingAnimalId, payload);
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--success">Anúncio do pet atualizado com sucesso!</div>`;
    } else {
      await animalService.create(payload);
      modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--success">Animal anunciado com sucesso!</div>`;
    }
    setTimeout(() => {
      closeAdoptModal();
      bbLoadAnimals();
    }, 1000);
  } catch (err) {
    modalAlertEl.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    modalSubmitBtn.disabled = false;
    modalSubmitBtn.textContent = isEdit
      ? "Salvar Alterações"
      : (servico === "PERDIDO" ? "Publicar Animal Perdido" : "Publicar Anúncio");
  }
});

// Ações do Dono no Card (Concluir status, Editar e Excluir) + Navegação
document.addEventListener("click", async (e) => {
  // 1. Finalizar Anúncio (Marcar como Adotado ou Encontrado)
  const finishBtn = e.target.closest(".btn-finish-animal");
  if (finishBtn) {
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

  // 2. Editar Informações do Pet
  const editBtn = e.target.closest(".btn-edit-animal");
  if (editBtn) {
    const id = editBtn.dataset.id;
    const allPets = [...allLostAnimals, ...allAdoptAnimals];
    let animal = allPets.find((a) => String(a.id) === String(id));
    if (!animal) {
      try {
        animal = await animalService.getById(id);
      } catch (err) {
        alert("Não foi possível carregar os dados para edição: " + err.message);
        return;
      }
    }
    if (animal) {
      openEditPetModal(animal);
    }
    return;
  }

  // 3. Excluir Anúncio do Pet
  const deleteBtn = e.target.closest(".btn-delete-animal");
  if (deleteBtn) {
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
    return;
  }

  // 4. Clique geral no card (Navegação para página de detalhes)
  const card = e.target.closest(".bb-pet-card, .bb-animal-card");
  if (card) {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest(".bb-owner-actions")
    ) {
      return;
    }
    const cardId = card.dataset.cardId || card.getAttribute("data-card-id");
    if (cardId) {
      window.location.href = `/pages/animals/detail.html?id=${cardId}`;
    }
  }
});

// Suporte para abrir edição direto via URL query param: ?edit=<id>
async function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  if (editId) {
    try {
      const animal = await animalService.getById(editId);
      if (animal) {
        openEditPetModal(animal);
      }
    } catch (err) {
      console.warn("Erro ao abrir pet via URL param:", err);
    }
  }
}

// Inicialização dos selects do IBGE
function initIbgeUI() {
  if (typeof ibgeService === "undefined") return;
  const estados = ibgeService.getEstados();
  const optionsHtml = estados.map((e) => `<option value="${e.sigla}">${e.sigla} - ${e.nome}</option>`).join("");

  if (filterEstadoSelect) {
    filterEstadoSelect.innerHTML = '<option value="">Todos os estados</option>' + optionsHtml;
  }
  if (petEstadoSelect) {
    petEstadoSelect.innerHTML = '<option value="">Selecione a UF...</option>' + optionsHtml;
  }
}

// Carregamento inicial
initIbgeUI();
bbLoadAnimals().then(() => checkUrlParams());

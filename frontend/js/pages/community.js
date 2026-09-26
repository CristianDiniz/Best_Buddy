bbRenderNavigation("#bb-nav", "community");
bbRenderFooter("#bb-footer");

const bbNewsEl = document.getElementById("bb-news");
const bbMissingEl = document.getElementById("bb-missing");
const bbCommunityAlert = document.getElementById("bb-community-alert");

// Modal elements
const reportModal = document.getElementById("report-modal");
const btnOpenReport = document.getElementById("bb-report-btn");
const btnCloseModal = document.getElementById("modal-close-btn");
const btnCancelModal = document.getElementById("modal-cancel-btn");
const formReport = document.getElementById("form-report-missing");

function showCommunityAlert(message, isSuccess = false) {
  if (!bbCommunityAlert) return;
  const bg = isSuccess
    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
    : "bg-amber-500/10 border-amber-500/40 text-amber-300";
  bbCommunityAlert.innerHTML = `
    <div class="bb-alert border p-3 rounded-lg mb-6 flex items-center justify-between gap-2 ${bg}">
      <div class="flex items-center gap-2">
        <span>${isSuccess ? "✅" : "⚠️"}</span>
        <span>${message}</span>
      </div>
      ${!isSuccess ? '<a href="/pages/auth/profile.html" class="bb-btn bb-btn--sm bb-btn--primary">Validar no Perfil</a>' : ''}
    </div>
  `;
}

function bbNewsCardHtml(item) {
  return `
    <article class="bb-card hover:border-brand-500/50 transition-colors">
      ${item.imagem ? `<img src="${item.imagem}" alt="${item.titulo}" class="w-full h-44 object-cover rounded-lg mb-3" />` : ''}
      <h3 class="text-base font-bold text-slate-100 mb-1">${item.titulo}</h3>
      <p class="text-xs text-slate-400 mb-2">${typeof bbFormatDate === 'function' ? bbFormatDate(item.created_at) : ''}</p>
      <p class="text-sm text-slate-300">${item.resumo || item.conteudo || ''}</p>
    </article>
  `;
}

async function bbLoadNews() {
  if (!bbNewsEl) return;
  bbNewsEl.innerHTML = typeof bbSkeletonGridHtml === "function" ? bbSkeletonGridHtml(2) : "Carregando notícias...";
  try {
    const news = await communityService.listNews();
    bbNewsEl.innerHTML = news.length
      ? news.map(bbNewsCardHtml).join("")
      : '<p class="text-xs text-slate-400">Nenhuma notícia publicada no momento.</p>';
  } catch (err) {
    bbNewsEl.innerHTML = '<p class="text-xs text-rose-400">Não foi possível carregar as notícias.</p>';
  }
}

async function bbLoadMissing() {
  if (!bbMissingEl) return;
  bbMissingEl.innerHTML = typeof bbSkeletonGridHtml === "function" ? bbSkeletonGridHtml(3) : "Carregando animais...";
  try {
    const missing = await communityService.listMissingAnimals();
    bbMissingEl.innerHTML = missing.length
      ? missing.map(bbMissingAnimalCardHtml).join("")
      : typeof bbStateHtml === "function"
        ? bbStateHtml({ title: "Nenhum animal desaparecido reportado.", description: "Boas notícias!" })
        : '<p class="text-xs text-slate-400">Nenhum animal desaparecido reportado.</p>';
  } catch (err) {
    bbMissingEl.innerHTML = typeof bbStateHtml === "function"
      ? bbStateHtml({ title: "Erro ao carregar desaparecidos.", description: err.message, isError: true })
      : '<p class="text-xs text-rose-400">Erro ao carregar lista de desaparecidos.</p>';
  }
}

// Modal handling
if (btnOpenReport) {
  btnOpenReport.addEventListener("click", async () => {
    if (!bbStorage.isAuthenticated()) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/pages/auth/login.html?next=${next}`;
      return;
    }

    // Pré-preenche o telefone se o usuário já tiver no perfil (RF08)
    try {
      const profile = await authService.getProfile();
      const phoneInput = document.getElementById("missing-telefone");
      if (phoneInput && profile && profile.telefone) {
        phoneInput.value = profile.telefone;
      }
    } catch (e) {
      console.warn("Não foi possível carregar dados do perfil:", e);
    }

    reportModal.classList.remove("hidden");
  });
}

function closeModal() {
  if (reportModal) reportModal.classList.add("hidden");
  if (formReport) formReport.reset();
}

if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

if (formReport) {
  formReport.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("missing-nome").value.trim();
    const tipo_animal = document.getElementById("missing-tipo").value;
    const estado = (document.getElementById("missing-estado")?.value || "SP").trim();
    const cidade = document.getElementById("missing-cidade").value.trim();
    const telefone_contato = document.getElementById("missing-telefone") ? document.getElementById("missing-telefone").value.trim() : "";
    const local = document.getElementById("missing-local").value.trim();
    const descricao = document.getElementById("missing-desc").value.trim();
    const imagem = document.getElementById("missing-img").value.trim();

    const submitBtn = document.getElementById("modal-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Publicando...";

    try {
      await communityService.reportMissingAnimal({
        nome: nome || null,
        tipo_animal,
        estado,
        cidade,
        telefone_contato,
        local,
        descricao,
        imagem: imagem || null,
      });

      closeModal();
      showCommunityAlert("Animal desaparecido registrado com sucesso!", true);
      bbLoadMissing();
    } catch (err) {
      alert(`Não foi possível cadastrar: ${err.message || err.error || "Erro inesperado."}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publicar Anúncio";
    }
  });
}

bbLoadNews();
bbLoadMissing();

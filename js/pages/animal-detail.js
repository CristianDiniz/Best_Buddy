bbRenderNavigation("#bb-nav", "animals");
bbRenderFooter("#bb-footer");

const bbDetailEl = document.getElementById("bb-detail");
const bbAnimalId = new URLSearchParams(window.location.search).get("id");

const bbSexoLabel = { M: "Macho", F: "Fêmea", I: "Indeterminado" };

async function bbLoadDetail() {
  bbDetailEl.innerHTML = bbLoadingHtml;
  try {
    const animal = await animalService.getById(bbAnimalId);
    const imageHtml = animal.imagem
      ? `<img src="${animal.imagem}" alt="${animal.nome}" class="w-full h-full object-cover" />`
      : `<span class="text-xs uppercase tracking-wide text-ink-500 mt-1">Sem foto</span>`;

    bbDetailEl.innerHTML = `
      <div class="bb-card animate-scale-in grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div class="bb-animal-card__image rounded-lg aspect-square flex-col gap-1${animal.imagem ? "" : " bb-animal-card__image--empty"}">${imageHtml}</div>
        <div>
          <h1 class="bb-page-title mb-2">${animal.nome}</h1>
          <p class="text-ink-300 mb-4 flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${animal.raca || "SRD"}</span>
            <span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${animal.idade_aproximada}</span>
            <span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${bbSexoLabel[animal.sexo] || animal.sexo}</span>
          </p>
          <p class="mb-2"><strong class="text-ink-100">Vacinação em dia:</strong> <span class="text-ink-300">${animal.vacinacao}</span></p>
          <p class="mb-4"><strong class="text-ink-100">Faz uso de medicamentos:</strong> <span class="text-ink-300">${animal.medicamento}</span></p>
          <p class="mb-6 text-ink-300 leading-relaxed">${animal.descricao || ""}</p>
          <a class="bb-btn bb-btn--primary" href="/pages/adoption/create.html?animal_id=${animal.id}">
            Quero adotar
          </a>
        </div>
      </div>
    `;
  } catch (err) {
    bbDetailEl.innerHTML = bbStateHtml({ title: "Animal não encontrado.", description: err.message, isError: true });
  }
}

bbLoadDetail();

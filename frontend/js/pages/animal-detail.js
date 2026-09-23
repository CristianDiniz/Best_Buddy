bbRenderNavigation("#bb-nav", "animals");
bbRenderFooter("#bb-footer");

const bbDetailEl = document.getElementById("bb-detail");
const bbAnimalId = new URLSearchParams(window.location.search).get("id");

const bbSexoLabel = { M: "Macho", F: "Fêmea", I: "Indeterminado" };

async function bbLoadDetail() {
  bbDetailEl.innerHTML = typeof bbLoadingHtml !== "undefined" ? bbLoadingHtml : "Carregando...";
  try {
    const animal = await animalService.getById(bbAnimalId);
    const imageHtml = animal.imagem
      ? `<img src="${animal.imagem}" alt="${animal.nome}" class="w-full h-full object-cover" />`
      : `<span class="text-xs uppercase tracking-wide text-ink-500 mt-1">Sem foto</span>`;

    const cleanPhone = (animal.contato || "").replace(/\D/g, "");
    const petNome = animal.nome || "pet";
    const isPerdido = animal.tipo_servico === "PERDIDO";
    const tutorNome = animal.tutor_nome || "Tutor / Protetor";
    const btnTexto = isPerdido ? "🚨 Vi este Pet (WhatsApp)" : "🐾 Quero Adotar (WhatsApp)";
    const waMsg = isPerdido
      ? `Olá, ${tutorNome}! Vi o anúncio do(a) ${encodeURIComponent(petNome)} como animal perdido no Best Buddy e gostaria de passar informações!`
      : `Olá, ${tutorNome}! Vi o anúncio do(a) ${encodeURIComponent(petNome)} para adoção no Best Buddy e tenho interesse em adotá-lo(a)!`;

    const contactHtml = cleanPhone
      ? `
        <div class="mt-6 p-4 rounded-xl bg-surface-700/60 border border-border/80">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <span class="text-xs uppercase tracking-wider text-ink-500 font-semibold block">Anunciante</span>
              <strong class="text-ink-100 text-base">${tutorNome}</strong>
            </div>
            <div class="text-right">
              <span class="text-xs uppercase tracking-wider text-ink-500 font-semibold block">Telefone / Ligação</span>
              <a href="tel:+55${cleanPhone}" class="text-brand-300 font-mono text-sm hover:underline font-bold">
                📞 ${animal.contato}
              </a>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
            <a class="bb-btn bb-btn--primary flex-1 min-w-[200px] inline-flex items-center justify-center gap-2"
               href="https://wa.me/55${cleanPhone}?text=${waMsg}"
               target="_blank"
               rel="noopener noreferrer"
               id="bb-btn-adotar">
              <span aria-hidden="true">💬</span> ${btnTexto}
            </a>

            <a class="bb-btn bb-btn--secondary inline-flex items-center justify-center gap-2"
               href="tel:+55${cleanPhone}"
               title="Fazer ligação convencional">
              <span aria-hidden="true">📞</span> Ligar
            </a>
          </div>
        </div>
      `
      : `<p class="text-xs text-amber-300 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          Tutor aguardando validação de contato telefônico.
         </p>`;

    bbDetailEl.innerHTML = `
      <div class="bb-card animate-scale-in grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div class="bb-animal-card__image rounded-lg aspect-square flex-col gap-1${animal.imagem ? "" : " bb-animal-card__image--empty"}">${imageHtml}</div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <h1 class="bb-page-title mb-0">${animal.nome || "Pet sem nome"}</h1>
            <span class="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              ${isPerdido ? "🚨 Animal Perdido" : "🐾 Para Adoção"}
            </span>
          </div>

          <p class="text-ink-300 mb-4 flex flex-wrap gap-2">
            ${animal.cidade ? `<span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">📍 ${animal.cidade}</span>` : ""}
            <span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${animal.raca || "SRD"}</span>
            ${animal.idade_aproximada ? `<span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${animal.idade_aproximada}</span>` : ""}
            ${animal.sexo ? `<span class="px-3 py-1 rounded-full bg-surface-700 border border-border text-sm">${bbSexoLabel[animal.sexo] || animal.sexo}</span>` : ""}
          </p>

          ${animal.vacinacao ? `<p class="mb-1 text-sm"><strong class="text-ink-100">Vacinação em dia:</strong> <span class="text-ink-300">${animal.vacinacao}</span></p>` : ""}
          ${animal.medicamento ? `<p class="mb-1 text-sm"><strong class="text-ink-100">Faz uso de medicamentos:</strong> <span class="text-ink-300">${animal.medicamento}</span></p>` : ""}
          ${animal.local ? `<p class="mb-1 text-sm"><strong class="text-ink-100">Último local visto:</strong> <span class="text-ink-300">${animal.local}</span></p>` : ""}
          
          <p class="mt-4 mb-2 text-ink-300 leading-relaxed text-sm">${animal.descricao || "Sem descrição informada."}</p>
          
          ${contactHtml}
        </div>
      </div>
    `;
  } catch (err) {
    bbDetailEl.innerHTML = typeof bbStateHtml === "function"
      ? bbStateHtml({ title: "Animal não encontrado.", description: err.message, isError: true })
      : `<p class="text-rose-400">Erro: ${err.message}</p>`;
  }
}

bbLoadDetail();

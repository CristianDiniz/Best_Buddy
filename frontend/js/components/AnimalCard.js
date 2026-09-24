function bbAnimalCardHtml(animal) {
  const isPerdido = animal.tipo_servico === "PERDIDO";
  const sexoLabel = animal.sexo === "M" ? "Macho" : animal.sexo === "F" ? "Fêmea" : "Indeterminado";
  const currentUser = typeof bbStorage !== "undefined" && bbStorage.getUser();
  const isOwner = currentUser && animal.tutor_id && Number(currentUser.id) === Number(animal.tutor_id);

  let statusBadge = "";
  if (animal.status === "ADOTADO") {
    statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Adotado</span>`;
  } else if (animal.status === "ENCONTRADO") {
    statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">🎉 Encontrado</span>`;
  } else if (isPerdido) {
    statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🚨 Desaparecido</span>`;
  } else {
    statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">🐾 Para Adoção</span>`;
  }

  const imageHtml = animal.imagem
    ? `<img src="${animal.imagem}" alt="${animal.nome || 'Pet'}" class="w-full h-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-110" loading="lazy" />`
    : `<span class="text-[0.7rem] tracking-wide uppercase text-ink-500 mt-1">Sem foto</span>`;

  let ownerActionsHtml = "";
  if (isOwner) {
    const isFinished = animal.status === "ADOTADO" || animal.status === "ENCONTRADO";
    const finishBtnText = isPerdido ? "🎉 Marcar Encontrado" : "✅ Marcar Adotado";
    const targetStatus = isPerdido ? "ENCONTRADO" : "ADOTADO";

    ownerActionsHtml = `
      <div class="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2" onclick="event.stopPropagation();">
        ${!isFinished ? `
          <button type="button" class="bb-btn bb-btn--xs bb-btn--primary flex-1 btn-finish-animal" data-id="${animal.id}" data-status="${targetStatus}">
            ${finishBtnText}
          </button>
        ` : `<span class="text-xs text-ink-400 font-medium">Anúncio concluído</span>`}
        <button type="button" class="bb-btn bb-btn--xs bb-btn--secondary text-rose-400 hover:text-rose-300 btn-delete-animal" data-id="${animal.id}" title="Excluir anúncio">
          🗑️
        </button>
      </div>
    `;
  }

  return `
    <div class="group bb-animal-card relative flex flex-col justify-between cursor-pointer ${isPerdido ? 'border-amber-500/30 hover:border-amber-500/60' : ''}" onclick="window.location.href='/pages/animals/detail.html?id=${animal.id}'">
      <div>
        <div class="bb-animal-card__image flex-col gap-1 relative overflow-hidden${animal.imagem ? "" : " bb-animal-card__image--empty"}">
          ${imageHtml}
          <div class="absolute top-2 left-2 z-10">
            ${statusBadge}
          </div>
        </div>
        <div class="bb-animal-card__body">
          <div class="flex items-center justify-between mb-1">
            <span class="bb-animal-card__name font-bold text-base text-ink-100">${animal.nome || (isPerdido ? "Pet Perdido" : "Pet sem nome")}</span>
            ${animal.cidade ? `<span class="text-xs text-ink-400">📍 ${animal.cidade}</span>` : ""}
          </div>
          <span class="bb-animal-card__meta text-xs text-ink-300 block mb-0.5">
            ${animal.raca || "SRD"} · ${animal.idade_aproximada || "Idade não inf."} · ${sexoLabel}
          </span>
          ${isPerdido && animal.local ? `<span class="text-[11px] text-amber-300/90 block truncate" title="${animal.local}">Visto em: ${animal.local}</span>` : ""}
          ${animal.descricao ? `<p class="text-xs text-ink-400 mt-2 line-clamp-2 leading-relaxed">${animal.descricao}</p>` : ""}
        </div>
      </div>
      ${ownerActionsHtml}
    </div>
  `;
}

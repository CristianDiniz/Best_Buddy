function bbMissingAnimalCardHtml(item) {
  const cleanPhone = (item.contato || "").replace(/\D/g, "");
  const waBtn = cleanPhone
    ? `<a href="https://wa.me/55${cleanPhone}?text=Olá!%20Vi%20seu%20anúncio%20do%20animal%20desaparecido%20${encodeURIComponent(item.nome || 'pet')}" target="_blank" rel="noopener noreferrer" class="bb-btn bb-btn--sm bb-btn--primary mt-2 inline-flex items-center gap-1 text-xs">
        <span>💬</span> Falar no WhatsApp
      </a>`
    : "";

  return `
    <article class="bb-post-card border-amber-500/40 bg-slate-800/40 p-4 rounded-xl">
      <div class="flex items-center justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="text-base">🚨</span>
          <strong class="text-slate-100">${item.nome || "Pet Desaparecido"}</strong>
        </div>
        <span class="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Desaparecido</span>
      </div>
      <p class="my-1 text-slate-300 text-sm">📍 ${item.local || item.cidade || "Local não informado"}</p>
      <p class="mb-2 text-slate-200 text-sm">${item.descricao || "Sem descrição adicional."}</p>
      <div class="bb-post-card__meta text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
        <span>Contato: <strong>${item.contato || "Validado via WhatsApp"}</strong></span>
        <span>${typeof bbFormatDate === "function" ? bbFormatDate(item.created_at) : ""}</span>
      </div>
      ${waBtn}
    </article>
  `;
}

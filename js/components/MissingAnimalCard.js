function bbMissingAnimalCardHtml(item) {
  return `
    <article class="bb-post-card border-warning/30">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-base">🚨</span>
        <strong class="text-ink-100">${item.nome}</strong>
      </div>
      <p class="my-1.5 text-ink-300 text-sm">📍 ${item.local}</p>
      <p class="mb-2 text-ink-100">${item.descricao}</p>
      <div class="bb-post-card__meta">
        <span>Contato: ${item.contato}</span>
        <span>${bbFormatDate(item.created_at)}</span>
      </div>
    </article>
  `;
}

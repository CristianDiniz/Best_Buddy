function bbAnimalCardHtml(animal) {
  const sexoLabel = animal.sexo === "M" ? "Macho" : animal.sexo === "F" ? "Fêmea" : "Indeterminado";
  const imageHtml = animal.imagem
    ? `<img src="${animal.imagem}" alt="${animal.nome}" class="w-full h-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-110" loading="lazy" />`
    : `<span class="text-[0.7rem] tracking-wide uppercase text-ink-500 mt-1">Sem foto</span>`;

  return `
    <a class="group bb-animal-card" href="/pages/animals/detail.html?id=${animal.id}">
      <div class="bb-animal-card__image flex-col gap-1${animal.imagem ? "" : " bb-animal-card__image--empty"}">${imageHtml}</div>
      <div class="bb-animal-card__body">
        <span class="bb-animal-card__name">${animal.nome}</span>
        <span class="bb-animal-card__meta">${animal.raca || "SRD"} · ${animal.idade_aproximada}</span>
        <span class="bb-animal-card__meta">${sexoLabel}</span>
      </div>
    </a>
  `;
}

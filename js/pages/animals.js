bbRenderNavigation("#bb-nav", "animals");
bbRenderFooter("#bb-footer");

const bbAnimalsEl = document.getElementById("bb-animals");

async function bbLoadAnimals() {
  bbAnimalsEl.innerHTML = bbSkeletonGridHtml(8);
  try {
    const animals = await animalService.list();
    bbAnimalsEl.innerHTML = animals.length
      ? animals.map(bbAnimalCardHtml).join("")
      : bbStateHtml({ title: "Nenhum animal disponível no momento.", description: "Volte em breve para novas opções." });
  } catch (err) {
    bbAnimalsEl.innerHTML = bbStateHtml({ title: "Não foi possível carregar os animais.", description: err.message, isError: true });
  }
}

bbLoadAnimals();

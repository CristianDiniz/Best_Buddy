const adoptionService = {
  /**
   * payload recebido do formulário (js/pages/adoption.js):
   * { animal_id, nome_adotante, email_adotante, telefone_adotante,
   *   ja_teve_animais, ja_vacinado, motivacao }
   *
   * O model Adocao no backend NÃO tem uma FK para Animal nem campos
   * para os dados do adotante — ele duplica os campos do animal
   * (nome, raca, sexo, idade_aproximada, medicamentos, vacinacao) e
   * só tem "contato" + "descricao" livres (ver API_CONTRACT.md,
   * divergência conhecida #4). Por isso, ao usar a API real, buscamos
   * o animal selecionado e remontamos o payload no formato que o
   * backend realmente aceita, guardando os dados do adotante dentro
   * de "descricao".
   */
  async create(payload) {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ id: Date.now(), status: "A", ...payload });
    }

    const animal = await animalService.getById(payload.animal_id);

    const descricao = [
      `Adotante: ${payload.nome_adotante} (${payload.email_adotante})`,
      `Já teve animais: ${payload.ja_teve_animais || "não informado"}`,
      `Vacinação em dia (adotante): ${payload.ja_vacinado || "não informado"}`,
      `Motivação: ${payload.motivacao}`,
    ].join(" | ");

    return bbClient.post("/adocoes/", {
      nome: animal.nome,
      raca: animal.raca,
      sexo: animal.sexo,
      idade_aproximada: animal.idade_aproximada,
      medicamentos: animal.medicamento,
      vacinacao: animal.vacinacao,
      contato: payload.telefone_adotante,
      descricao,
    });
  },
};

# ⚖️ Regras de Negócio (RN)
tags: #regras-de-negocio #rn #politicas #validacoes #best-buddy

As Regras de Negócio estabelecem as diretrizes funcionais e restrições mandatórias do sistema **Best Buddy**. Elas devem ser rigorosamente validadas tanto na camada de apresentação (frontend) quanto, obrigatoriamente, na camada de persistência e validação da API (backend).

---

## 📋 Catálogo de Regras de Negócio

### `RN01` — Acesso e Navegação Pública
* **Regra:** O visitante não autenticado tem direito pleno de navegar, filtrar e visualizar todos os cards do sistema (animais para adoção, animais perdidos, catálogo de serviços e notícias institucionais), bem como acessar o link direto para falar com o tutor via WhatsApp.
* **Fundamentação:** O propósito da plataforma é dar máxima visibilidade aos animais que precisam de um lar e aos pets perdidos. Exigir login para visualização reduziria o alcance das adoções e resgates.

---

### `RN02` — Ações Ativas Exigem Autenticação
* **Regra:** Qualquer ação ativa no sistema (anunciar animal para adoção, reportar animal perdido, solicitar serviço credenciado, pedir upgrade de ONG ou registrar denúncia) exige autenticação ativa do usuário.
* **Comportamento:** Os botões de ação continuam visíveis para o visitante. Ao clicar deslogado, é direcionado para a tela de login/cadastro com preservação da rota de retorno.

---

### `RN03` — Cota de 5 Animais Ativos para Usuários Comuns
* **Regra:** Um usuário com perfil Comum só pode manter ativos simultaneamente no máximo **5 registros de animais** (somatório de anúncios para adoção com status `Disponível` e animais perdidos com status `Perdido`) na tabela unificada `Animal`.
* **Enforcement:** Ao tentar cadastrar o 6º animal ativo, o backend retorna HTTP 400 informando que o limite foi atingido e sugerindo a solicitação de uma conta de ONG caso se trate de entidade com alto volume de animais.

---

### `RN04` — Cota Ilimitada Exclusiva para ONGs
* **Regra:** Usuários com perfil validado de ONG (`tipo_usuario == 'ONG'`) possuem permissão para cadastrar animais para adoção e perdidos sem qualquer limitação numérica, mantendo a exigência de WhatsApp previamente validado.

---

### `RN05` — Titularidade e Isolamento de Edição
* **Regra:** Cada usuário possui controle exclusivo apenas sobre os registros que ele próprio criou (`registro.tutor_id == request.user.id`). Usuários comuns não podem alterar nem excluir cards de terceiros.

---

### `RN06` — Validação de WhatsApp via Twilio Vinculada ao Usuário
* **Regra:** Nenhum animal (seja adoção ou perdido) pode ser cadastrado por usuário com `telefone_validado == False`.
* **Mecanismo:**
  1. O usuário pode criar a conta sem número de telefone de imediato.
  2. Para habilitar o cadastro de animais, o usuário deve informar o telefone e validá-lo via **Twilio Verify (canal WhatsApp)**.
  3. Ao inserir o PIN correto retornado pelo WhatsApp, o número fica vinculado ao usuário e a flag `telefone_validado` é ativada (`True`).
  4. O formulário de animal **não permite digitar outro número**: o contato público é resolvido diretamente via Chave Estrangeira com o cadastro do tutor (`animal.tutor.telefone`).
  5. Se o tutor solicitar alteração de número no perfil, deve revalidar o novo número via Twilio. Após aprovado, o novo número substitui o anterior e reflete automaticamente em todos os anúncios de animais ativos do tutor.
  6. Não existe tabela local de validação de WhatsApp; o serviço é integralmente gerenciado pela API Twilio Verify.

---

### `RN07` — Adoção Direta Peer-to-Peer (Sem Intermediação)
* **Regra:** A plataforma não retém nem intermedeia propostas de adoção através de formulários burocráticos internos. O interessado entra em contato diretamente com o tutor pelo WhatsApp validado. O próprio tutor avalia o adotante e, após a entrega, altera o status do animal para `Adotado` no painel.

---

### `RN08` — Homologação em Duas Etapas para ONGs
* **Regra:** Nenhuma conta se torna ONG de forma automática. O usuário submete formulário institucional com CNPJ, Razão Social e endereço; a solicitação entra com status `Pendente` e só é promovida a `ONG` após homologação formal da Staff.

---

### `RN09` — Homologação em Duas Etapas para Serviços
* **Regra:** Nenhum prestador de serviço ou clínica veterinária é publicado de imediato na vitrine. A proposta entra como `Pendente` e passa por análise da Staff no painel Django antes de se tornar `Aprovado`.

---

### `RN10` — Restrições Operacionais Estritas da Staff
* **Regra:** A Staff atua na moderação com limitações de segurança:
  1. Não pode alterar dados cadastrais de serviços de outros usuários (apenas suspender ou aprovar).
  2. Não pode alterar ou excluir contas de outros membros da Staff ou de SuperUsers.
  3. Não visualiza colunas de auditoria (`created_at` e `updated_at`) no painel.

---

### `RN11` — Denúncias Rastreáveis e Categorizadas
* **Regra:** Toda denúncia exige autenticação obrigatória do denunciante (`denunciante_id NOT NULL`), seleção de categoria via Enum (Maus-tratos, Fraude/Golpe, Dados Falsos, Animal já adotado, Exercício ilegal da profissão, Spam/Ofensivo ou Outro) e justificativa textual. Alvos permitidos: `ADOCAO`, `PERDIDO`, `SERVICO` *(alvo `POST` descontinuado)*.

---

### `RN12` — Ciclo de Vida e Expiração (90 + 30 Dias)
* **Regra:** Anúncios de animais para adoção inativam-se automaticamente aos 90 dias caso não adotados. O tutor possui uma janela de 30 dias (do 91º ao 120º dia) para reativar o anúncio. Aos 120 dias, registros não reativados são permanentemente expurgados por comando automatizado.

---

### `RN13` — Limite de Tamanho de Textos (255 Caracteres)
* **Regra:** Limite máximo estrito de 255 caracteres para a descrição de animais para adoção, informações de animais perdidos e detalhes de serviços profissionais.

---

### `RN14` — Exigência de CRMV para Serviços Veterinários
* **Regra:** Se a proposta de serviço marcar a opção "Serviço Veterinário", o preenchimento do campo `CRMV` é estritamente obrigatório.

---

### `RN15` — Segurança e Confirmação na Edição de Perfil
* **Regra:**
  1. **Alteração de Email:** Exige a confirmação da senha atual. O novo email permanece pendente de confirmação até que o usuário clique no link de revalidação com token criptograficamente assinado.
  2. **Alteração de Senha:** Exige a confirmação da senha atual antes de autorizar a substituição pela nova senha.

---

## 🔗 Próximas Notas Relacionadas
- [[01 - Atores e Matriz de Permissões]] — Perfis e privilégios.
- [[05 - Modelagem de Dados e Relacionamentos]] — Implementação das regras no schema SQL.
- [[02 - Requisitos Funcionais]] — Especificação funcional completa.

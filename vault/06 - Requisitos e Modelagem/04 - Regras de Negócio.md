# ⚖️ Regras de Negócio (RN)
tags: #regras-de-negocio #rn #politicas #validacoes #best-buddy

As Regras de Negócio estabelecem as diretrizes funcionais e restrições mandatórias do sistema **Best Buddy** para o MVP. Elas devem ser rigorosamente validadas tanto na camada de apresentação (frontend) quanto, obrigatoriamente, na camada de persistência e validação da API (backend).

> [!NOTE]
> Regras relacionadas a validação Twilio WhatsApp, contas de ONG, credenciamento de serviços e sistema de denúncias foram migradas para [[08 - Implementações futuras]].

---

## 📋 Catálogo de Regras de Negócio Ativas

### `RN01` — Acesso e Navegação Pública
* **Regra:** O visitante não autenticado tem direito pleno de navegar, filtrar e visualizar todos os cards do sistema (animais para adoção e animais perdidos), bem como acessar o link direto para falar com o tutor via WhatsApp.
* **Fundamentação:** O propósito da plataforma é dar máxima visibilidade aos animais que precisam de um lar e aos pets perdidos. Exigir login para visualização reduziria drasticamente o alcance das adoções e resgates.

---

### `RN02` — Ações Ativas Exigem Autenticação
* **Regra:** Qualquer ação ativa no sistema (anunciar animal para adoção, reportar animal perdido) exige autenticação ativa do usuário.
* **Comportamento:** Os botões de ação continuam visíveis para o visitante. Ao clicar deslogado, é direcionado para a tela de login/cadastro preservando a rota de retorno (`next=/...`).

---

### `RN03` — Cota de 5 Animais Ativos para Usuários
* **Regra:** Cada usuário só pode manter ativos simultaneamente no máximo **5 registros de animais** (somatório de anúncios para adoção com status `Disponível` e animais perdidos com status `Perdido`) na tabela unificada `Animal`.
* **Enforcement:** Ao tentar cadastrar o 6º animal ativo, o backend retorna HTTP 400 informando que o limite foi atingido.

---

### `RN04` — Titularidade e Isolamento de Edição
* **Regra:** Cada usuário possui controle exclusivo apenas sobre os registros que ele próprio criou (`registro.tutor_id == request.user.id`). Usuários comuns não podem alterar nem excluir cards de terceiros.

---

### `RN05` — Adoção Direta Peer-to-Peer (Sem Intermediação)
* **Regra:** A plataforma não retém nem intermedeia propostas de adoção através de formulários burocráticos internos. O interessado entra em contato diretamente com o tutor pelo WhatsApp. O próprio tutor avalia o adotante e, após a entrega, altera o status do animal para `Adotado` no painel. O número de contato do anúncio herda automaticamente o telefone cadastrado no perfil do tutor ou, caso o usuário não possua número no cadastro, permite a digitação manual de telefone no próprio formulário de anúncio.

---

### `RN06` — Ciclo de Vida e Expiração (90 + 30 Dias)
* **Regra:** Anúncios de animais para adoção inativam-se automaticamente aos 90 dias caso não adotados. O tutor possui uma janela de 30 dias (do 91º ao 120º dia) para reativar o anúncio. Aos 120 dias, registros não reativados são permanentemente expurgados por comando automatizado.

---

### `RN07` — Limite de Tamanho de Textos (255 Caracteres)
* **Regra:** Limite máximo estrito de 255 caracteres para a descrição de animais para adoção e informações de animais perdidos.

---

### `RN08` — Segurança e Confirmação na Edição de Perfil
* **Regra:**
  1. **Alteração de Email:** Exige a confirmação da senha atual. Validação estrita de formato de email e unicidade no banco.
  2. **Alteração de Senha:** Exige a confirmação da senha atual antes de autorizar a substituição pela nova senha.

---

### `RN09` — Padronização Geográfica (Estado e Cidade)
* **Regra:**
  1. **Estado (UF):** Deve ser validado estritamente através do conjunto fechado das 27 Unidades Federativas (Enum de 2 caracteres).
  2. **Cidade:** Não deve aceitar grafias livres inconsistentes; deve ser preenchida de forma padronizada (via consulta de CEP/ViaCEP com preenchimento em modo leitura ou via catálogo oficial de municípios do IBGE).

---

## 🔗 Próximas Notas Relacionadas
- [[01 - Atores e Matriz de Permissões]] — Perfis e privilégios.
- [[02 - Requisitos Funcionais]] — Especificação funcional completa.
- [[05 - Modelagem de Dados e Relacionamentos]] — Implementação das regras no schema SQL.
- [[08 - Implementações futuras]] — Regras e módulos postergados.

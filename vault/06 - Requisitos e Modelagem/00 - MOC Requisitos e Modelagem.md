# 📋 Requisitos & Modelagem — Mapa de Conteúdo (MOC)
tags: #moc #requisitos #regras-de-negocio #modelagem #gap-analysis #best-buddy

Este módulo do **Obsidian Vault** reúne a documentação canônica de requisitos funcionais, não funcionais, regras de negócio, modelagem de banco de dados e a auditoria de divergências (**Gap Analysis**) do projeto **Best Buddy**, consolidando as decisões de produto: **tabela única de animais**, **validação de WhatsApp via Twilio**, **tela de edição de perfil** e **descontinuação da função de posts**.

---

## 🗺️ Estrutura da Documentação

### 1. [[01 - Atores e Matriz de Permissões]]
- Mapeamento dos 5 perfis de acesso: Visitante, Usuário Autenticado Comum, Usuário de ONG, Staff e SuperUser.
- Permissões de gestão de perfil (email, senha, WhatsApp via Twilio Verify).
- Matriz de permissões CRUD e restrições operacionais de cada perfil.

### 2. [[02 - Requisitos Funcionais]]
- Catálogo completo de requisitos funcionais categorizado por módulos:
  - Autenticação e Perfil (`RF01`, `RF01.1`: Edição de Perfil com senha atual e revalidação de email, validação de WhatsApp via Twilio Verify).
  - Animais (Tabela unificada `Animal` com `tipo_servico`: Adoção e Perdidos, contato herdado do tutor, cota de 5).
  - Contato Direto para Adoção e Perdidos (via link direto do WhatsApp do tutor validado).
  - Serviços Profissionais e Clínicas (com CRMV).
  - Abandono Completo da Função de Posts (feed descontinuado).
  - Solicitação e Upgrade de ONG.
  - Sistema de Denúncias Autenticado com Enum de Motivos.
  - Painel Administrativo e Políticas da Staff.
  - Rotina Automática de Expiração (90 + 30 dias).

### 3. [[03 - Requisitos Não Funcionais]]
- Critérios de qualidade técnica: **RNF01 a RNF07** (Usabilidade, Mobile-First, Compatibilidade Cross-Browser, Desempenho, Segurança e Criptografia, Integridade de Dados, Arquitetura Desacoplada).

### 4. [[04 - Regras de Negócio]]
- Detalhamento das 15 regras do sistema: **RN01 a RN15** (Cota de 5 animais na tabela unificada, Ilimitado para ONGs, Validação prévia de WhatsApp no perfil via Twilio, Adoção direta peer-to-peer, Denúncia autenticada com enum, Segurança na edição de perfil, Ciclo 90+30 dias, Homologação em 2 etapas, etc.).

### 5. [[05 - Modelagem de Dados e Relacionamentos]]
- Diagrama Entidade-Relacionamento (ERD) completo em Mermaid.
- Dicionário de Dados das tabelas: `Usuario` (com `telefone` e `telefone_validado`), `SolicitacaoOng`, `Animal` (tabela unificada para adoção e perdidos com contato via FK), `Servico`, `Denuncia`.
- Descontinuação formal de `comunidade_post`, `animais_validacaowhatsapp` e `adocoes_adocao`.

### 6. [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]]
- Comparativo direto entre o código atual (`Best_Buddy`) e a especificação consolidada.

### 7. [[07 - Plano de Ação e Roadmap de Implementação]]
- Checklist operacional estruturado em fases para guiar a execução das mudanças.

---

## 🔗 Links Rápidos
- Retornar ao índice geral: [[00 - MOC (Início)]]
- Visão de arquitetura: [[02 - Arquitetura do Sistema]]
- Contratos de API: [[01 - Contrato de API (Endpoints)]]

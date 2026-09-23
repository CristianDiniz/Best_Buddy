# 🐾 Best Buddy — Obsidian Vault (MOC)
tags: #moc #best-buddy #index

Bem-vindo ao **Obsidian Vault** de documentação técnica, integração e roadmap do projeto **Best Buddy**.

Este repositório de notas documenta tanto o **Backend Django REST** quanto o **Frontend Tailwind/Vanilla JS**, mapeando todas as funcionalidades, contratos de API, divergências encontradas, estado dos bancos de dados (SQLite e migração planejada para MySQL) e o plano de ação detalhado.

---

## 🗺️ Mapa de Conteúdo (MOC)

### 📌 00 - Visão Geral & Arquitetura
- [[01 - Visão Geral do Projeto]] — Contexto, proposta da ONG, histórico e estrutura dos repositórios.
- [[02 - Arquitetura do Sistema]] — Visão de arquitetura desacoplada, fluxo de comunicação e tecnologias.
- [[03 - Transição SQLite para MySQL]] — Estratégia de banco de dados atual (SQLite) e guia de migração para MySQL.

### 🎨 01 - Frontend (Best_Buddy/frontend)
- [[01 - Estrutura e Tecnologias]] — Organização de pastas, Vanilla JS + Tailwind, sem build no deploy.
- [[02 - Fluxos de Telas e Páginas]] — Detalhamento de cada tela (Auth, Home, Animais, Adoção, Comunidade).
- [[03 - Serviços e Camada de API]] — Como funcionam `bbClient`, `bbStorage` e os `services`.
- [[04 - Mocks e Modo Desacoplado]] — Funcionamento do toggle `USE_MOCKS`, latência artificial e dados fake.
- [[05 - Design System e Tailwind]] — Paleta de cores, tipografia, `@apply`, microanimações e tokens.

### ⚙️ 02 - Backend (Best_Buddy - Django REST)
- [[01 - Arquitetura Django REST]] — Configurações centrais, apps instaladas, middlewares e JWT.
- [[02 - App Usuários e Autenticação]] — Modelo customizado `Usuario`, perfis PF/PJ, registro e pendências.
- [[03 - App Animais]] — Modelagem atual, serializers, permissões e correção de tabela.
- [[04 - App Adoções]] — Análise crítica do modelo atual (desacoplado do animal) e proposta de reformulação.
- [[05 - App Comunidade (Planejamento)]] — Especificação completa do novo app a ser criado no Django.

### 🔗 03 - Integração & Contratos de API
- [[01 - Contrato de API (Endpoints)]] — Especificação completa dos endpoints esperados pelo front.
- [[02 - Matriz de Divergências (Front vs Back)]] — Tabela comparativa do que o front envia vs o que o back aceita.
- [[03 - Fluxo de Autenticação JWT]] — Ciclo de vida dos tokens de acesso/refresh e armazenamento de sessão.

### 📊 04 - Status & Funcionalidades
- [[01 - Matriz de Funcionalidades (O que funciona)]] — Inventário funcional: o que roda no front mock, no front real e no back.
- [[02 - Diagnóstico dos Bugs Atuais]] — Análise de causa raiz (RCA) dos problemas críticos (tabela SQLite, serializers, etc.).

### 🚀 05 - Tarefas & Roadmap
- [[01 - Checklist de Correções Imediatas]] — Passo a passo prioritário para fazer Front e Back conversarem.
- [[02 - Tarefas Backend (Django)]] — Especificação de código para models, views, serializers e URLs.
- [[03 - Tarefas Frontend (Melhorias)]] — Ajustes na integração real, saudação do usuário e modal de desaparecidos.
- [[04 - Guia de Execução e Testes]] — Como rodar ambos os projetos localmente e testar ponta a ponta.
- [[05 - Configuração e Uso do Docker]] — Como executar todo o ecossistema (Django + MySQL + Nginx) via Docker Compose.
- [[06 - Guia de Alinhamento da Equipe e Novo Roadmap]] — Guia para a reunião de alinhamento: permissões, tabelas, dúvidas e divisão de tarefas.

### 📋 06 - Requisitos & Modelagem (Auditado)
- [[00 - MOC Requisitos e Modelagem]] — Índice central da especificação canônica do sistema.
- [[01 - Atores e Matriz de Permissões]] — Visitante, Comum, ONG, Staff e SuperUser com restrições e poderes.
- [[02 - Requisitos Funcionais]] — RF01 a RF40 categorizados por módulos funcionais.
- [[03 - Requisitos Não Funcionais]] — RNF01 a RNF07 com métricas e critérios de aceitação.
- [[04 - Regras de Negócio]] — RN01 a RN12 (Cota de 5, ilimitado para ONGs, ciclo 90+30 dias, moderação).
- [[05 - Modelagem de Dados e Relacionamentos]] — Diagrama ERD em Mermaid e Dicionário de 8 tabelas.
- [[06 - Matriz de Gap Analysis (O que Adicionar, Ajustar e Remover)]] — Confronto direto: código atual vs requisitos.
- [[07 - Plano de Ação e Roadmap de Implementação]] — Cronograma detalhado em 5 fases de execução.


---

## ⚡ Status Rápido do Projeto

| Componente | Estado Atual | Detalhes / Última Atualização |
| :--- | :--- | :--- |
| **Frontend (Mock)** | 🟢 100% Funcional | Mantido como fallback offline em `js/mocks/`. |
| **Frontend (API Real)** | 🟢 100% Integrado | `authService.login` captura `data.user`, exibindo nome e avatar no header. |
| **Backend (Auth)** | 🟢 100% Funcional | Retorno de `user` no JWT (`CustomTokenObtainPairSerializer`) e CPF validado no registro. |
| **Backend (Animais)** | 🟢 100% Funcional | Tabela `animais_animal` corrigida, campos `descricao` e `imagem` adicionados, leitura pública liberada. |
| **Backend (Adoções)** | 🟢 100% Funcional | Modelo `Adocao` refatorado com `ForeignKey('Animal')` e dados do adotante integrados. |
| **Backend (Comunidade)**| 🟢 100% Funcional | App `comunidade` criado com Notícias, Posts e Animais Desaparecidos. |
| **Banco de Dados** | 🟢 SQLite + MySQL | SQLite migrado e populado com seed; MySQL 8.0 configurado no Docker com charset `utf8mb4`. |
| **Docker & DevOps** | 🟢 100% Operacional | `docker-compose.yml` orquestrando Nginx, Django e MySQL com seed e migrações automáticas. |
| **Testes Automatizados** | 🟢 9/9 Passando | Suíte de testes `test_endpoints.py` validando todos os fluxos com código 0. |


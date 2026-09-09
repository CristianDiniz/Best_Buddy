# Best Buddy — Front-end

Front-end estático (HTML/JS puro, sem build step **no deploy**), desenvolvido
de forma **desacoplada** do backend Django. Enquanto o backend não está
pronto/corrigido, todas as telas funcionam com dados mockados localmente.

O CSS é gerado com **Tailwind CSS**, mas o build é feito localmente/no CI e o
resultado (`css/tailwind.build.css`) fica versionado — então o GitHub Pages
continua publicando arquivos estáticos puros, sem precisar rodar Node no
deploy.

## Rodando localmente

Não há build necessário para só visualizar o site — o CSS já vem compilado
em `css/tailwind.build.css`. Basta servir a pasta como arquivos estáticos:

```bash
python -m http.server 5500
```

Depois acesse `http://localhost:5500`. Você será redirecionado para o login.

Login de teste (modo mock): `usuario@bestbuddy.com` / `123456`

### Editando estilos (Tailwind)

Só é necessário rodar o Tailwind se você for **alterar** classes/estilos:

```bash
npm install              # uma vez, instala o Tailwind CLI
npm run build:css        # build único, minificado
npm run watch:css        # rebuilda automaticamente enquanto você edita
```

O arquivo editável é `css/src/input.css` (usa `@apply` sobre as classes
`bb-*` do projeto) + `tailwind.config.js` (paleta, fontes, animações,
sombras — os mesmos tokens que existiam em `tokens.css`). O arquivo
`css/tailwind.build.css` é **gerado**, não deve ser editado à mão — sempre
rode o build antes de commitar uma mudança de estilo.

## Estrutura

```
frontend/
├── index.html                 # redireciona para login ou home
├── tailwind.config.js         # tokens (cores, fontes, sombras, animações)
├── package.json                # script build:css / watch:css
├── pages/
│   ├── auth/                  # login, register, forgot-password
│   ├── home/
│   ├── community/
│   ├── animals/                # index (listagem) e detail
│   └── adoption/                # create
├── js/
│   ├── config.js               # toggle mock vs API real
│   ├── api/client.js            # cliente HTTP fino (fetch)
│   ├── mocks/                  # dados fake + helpers de latência
│   ├── services/                # authService, animalService, adoptionService, communityService
│   ├── components/              # Navigation, Footer, AnimalCard, PostCard, etc.
│   ├── pages/                  # lógica específica de cada página
│   └── utils/                  # storage, validation, auth-guard
├── css/
│   ├── src/input.css           # fonte do Tailwind (@apply dos componentes bb-*, animações)
│   └── tailwind.build.css      # CSS gerado (minificado) — o que as páginas carregam
└── .github/workflows/deploy.yml # CI/deploy para GitHub Pages
```

## Alternando entre mock e backend real

Edite `js/config.js`:

```js
window.BB_CONFIG = {
  USE_MOCKS: false, // true = dados fake, false = backend real
  API_BASE_URL: "https://sua-api.exemplo.com/api",
};
```

Nenhuma página ou componente precisa mudar — todos chamam os `services`,
que decidem internamente se usam mock ou `bbClient` (fetch real).

## Contrato de API esperado

Veja [`API_CONTRACT.md`](./API_CONTRACT.md). Esse é o contrato que o front-end
foi construído para consumir — pode não bater 100% com o backend atual
(há inconsistências conhecidas entre models/serializers no backend hoje).
Use esse documento como referência para alinhar o backend.

## Deploy (GitHub Pages)

O workflow em `.github/workflows/deploy.yml` publica a raiz do repositório
como site estático a cada push em `main`. Ative em
**Settings → Pages → Source: GitHub Actions** no repositório.
Como `css/tailwind.build.css` já vai commitado, o deploy continua sem
nenhum passo de build.

## Padrões usados

- Sem framework — HTML + JS puro com pequenas convenções de "componente"
  (funções que retornam/injetam HTML).
- Estilo com **Tailwind CSS**: os tokens de cor/tipografia/espaçamento que
  antes viviam em `tokens.css` agora estão em `tailwind.config.js`; as
  classes `bb-*` continuam existindo (então nenhum HTML/JS precisou trocar
  de nome de classe), só que agora são compostas com `@apply` em
  `css/src/input.css`.
- Microanimações (fade-in, hover com elevação, shimmer de loading) via
  utilitários Tailwind customizados — respeitam `prefers-reduced-motion`.
- Toda tela autenticada carrega `js/utils/auth-guard.js`, que redireciona
  para o login se não houver sessão.
- Todo formulário trata: validação client-side, estado de loading no botão,
  erro vindo da API e (na adoção) prevenção de envio duplicado.


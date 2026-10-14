# 🖼️ Guia de Otimização e Compressão de Imagens (Pillow & WebP)
tags: #backend #pillow #webp #performance #imagens #animais #roadmap

Este documento é um guia passo a passo para implementar o processamento automático, redimensionamento e conversão de imagens de animais para o formato moderno **WebP**, economizando até **90% de espaço em disco e consumo de banda**.

---

## 📌 1. Motivação e Diagnóstico Atual

### Como funciona hoje:
1. O usuário faz o upload de uma foto no formulário de cadastro/edição de animal.
2. O sistema valida se tem até **5 MB** e se a extensão é `.jpg`, `.jpeg` ou `.png`.
3. O Django salva o arquivo **exatamente como foi enviado** (resolução original de câmeras modernas, frequentemente `4000x3000px`, pesando de 2 a 5 MB por foto).
4. O frontend carrega esses arquivos brutos em cards pequenos (`~300x300px`), resultando em:
   - Lentidão no carregamento da página (LCP prejudicado).
   - Consumo desnecessário de dados móveis pelo usuário.
   - Ocupação rápida do armazenamento do servidor/volume Docker.

### Objetivo da Otimização:
- **Redimensionar proporcionalmente:** Capped em no máximo `1080px` de largura ou altura (padrão ideal para web/mobile).
- **Corrigir orientação EXIF:** Evitar que fotos tiradas em celulares apareçam giradas/de cabeça para baixo.
- **Converter para WebP:** Qualidade 85% com compressão otimizada.
- **Resultado:** Fotos de 3–5 MB são reduzidas para **~100 KB a 250 KB** sem perda perceptível de qualidade aos olhos do usuário.

---

## 🗺️ Fluxograma do Processo

```
[ Upload do Usuário (JPG/PNG até 5MB) ]
                  │
                  ▼
         [ Animal.save() ]
                  │
        É um arquivo novo? (isinstance UploadedFile)
         /              \
       [NÃO]           [SIM]
        │                │
        │                ▼
        │     [ animais/utils.py: otimizar_imagem_animal() ]
        │         1. Corrige rotação EXIF (ImageOps.exif_transpose)
        │         2. Garante modo de cor compatível (RGB/RGBA)
        │         3. Redimensiona proporcionalmente (.thumbnail(1080, 1080))
        │         4. Comprime e exporta como WEBP (Pillow -> BytesIO)
        │         5. Retorna ContentFile com extensão .webp
        │                │
        ▼                ▼
   [ Salva registro no Banco e arquivo otimizado em media/animais/ ]
```

---

## 🛠️ Passo a Passo da Implementação

### Passo 1: Criar o Módulo Utilitário (`animais/utils.py`)

Crie o arquivo `animais/utils.py` para isolar a regra de negócio de manipulação de mídia:

```python
import io
import os
from PIL import Image, ImageOps
from django.core.files.base import ContentFile


def otimizar_imagem_animal(campo_imagem, max_dimensao=1080, qualidade=85):
    """
    Processa e otimiza a imagem recebida:
    1. Corrige rotação física com base nas tags EXIF de celulares.
    2. Converte modos de cor especiais para garantir compatibilidade.
    3. Redimensiona proporcionalmente para não ultrapassar max_dimensao.
    4. Converte e comprime para formato WEBP em memória.
    5. Retorna um ContentFile com extensão .webp pronto para o ImageField.
    """
    if not campo_imagem:
        return campo_imagem

    # Abre a imagem a partir do arquivo enviado
    img = Image.open(campo_imagem)

    # 1. Trata orientação EXIF (fotos de smartphone)
    img = ImageOps.exif_transpose(img)

    # 2. Trata modos de cores (evita quebra com transparência PNG ou CMYK)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    # 3. Redimensiona mantendo a proporção (downscale inteligente)
    img.thumbnail((max_dimensao, max_dimensao), Image.Resampling.LANCZOS)

    # 4. Salva a imagem comprimida no buffer de memória
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=qualidade, optimize=True)
    buffer.seek(0)

    # 5. Gera o novo nome trocando a extensão original por .webp
    nome_base, _ = os.path.splitext(campo_imagem.name)
    novo_nome = f"{nome_base}.webp"

    return ContentFile(buffer.getvalue(), name=novo_nome)
```

#### 🔍 Entendendo a função linha a linha:
* **`if not campo_imagem: return campo_imagem`**: Cláusula de guarda. Se nenhum arquivo foi enviado (campo vazio ou `None`), devolve o objeto original imediatamente e evita erros.
* **`img = Image.open(campo_imagem)`**: O Pillow abre a imagem a partir do fluxo de bytes em memória do Django, sem precisar gravá-la em disco.
* **`ImageOps.exif_transpose(img)`**: Corrige a orientação física baseada nos metadados EXIF gravados por smartphones (evita que fotos tiradas em pé fiquem deitadas ou de cabeça para baixo).
* **Tratamento de cores (`RGB` vs. `RGBA`)**: Converte adequadamente os modos de cor. Preserva o canal alfa se houver transparência (`RGBA` ou paleta indexada `P` com transparência) e converte outros formatos (como `CMYK` ou tons de cinza) para `RGB`, evitando falhas na codificação WebP.
* **`img.thumbnail((max_dimensao, max_dimensao), Image.Resampling.LANCZOS)`**: Redimensionamento proporcional inteligente (*downscale*). Mantém a proporção exata sem distorcer, não amplia fotos menores que 1080px e utiliza o algoritmo matemático Lanczos para produzir a máxima nitidez possível.
* **Buffer em RAM (`io.BytesIO`)**: Salva o WebP diretamente em memória RAM (`format="WEBP"`, `quality=85`, `optimize=True`), proporcionando processamento veloz sem dependência de I/O de disco temporário.
* **`os.path.splitext` e `novo_nome`**: Separa o nome original da extensão antiga e gera o novo nome terminando em `.webp` (ex: `rex.jpg` -> `rex.webp`).
* **`ContentFile(...)`**: Encapsula os bytes do buffer num objeto nativo do Django (`ContentFile`), pronto para ser salvo e manipulado pelo `models.ImageField`.

---

### Passo 2: Atualizar o Modelo `Animal` (`animais/models.py`)

No modelo `Animal`:
1. Atualize os validadores do campo `imagem` para permitir `.webp`.
2. Sobrescreva o método `save()` para disparar a otimização apenas quando houver **novo upload** (evitando reprocessamento em edições normais de texto).

```python
# No topo de animais/models.py:
from django.core.files.uploadedfile import UploadedFile
from .utils import otimizar_imagem_animal

# No campo imagem da classe Animal:
    imagem = models.ImageField(
        upload_to='animais/',
        blank=True,
        null=True,
        verbose_name="Foto do animal",
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
            validar_tamanho_imagem
        ]
    )

# No final da classe Animal:
    def save(self, *args, **kwargs):
        # Verifica se há imagem e se ela é um arquivo recém-enviado pelo cliente
        if self.imagem and hasattr(self.imagem, 'file'):
            if isinstance(self.imagem.file, UploadedFile):
                self.imagem = otimizar_imagem_animal(self.imagem)

        super().save(*args, **kwargs)
```

---

### Passo 3: Atualizar Validações e Filtros no Frontend

1. **No arquivo HTML de cadastro (`frontend/pages/animals/...` ou no input do modal):**
   Garantir que o seletor aceite `.webp`:
   ```html
   <input type="file" id="pet-imagem" accept="image/jpeg,image/png,image/webp" ... />
   ```

2. **No arquivo JavaScript (`frontend/js/pages/animals.js`):**
   Atualize as funções de checagem de tipo MIME e extensão para aceitar WebP:
   ```javascript
   function isValidImageType(file) {
     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
     const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
     // ... manter sua lógica incluindo webp ...
   }
   ```

---

## 🧪 3. Checklist de Testes e Validação

- [ ] **Upload de imagem grande (3 MB - 5 MB JPG):**
  - Cadastre um pet com uma foto pesada.
  - Verifique na pasta `media/animais/` se o arquivo gerado tem extensão `.webp`.
  - Verifique o tamanho do arquivo final no Explorer/Terminal (deve estar em torno de 100 KB - 250 KB).
- [ ] **Foto de celular na vertical:**
  - Teste enviando uma foto tirada na vertical com celular.
  - Verifique no card da home se a foto foi mantida em pé (graças ao `exif_transpose`).
- [ ] **Edição de dados sem troca de foto:**
  - Abra o modal de edição do animal e altere apenas a descrição ou o status.
  - Salve e confirme que a imagem não foi corrompida ou processada repetidamente.
- [ ] **Transparência PNG:**
  - Envie um PNG com fundo transparente e valide se o WebP manteve a transparência perfeitamente.

---

## 💡 Dicas e Cuidados Importantes

1. **Por que usar `io.BytesIO` e `ContentFile`?**
   O Django processa uploads em memória (`InMemoryUploadedFile`) ou em arquivos temporários. O uso do `io.BytesIO` permite redimensionar e converter a foto totalmente na memória RAM, sem precisar escrever um arquivo intermediário no disco rígido.
2. **Impacto no Banco de Dados:**
   Nenhuma migração estrutural é necessária! O campo `imagem` continua sendo um `models.ImageField`. O Django apenas salvará a string do caminho terminada em `.webp`.
3. **Pillow no `requirements.txt`:**
   O pacote `Pillow>=10.0.0` já está configurado no projeto e instalado no container backend.
4. **Decisão de Arquitetura: Por que processar no `Model.save()` e não no Serializer?**
   - **Centralização e Integridade:** Executar a otimização no `Animal.save()` garante que a imagem seja otimizada em **qualquer ponto de entrada** (API REST via frontend, Django Admin, scripts de carga, seeders ou tarefas em segundo plano). Se ficasse no Serializer, cadastros pelo Admin passariam direto com imagens pesadas.
   - **Tráfego de Rede vs. Backend:** O upload do cliente até o servidor trafega como `multipart/form-data`. Seja a lógica chamada no Serializer ou no Model, o backend só executa o código após a requisição HTTP inteira ter chegado. Portanto, manter no Model é a abordagem mais segura e coesa.
   - **Estratégia de Dupla Camada (Evolução Futura):** Caso queira poupar banda do usuário em conexões 4G lentas e tornar o upload instantâneo, a melhor prática é adicionar uma pré-compressão no **Frontend** (via Canvas API ou lib como `browser-image-compression`) antes do envio pela rede, mantendo esta função no Django como a garantia final de segurança e padronização.


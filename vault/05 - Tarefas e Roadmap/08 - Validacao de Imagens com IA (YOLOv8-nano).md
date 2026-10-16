# 🤖 Arquitetura e Plano de Implementação: Validação de Fotos com IA (YOLOv8-nano)
tags: #backend #ia #computervision #yolov8 #ultralytics #onnx #segurança #qualidade-dados #roadmap #sprint5

Este documento detalha o funcionamento, a arquitetura e o **plano passo a passo de implementação** do validador inteligente de imagens no **Best Buddy**. O objetivo é impedir que usuários cadastrem anúncios com fotos inadequadas (carros, paisagens, fotos pessoais sem animais, documentos, memes ou conteúdos impróprios), garantindo a confiabilidade da vitrine de adoção e resgate.

---

## 📌 1. Motivação e Objetivos do Negócio

1. **Evitar Poluição da Vitrine de Animais:**
   - Em plataformas colaborativas de adoção, usuários podem subir por engano ou má-fé imagens que não têm relação com animais de estimação.
2. **Consistência dos Dados:**
   - Garantir que o campo selecionado no cadastro (`tipo_animal: CACHORRO | GATO`) tenha correspondência direta com o que foi fotografado.
3. **Custo Zero e Privacidade Total:**
   - Em vez de pagar por APIs externas (Google Cloud Vision, AWS Rekognition) ou enviar as fotos dos usuários para servidores de terceiros, o modelo roda **localmente na CPU do container Django**, de forma 100% offline e sem custos recorrentes.
4. **Sem Fricção para Fotos Reais:**
   - Não bloquear fotos em que o tutor aparece abraçado com o pet; o sistema deve aprovar a imagem desde que o animal esteja presente com nível de confiança adequado.

---

## 🧠 2. Como Funciona o YOLOv8-nano por Baixo dos Panos

### 2.1 O que é o YOLO (*You Only Look Once*)?
O YOLO revolucionou a visão computacional ao abandonar a técnica de "janela deslizante" (que fatiou a imagem em pedaços e executava centenas de classificações lentas). 
* Ele trata a detecção de objetos como um **único problema de regressão direto**: passa a imagem inteira pela rede neural convolucional uma única vez.
* Prevê simultaneamente **onde os objetos estão** (caixas delimitadoras) e **o que eles são** (probabilidade de classes).

### 2.2 O que é a variante Nano (`yolov8n`)?
A Ultralytics disponibiliza o YOLOv8 em 5 escalas: *Nano, Small, Medium, Large e XLarge*.
* O **YOLOv8-nano** é a versão mais compacta:
  * **Tamanho do modelo:** ~6 MB (`yolov8n.pt` ou `yolov8n.onnx`).
  * **Parâmetros:** ~3,2 milhões (comparado a 68M+ do modelo XLarge).
  * **Latência de inferência:** **20 a 45 milissegundos** executando puramente na CPU (Intel/AMD) do servidor, sem necessidade de GPU (placa de vídeo).
  * **Consumo de RAM:** ~80 MB a 120 MB durante o carregamento inicial em memória.

### 2.3 O Dataset COCO e as Classes Reconhecidas
O modelo vem pré-treinado no dataset **COCO** (*Common Objects in Context*), que contém 80 classes universais. As classes de interesse do Best Buddy já vêm mapeadas de fábrica:

| ID COCO | Rótulo em Inglês (`cls_name`) | Tradução / Uso no Best Buddy |
| :---: | :---: | :--- |
| **16** | `dog` | Cão (todas as raças, portes e filhotes) |
| **15** | `cat` | Gato (todas as raças e pelagens) |
| **14** | `bird` | Pássaro / Ave |
| **17** | `horse` | Cavalo (animais de grande porte em ONGs rurais) |
| **0** | `person` | Pessoa / Tutor |

### 2.4 O que a saída do modelo entrega para o código:
Para cada objeto detectado na foto, o modelo disponibiliza:
1. `box.cls`: ID da classe detectada (ex: `16`).
2. `r.names[cls_id]`: Nome legível da classe (ex: `'dog'`).
3. `box.conf`: Confiança probabilística de 0.0 a 1.0 (ex: `0.94` = 94% de certeza).
4. `box.xyxy`: Coordenadas retangulares `[x1, y1, x2, y2]` da posição do animal na imagem.

---

## 🎯 3. Matriz de Decisão e Regras de Negócio

```
                                  [ Upload da Foto ]
                                          │
                                          ▼
                         [ Execução do YOLOv8-nano na CPU ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         Nenhum 'dog' ou 'cat'                           Detectou 'dog' ou 'cat'
         com conf >= 0.50                                com conf >= 0.50
                  │                                               │
                  ▼                                               ▼
      ┌────────────────────────┐                    ┌────────────────────────────┐
      │  REJEITA (HTTP 400)    │                    │  Há divergência grave?     │
      │  "Nenhum animal foi    │                    │  (Selecionou GATO mas a    │
      │   identificado na foto"│                    │   foto é 95% CÃO?)         │
      └────────────────────────┘                    └─────────────┬──────────────┘
                                                                  │
                                                ┌─────────────────┴─────────────────┐
                                                ▼                                   ▼
                                              SIM                                  NÃO
                                       ┌───────────────┐                  ┌───────────────────┐
                                       │ REJEITA /     │                  │ APROVADO!         │
                                       │ ALERTA        │                  │ Continua pipeline │
                                       │ FORMULÁRIO    │                  │ de compressão     │
                                       └───────────────┘                  └───────────────────┘
```

### Casos Práticos de Teste:
* ✅ **Caso 1 (Cachorro/Gato isolado):** O modelo acha `dog` ou `cat` com confiança $> 80\%$. **Aprovado.**
* ✅ **Caso 2 (Tutor segurando o pet):** O modelo acha `person` (0.92) e `dog` (0.85). Como `dog` está presente com confiança suficiente, **Aprovado.**
* ❌ **Caso 3 (Selfie do tutor sem animal):** O modelo acha apenas `person` (0.95). Como não há `dog` ou `cat`, **Bloqueado.**
* ❌ **Caso 4 (Foto de carro, objeto, documento ou meme):** O modelo acha `car`, `cell phone` ou nenhuma classe de pet. **Bloqueado.**
* ❌ **Caso 5 (Confiança insuficiente):** O modelo acha um borrão com confiança de apenas 20% (`conf = 0.20`). Como está abaixo do limiar de 50%, **Bloqueado com aviso para enviar foto mais nítida.**

---

## 🛠️ 4. Plano Passo a Passo de Implementação

### Fase 1: Arquitetura Leve de Runtime (ONNX Runtime vs PyTorch)
> [!TIP]
> **Decisão Técnica de Engenharia:**
> A biblioteca padrão `torch` (PyTorch) pesa cerca de **700 MB a 1 GB** no build do Docker. 
> Para manter o container leve e rápido, o YOLOv8 pode ser exportado para o formato padrão da indústria **ONNX** (`yolov8n.onnx`, apenas **6 MB**). A biblioteca `onnxruntime` pesa apenas **~15 MB** e consome fração mínima de memória.

#### Opção A (Rápida com Ultralytics):
```txt
# requirements.txt
ultralytics>=8.0.0
```

#### Opção B (Ultraleve para Produção - Recomendada):
```txt
# requirements.txt
onnxruntime>=1.16.0
numpy>=1.24.0
Pillow>=10.0.0
```

---

### Fase 2: Criação do Validador no Backend (`animais/ai_validator.py`)

Criar o módulo dedicado com padrão **Singleton** (carrega os pesos da rede neural apenas uma vez quando a aplicação sobe):

```python
"""
animais/ai_validator.py
Validador de imagens baseado em Inteligência Artificial (YOLOv8-nano).
"""
import logging
from PIL import Image

logger = logging.getLogger(__name__)

# Classes permitidas no Best Buddy
CLASSES_PETS = {'dog', 'cat'}
CONFIANCA_MINIMA = 0.50  # 50% de certeza mínima

_yolo_model = None

def get_detector():
    """Carrega o modelo em memória sob demanda (Singleton)."""
    global _yolo_model
    if _yolo_model is None:
        try:
            from ultralytics import YOLO
            # Carrega o modelo de 6MB (baixa automaticamente no 1º boot ou usa arquivo local)
            _yolo_model = YOLO('yolov8n.pt')
            logger.info("YOLOv8-nano carregado com sucesso em memória.")
        except Exception as e:
            logger.error(f"Falha ao carregar modelo YOLOv8: {e}")
            return None
    return _yolo_model


def validar_imagem_pet(arquivo_imagem, tipo_esperado=None):
    """
    Inspeciona a imagem e retorna:
      (sucesso: bool, mensagem_erro: str, classes_detectadas: list)
    """
    detector = get_detector()
    if detector is None:
        # Fallback de segurança: se o modelo falhar em carregar, não trava o upload
        logger.warning("Validador IA indisponível. Foto aprovada por fallback.")
        return True, "", []

    try:
        # Abre com Pillow a partir do buffer em memória
        img = Image.open(arquivo_imagem)
        resultados = detector(img, verbose=False)

        pets_encontrados = []
        for r in resultados:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = r.names[cls_id]
                conf = float(box.conf[0])

                if cls_name in CLASSES_PETS and conf >= CONFIANCA_MINIMA:
                    pets_encontrados.append((cls_name, conf))

        # Se nenhum pet foi reconhecido
        if not pets_encontrados:
            return False, "Nenhum animal (cão ou gato) foi identificado com clareza nesta imagem. Por favor, envie uma foto nítida do pet.", []

        # Validação cruzada com o tipo de animal selecionado
        if tipo_esperado:
            mapa = {'CACHORRO': 'dog', 'GATO': 'cat'}
            esperado = mapa.get(tipo_esperado.upper())
            if esperado:
                tem_esperado = any(nome == esperado for nome, _ in pets_encontrados)
                if not tem_esperado:
                    nome_legivel = "cachorro" if esperado == "dog" else "gato"
                    return False, f"O anúncio indica um {nome_legivel}, mas a imagem enviada parece ser incompatível.", pets_encontrados

        return True, "", pets_encontrados

    except Exception as e:
        logger.error(f"Erro durante a inferência da imagem com IA: {e}")
        # Em caso de erro técnico na leitura, não impede a operação do usuário
        return True, "", []
```

---

### Fase 3: Integração no Serializer do Django (`animais/serializers.py`)

No serializer de criação e atualização de animais:

```python
from rest_framework import serializers
from .models import Animal
from .ai_validator import validar_imagem_pet

class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = '__all__'

    def validate(self, attrs):
        imagem = attrs.get('imagem')
        tipo_animal = attrs.get('tipo_animal') or (self.instance.tipo_animal if self.instance else None)

        # Se uma nova imagem foi enviada no payload
        if imagem and hasattr(imagem, 'file'):
            valido, erro_msg, _ = validar_imagem_pet(imagem.file, tipo_esperado=tipo_animal)
            if not valido:
                raise serializers.ValidationError({
                    "imagem": erro_msg
                })

        return super().validate(attrs)
```

---

### Fase 4: Feedback no Frontend (`pages/animals/index.html` e `animals.js`)

Quando o backend responder com `400 Bad Request` contendo o campo `"imagem"`:
1. O modal de cadastro (`+ Anunciar Pet` ou `+ Reportar Perdido`) destaca a área de upload da foto com borda vermelha (`bb-input--error`).
2. Uma mensagem de alerta amigável e explicativa é renderizada:
   > *"🐾 Não conseguimos identificar claramente seu bichinho nessa foto. Verifique se a imagem está nítida e bem iluminada."*
3. Permite que o tutor troque de foto instantaneamente sem perder o preenchimento dos outros campos (nome, telefone, cidade, descrição).

---

## 📅 5. Integração com o Roadmap do Projeto

* **Sprint:** **Sprint 5** (*Moderação, Qualidade dos Dados e Conformidade*).
* **Dependência:** Atua logo após a Camada 1 de compressão WebP do frontend (`image-compressor.js`) e antes do salvamento definitivo no banco de dados.
* **Documentos Sincronizados no Vault:**
  * [[00 - MOC Tarefas e Roadmap]]
  * [[02 - Tarefas Backend (Django)]]
  * [[06 - Guia de Alinhamento da Equipe e Novo Roadmap]]
  * [[07 - Otimizacao de Imagens (Pillow e WebP)]]

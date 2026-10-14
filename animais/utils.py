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
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
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


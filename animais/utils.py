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

    # 1. Abre a imagem a partir do arquivo enviado
    try:
        img = Image.open(campo_imagem)
    except Exception:
        # Se não for possível ler como imagem, devolve o objeto original
        return campo_imagem

    nome_original = getattr(campo_imagem, 'name', '') or ''
    tamanho_bytes = getattr(campo_imagem, 'size', 0) or 0
    formato_imagem = (getattr(img, 'format', '') or '').upper()

    # 2. FAST-PATH: Se já foi otimizada no front (WebP, <= 1MB e dimensões <= max_dimensao)
    if (
        formato_imagem == 'WEBP'
        and tamanho_bytes <= 1024 * 1024
        and img.width <= max_dimensao
        and img.height <= max_dimensao
    ):
        if hasattr(campo_imagem, 'seek'):
            campo_imagem.seek(0)
        return campo_imagem

    # 3. SLOW-PATH (Fallback para uploads via Admin, scripts ou arquivos não-otimizados):
    # Trata orientação EXIF (fotos de smartphone)
    img = ImageOps.exif_transpose(img)

    # Trata modos de cores (evita quebra com transparência PNG ou CMYK)
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


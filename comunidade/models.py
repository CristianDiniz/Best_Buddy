from django.db import models
from django.conf import settings

class Noticia(models.Model):
    titulo = models.CharField(max_length=200, verbose_name="Título")
    resumo = models.TextField(verbose_name="Resumo / Subtítulo")
    conteudo = models.TextField(blank=True, verbose_name="Conteúdo Completo")
    imagem = models.CharField(max_length=500, null=True, blank=True, verbose_name="URL da Imagem")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")

    class Meta:
        verbose_name = "Notícia"
        verbose_name_plural = "Notícias"
        ordering = ['-created_at']

    def __str__(self):
        return self.titulo


class Post(models.Model):
    autor = models.CharField(max_length=100, verbose_name="Nome do Autor")
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="comunidade_posts",
        verbose_name="Usuário"
    )
    texto = models.TextField(max_length=1000, verbose_name="Texto do Post")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")

    class Meta:
        verbose_name = "Post da Comunidade"
        verbose_name_plural = "Posts da Comunidade"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.autor}: {self.texto[:30]}..."


class AnimalDesaparecido(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Animal")
    local = models.CharField(max_length=200, verbose_name="Último local visto")
    contato = models.CharField(max_length=50, verbose_name="Contato do Tutor")
    descricao = models.TextField(verbose_name="Descrição do Animal")
    foto = models.CharField(max_length=500, null=True, blank=True, verbose_name="URL da Foto")
    encontrado = models.BooleanField(default=False, verbose_name="Já foi encontrado?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Registro")

    class Meta:
        verbose_name = "Animal Desaparecido"
        verbose_name_plural = "Animais Desaparecidos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nome} ({self.local})"

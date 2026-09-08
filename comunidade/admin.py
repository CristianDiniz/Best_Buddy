from django.contrib import admin
from .models import Noticia, Post, AnimalDesaparecido

@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'created_at')
    search_fields = ('titulo', 'resumo')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('autor', 'texto', 'created_at')
    search_fields = ('autor', 'texto')

@admin.register(AnimalDesaparecido)
class AnimalDesaparecidoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'local', 'contato', 'encontrado', 'created_at')
    list_filter = ('encontrado',)
    search_fields = ('nome', 'local', 'descricao')

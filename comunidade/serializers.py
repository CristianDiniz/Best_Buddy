from rest_framework import serializers
from .models import Noticia, Post, AnimalDesaparecido

class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticia
        fields = ['id', 'titulo', 'resumo', 'conteudo', 'imagem', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'autor', 'texto', 'created_at']
        read_only_fields = ['id', 'created_at']


class AnimalDesaparecidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalDesaparecido
        fields = ['id', 'nome', 'local', 'contato', 'descricao', 'foto', 'encontrado', 'created_at']
        read_only_fields = ['id', 'encontrado', 'created_at']

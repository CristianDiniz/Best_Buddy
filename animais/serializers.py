from rest_framework import serializers
from .models import Animal

class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id',
            'nome',
            'raca',
            'sexo',
            'idade_aproximada',
            'medicamento',
            'vacinacao',
            'contato',
            'descricao',
            'imagem',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
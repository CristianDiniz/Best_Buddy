from rest_framework import serializers
from .models import Adocao

class AdocoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adocao
        fields = [ 
            'ongs', 
            'pessoa', 
            'StatusAdocao', 
            'nome', 
            'raca', 
            'sexo', 
            'idade_aproximada',
            'medicamentos',
            'vacinacao', 
            'contato', 
            ]
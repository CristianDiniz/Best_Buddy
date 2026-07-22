from rest_framework import serializers
from .models import Animais

class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animais
        fields = [
            'sexo', 
            'idade_aproximada', 
            'medicamento', 
            'vacinacao', 
            'pessoa', 
            'nome', 
            'raca', 
            'idade', 
            'contato']
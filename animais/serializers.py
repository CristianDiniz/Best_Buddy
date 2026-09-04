from rest_framework import serializers
from .models import Animal

class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'sexo', 
            'idade_aproximada', 
            'medicamento', 
            'vacinacao', 
            'nome', 
            'raca', 
            'contato']
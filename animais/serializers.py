from rest_framework import serializers
from .models import Animais

class AnimaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animais
        fields = '__all__'
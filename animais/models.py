from django.db import models


class SexoAnimal(models.Choices):
    MACHO = "M", "Macho"
    FEMEA = "F", "Fêmea"
    INDETERMINADO = "I", "Indeterminado"


class Animais(models.Model):
    nome = models.CharField(50, null=True, blank=True)
    raca = models.CharField(50, null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SexoAnimal)

    def __str__(self):
        return f"{self.nome} ({self.get_sexo_display()})"

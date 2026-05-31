from django.db import models


class Animais(models.Model):
    class SexoAnimal(models.TextChoices):
        MACHO = 'M', 'Macho'
        FEMEA = 'F', 'Fêmea'
        INDETERMINADO = 'I', 'Indeterminado'

    class IdadeAproximada(models.TextChoices):
        FILHOTE = 'Filhote'
        ADULTO = 'Adulto'
        IDOSO = 'Idoso'

    class Medicamento(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'

    class Vacina(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'

    nome = models.CharField(50, null=True, blank=True)
    raca = models.CharField(50, null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SexoAnimal)
    idade = models.CharField(2, null=True, blank=True)
    idade_aproximada = models.CharField(10, choices=IdadeAproximada)
    medicamentos = models.CharField(10, choices=Medicamento)
    vacinacao = models.CharField(10, choices=Vacina)
    contato = models.CharField(15)

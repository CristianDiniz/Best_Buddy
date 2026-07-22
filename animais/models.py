from django.db import models


class Animal(models.Model):
    class SexoAnimal(models.TextChoices):
        MACHO = 'M', 'Macho'
        FEMEA = 'F', 'Fêmea'
        INDETERMINADO = 'I', 'Indeterminado'
    sexo = models.CharField(max_length=1, choices=SexoAnimal)

    class IdadeAproximada(models.TextChoices):
        FILHOTE = 'Filhote'
        ADULTO = 'Adulto'
        IDOSO = 'Idoso'
    idade_aproximada = models.CharField(max_length=10, choices=IdadeAproximada)

    class Medicamento(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'
    medicamento = models.CharField(max_length=10, choices=Medicamento)

    class Vacina(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'
    vacinacao = models.CharField(max_length=10, choices=Vacina)


    nome = models.CharField(max_length=50, null=True, blank=True)
    raca = models.CharField("raça",max_length=50, null=True, blank=True)
    
    
    
    
    contato = models.CharField(max_length=15)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['nome']

    def __str__(self):
        return self.nome

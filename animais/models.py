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

    pessoa = models.ForeignKey(
        "pessoas.Pessoa",
        on_delete=models.PROTECT,)
    nome = models.CharField(max_length=50, null=True, blank=True)
    raca = models.CharField("raça",max_length=50, null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SexoAnimal)
    idade = models.CharField(max_length=2, null=True, blank=True)
    idade_aproximada = models.CharField(max_length=10, choices=IdadeAproximada)
    medicamentos = models.CharField(max_length=10, choices=Medicamento)
    vacinacao = models.CharField(max_length=10, choices=Vacina)
    contato = models.CharField(max_length=15)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['nome']

    def __str__(self):
        return self.nome

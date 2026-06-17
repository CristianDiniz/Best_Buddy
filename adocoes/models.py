from django.db import models
from django.urls import reverse
from django.core.exceptions import ValidationError

class Adocao(models.Model):

    
    class Status(models.TextChoices):
        ABERTA = "A", "Aberta"
        FINALIZADA = "F", "Finalizada"
        CANCELADA = "C", "Cancelada"
        INATIVA = "I", "Inativa"

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
        
    ongs = models.ForeignKey(
        "ongs.Ong",
        on_delete=models.PROTECT,
        null=True,
        blank=True,)
    
    pessoa = models.ForeignKey(
        "pessoas.Pessoa", 
        on_delete=models.PROTECT,
        null=True,
        blank=True,)

    StatusAdocao = models.CharField(
        max_length=1, 
        choices=Status.choices, 
        default=Status.ABERTA)
    
    nome = models.CharField(
        max_length=50, 
        null=True, 
        blank=True)
    raca = models.CharField(
        "adoção",max_length=50, 
        null=True, 
        blank=True)
    
    sexo = models.CharField(
        max_length=1, 
        choices=SexoAnimal)
    
    idade = models.CharField(
        max_length=2, 
        null=True, 
        blank=True)
    
    idade_aproximada = models.CharField(
        max_length=10, 
        choices=IdadeAproximada)
    
    medicamentos = models.CharField(
        max_length=10, 
        choices=Medicamento)
    
    vacinacao = models.CharField(
        max_length=10, 
        choices=Vacina)
    
    contato = models.CharField(
        max_length=15)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Adoçao'
        verbose_name_plural = 'Adoções'
        ordering = ['nome']

    def __str__(self):
        return self.nome
    
    def clean(self):
        if not self.ongs and not self.pessoa:
            raise ValidationError("Adoção deve estar associada a uma ONG ou a uma Pessoa.")
        if self.ongs and self.pessoa:
            raise ValidationError("Adoção não pode estar associada a uma ONG e a uma Pessoa ao mesmo tempo.")

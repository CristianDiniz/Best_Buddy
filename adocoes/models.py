from django.db import models
from django.urls import reverse
from django.core.exceptions import ValidationError



class Adocao(models.Model):

    
    class Status(models.TextChoices):
        ABERTA = "A", "Aberta"
        FINALIZADA = "F", "Finalizada"
        CANCELADA = "C", "Cancelada"
        INATIVA = "I", "Inativa"
    
    StatusAdocao = models.CharField(
        max_length=1, 
        choices=Status.choices, 
        default=Status.ABERTA, verbose_name="Status da Adoção")
    
    
    class SexoAnimal(models.TextChoices):
        MACHO = 'M', 'Macho'
        FEMEA = 'F', 'Fêmea'
        INDETERMINADO = 'I', 'Indeterminado'

    sexo = models.CharField(
    max_length=1, 
    choices=SexoAnimal, verbose_name="Sexo do animal")



    class IdadeAproximada(models.TextChoices):
        FILHOTE = 'Filhote'
        ADULTO = 'Adulto'
        IDOSO = 'Idoso'


    idade_aproximada = models.CharField(
        max_length=10, 
        choices=IdadeAproximada, verbose_name="Idade aproximada do animal")
    


    class Medicamento(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'

    medicamentos = models.CharField(
        max_length=10, 
        choices=Medicamento, verbose_name="O animal faz uso de medicamentos?")
    

    class Vacina(models.TextChoices):
        SIM = 'Sim'
        NAO = 'Não'
        NAO_SABE = 'Nâo sei'
        
    vacinacao = models.CharField(
        max_length=10, 
        choices=Vacina, verbose_name="O animal está com a vacinação em dia?")
  
    
    nome = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, verbose_name="Nome do animal")
    
    raca = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, verbose_name="Raça do animal")
    
    contato = models.CharField(
        max_length=15)
    

    descricao = models.TextField(
        max_length=500, verbose_name="Descrição do animal",
        help_text="Descreva o animal, incluindo informações sobre seu comportamento, saúde e necessidades especiais."
        "Quanto mais detalhes você fornecer, melhor será a experiência do adotante.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Adoçao'
        verbose_name_plural = 'Adoções'
        ordering = ['nome']

    def __str__(self):
        return self.nome
            
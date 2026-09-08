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
        SIM = 'Sim', 'Sim'
        NAO = 'Não', 'Não'
        NAO_SABE = 'Não sei', 'Não sei'
    medicamento = models.CharField(max_length=10, choices=Medicamento)

    class Vacina(models.TextChoices):
        SIM = 'Sim', 'Sim'
        NAO = 'Não', 'Não'
        NAO_SABE = 'Não sei', 'Não sei'
    vacinacao = models.CharField(max_length=10, choices=Vacina)

    nome = models.CharField(max_length=50, null=True, blank=True)
    raca = models.CharField("raça", max_length=50, null=True, blank=True)
    contato = models.CharField(max_length=20)
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição do animal")
    imagem = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL da Foto do animal")


    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['nome']

    def __str__(self):
        return self.nome or f"Animal #{self.id}"


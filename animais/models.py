from django.db import models
from django.conf import settings


class Animal(models.Model):
    class TipoServico(models.TextChoices):
        ADOCAO = 'ADOCAO', 'Adoção'
        PERDIDO = 'PERDIDO', 'Animal Perdido'

    class TipoAnimal(models.TextChoices):
        CACHORRO = 'CACHORRO', 'Cachorro'
        GATO = 'GATO', 'Gato'
        OUTRO = 'OUTRO', 'Outro'

    class SexoAnimal(models.TextChoices):
        MACHO = 'M', 'Macho'
        FEMEA = 'F', 'Fêmea'
        INDETERMINADO = 'I', 'Indeterminado'

    class IdadeAproximada(models.TextChoices):
        FILHOTE = 'Filhote', 'Filhote'
        ADULTO = 'Adulto', 'Adulto'
        IDOSO = 'Idoso', 'Idoso'

    class Medicamento(models.TextChoices):
        SIM = 'Sim', 'Sim'
        NAO = 'Não', 'Não'
        NAO_SABE = 'Não sei', 'Não sei'

    class Vacina(models.TextChoices):
        SIM = 'Sim', 'Sim'
        NAO = 'Não', 'Não'
        NAO_SABE = 'Não sei', 'Não sei'

    class StatusAnimal(models.TextChoices):
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        ADOTADO = 'ADOTADO', 'Adotado'
        PERDIDO = 'PERDIDO', 'Perdido'
        ENCONTRADO = 'ENCONTRADO', 'Encontrado'
        INATIVO = 'INATIVO', 'Inativo'

    # Vínculo obrigatório com o tutor autenticado
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='animais',
        null=True,
        blank=True,
        verbose_name="Tutor Anunciante"
    )

    # Discriminador unificado do serviço
    tipo_servico = models.CharField(
        max_length=10,
        choices=TipoServico.choices,
        default=TipoServico.ADOCAO,
        verbose_name="Tipo de Serviço"
    )

    tipo_animal = models.CharField(
        max_length=15,
        choices=TipoAnimal.choices,
        default=TipoAnimal.CACHORRO,
        verbose_name="Tipo de Animal"
    )

    nome = models.CharField(max_length=50, null=True, blank=True, verbose_name="Nome do Pet")
    cidade = models.CharField(max_length=100, default='', verbose_name="Cidade")
    descricao = models.CharField(max_length=255, blank=True, null=True, verbose_name="Descrição / Informações extras")
    imagem = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL da Foto do animal")
    
    status = models.CharField(
        max_length=15,
        choices=StatusAnimal.choices,
        default=StatusAnimal.DISPONIVEL,
        verbose_name="Status do Anúncio"
    )

    # Campos específicos de adoção (opcionais para animais perdidos)
    raca = models.CharField("Raça", max_length=50, null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SexoAnimal.choices, null=True, blank=True)
    idade_aproximada = models.CharField(max_length=10, choices=IdadeAproximada.choices, null=True, blank=True)
    medicamento = models.CharField(max_length=10, choices=Medicamento.choices, null=True, blank=True)
    vacinacao = models.CharField(max_length=10, choices=Vacina.choices, null=True, blank=True)

    # Campos específicos de animal perdido (opcional para adoção)
    local = models.CharField(max_length=200, blank=True, null=True, verbose_name="Último local visto / Ponto de referência")

    # Ciclo de vida (regra 90 + 30 dias)
    inativado_em = models.DateTimeField(null=True, blank=True, verbose_name="Data de inativação")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['-created_at']

    @property
    def contato(self):
        """O contato vem diretamente da Chave Estrangeira do tutor."""
        if self.tutor and self.tutor.telefone:
            return self.tutor.telefone
        return ""

    def __str__(self):
        servico = "Adoção" if self.tipo_servico == self.TipoServico.ADOCAO else "Perdido"
        return f"[{servico}] {self.nome or 'Sem nome'} ({self.cidade})"

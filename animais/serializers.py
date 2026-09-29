from rest_framework import serializers
from .models import Animal


class AnimaisSerializer(serializers.ModelSerializer):
    tutor_id = serializers.IntegerField(source='tutor.id', read_only=True)
    tutor_email = serializers.EmailField(source='tutor.email', read_only=True)
    tutor_nome = serializers.SerializerMethodField()

    def get_tutor_nome(self, obj):
        if not obj.tutor:
            return "Tutor independente"
        if hasattr(obj.tutor, 'perfil_pf') and obj.tutor.perfil_pf.nome:
            return obj.tutor.perfil_pf.nome
        if hasattr(obj.tutor, 'perfil_pj'):
            return obj.tutor.perfil_pj.nome_fantasia or obj.tutor.perfil_pj.razao_social or "ONG"
        return obj.tutor.email.split('@')[0]

    contato = serializers.CharField(source='telefone_contato', read_only=True)
    telefone_contato = serializers.CharField(
        max_length=20,
        required=False,
        error_messages={
            "blank": "É necessário um número de contato para cadastrar o animal.",
        }
    )

    class Meta:
        model = Animal
        fields = [
            'id',
            'tutor_id',
            'tutor_email',
            'tutor_nome',
            'contato',
            'tipo_servico',
            'tipo_animal',
            'nome',
            'estado',
            'cidade',
            'telefone_contato',
            'descricao',
            'imagem',
            'status',
            'raca',
            'sexo',
            'idade_aproximada',
            'medicamento',
            'vacinacao',
            'local',
            'inativado_em',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tutor_id', 'tutor_email', 'tutor_nome', 'contato', 'created_at', 'updated_at']

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            if not user or not user.is_authenticated:
                raise serializers.ValidationError("Autenticação obrigatória para anunciar um animal.")

            telefone_contato = attrs.get('telefone_contato')
            telefone_validado = getattr(user, 'telefone_validado', False)
            telefone_tutor = getattr(user, 'telefone', None)

            if not telefone_contato:
                if telefone_validado and telefone_tutor:
                    attrs['telefone_contato'] = telefone_tutor
                else:
                    raise serializers.ValidationError({
                        "telefone_contato": "É necessário um número de contato para cadastrar o animal."
                    })

            # Cota de 5 animais ativos para usuários comuns
            tipo_usuario = getattr(user, 'tipo', 'PF')
            if tipo_usuario != 'ONG' and not user.is_superuser:
                ativos_count = Animal.objects.filter(
                    tutor=user,
                    status__in=[Animal.StatusAnimal.DISPONIVEL, Animal.StatusAnimal.PERDIDO]
                ).count()
                if ativos_count >= 5:
                    raise serializers.ValidationError(
                        "Limite atingido: usuários comuns podem manter no máximo 5 anúncios ativos simultaneamente."
                    )

        if 'telefone_contato' in attrs and not attrs['telefone_contato']:
            raise serializers.ValidationError({
                "telefone_contato": "É necessário um número de contato para cadastrar o animal."
            })

        return attrs
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

    class Meta:
        model = Animal
        fields = [
            'id',
            'tutor_id',
            'tutor_email',
            'tutor_nome',
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
        read_only_fields = ['id', 'tutor_id', 'tutor_email', 'tutor_nome', 'created_at', 'updated_at']

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            if not user or not user.is_authenticated:
                raise serializers.ValidationError("Autenticação obrigatória para anunciar um animal.")

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

        return attrs
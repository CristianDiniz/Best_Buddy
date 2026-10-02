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

    contato = serializers.SerializerMethodField()
    telefone_contato = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    def get_contato(self, obj):
        if obj.tutor and obj.tutor.telefone:
            return obj.tutor.telefone
        return obj.telefone_contato or ""

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
            'castrado',
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
            telefone_tutor = getattr(user, 'telefone', None)

            # O telefone de contato é herdado e vinculado diretamente à conta do tutor
            if telefone_tutor:
                attrs['telefone_contato'] = telefone_tutor
            elif not telefone_contato:
                raise serializers.ValidationError({
                    "telefone_contato": "É necessário ter um número de contato cadastrado na sua conta para anunciar o animal."
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

    def validate_imagem(self, value):
        if value:
            extensoes_permitidas = ['jpg', 'jpeg', 'png']
            ext = value.name.split('.')[-1].lower()
            if ext not in extensoes_permitidas:
                raise serializers.ValidationError("Formato inválido. Apenas imagens JPEG e PNG são permitidas.")

            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("A imagem excede o tamanho máximo de 5 MB.")
        return value
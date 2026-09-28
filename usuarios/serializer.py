from rest_framework import serializers
from .models import Usuario, PessoaFisica, PessoaJuridica, Endereco
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "tipo",
            "telefone",
            "telefone_validado",
            "created_at",
        ]
        read_only_fields = ["id", "telefone_validado", "created_at"]


class PessoaFisicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PessoaFisica
        fields = [
            "nome",
            "telefone",
        ]


class PessoaJuridicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PessoaJuridica
        fields = [
            "cnpj",
            "razao_social",
            "nome_fantasia",
            "situacao",
            "cnae_principal",
            "telefone",
            "endereco",
        ]


class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = [
            "endereco",
            "cep",
            "rua",
            "numero",
            "bairro",
            "cidade",
            "estado",
        ]


class RegisterUsuarioSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tipo = serializers.ChoiceField(choices=Usuario.TipoUsuario.choices, default="PF")
    telefone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # PF
    nome = serializers.CharField(required=False, allow_blank=True)

    # PJ
    razao_social = serializers.CharField(required=False, allow_blank=True)
    cnpj = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value.lower()

    def create(self, validated_data):
        tipo = validated_data.get("tipo", "PF")
        telefone_informado = validated_data.get("telefone", "").strip() or None

        user = Usuario.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            tipo=tipo,
            telefone=telefone_informado,
            telefone_validado=False
        )

        if tipo == "PF":
            PessoaFisica.objects.create(
                usuario=user,
                nome=validated_data.get("nome", ""),
                telefone=validated_data.get("telefone", "")
            )

        elif tipo == "PJ":
            PessoaJuridica.objects.create(
                usuario=user,
                razao_social=validated_data.get("razao_social", ""),
                cnpj=validated_data.get("cnpj", ""),
                telefone=validated_data.get("telefone", "")
            )

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "tipo": user.tipo,
                "telefone": user.telefone,
                "telefone_validado": user.telefone_validado,
            }
        }


class AlterarEmailSerializer(serializers.Serializer):
    novo_email = serializers.EmailField()
    senha_atual = serializers.CharField(write_only=True)

    def validate_novo_email(self, value):
        user = self.context.get("request").user if self.context.get("request") else None
        if Usuario.objects.filter(email__iexact=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Este email já está em uso por outro usuário.")
        return value.lower()


class ConfirmarEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class AlterarSenhaSerializer(serializers.Serializer):
    senha_atual = serializers.CharField(write_only=True)
    nova_senha = serializers.CharField(write_only=True)
    confirmar_nova_senha = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["nova_senha"] != attrs["confirmar_nova_senha"]:
            raise serializers.ValidationError({"confirmar_nova_senha": "As novas senhas não coincidem."})
        if len(attrs["nova_senha"]) < 6:
            raise serializers.ValidationError({"nova_senha": "A nova senha deve ter pelo menos 6 caracteres."})
        return attrs


class TwilioEnviarCodigoSerializer(serializers.Serializer):
    telefone = serializers.CharField(max_length=25)

    def validate_telefone(self, value):
        limpo = "".join(filter(str.isdigit, value))
        if len(limpo) < 10 or len(limpo) > 13:
            raise serializers.ValidationError("Informe um número de telefone com DDD válido (ex: 11999998888).")
        return value.strip()


class TwilioVerificarCodigoSerializer(serializers.Serializer):
    telefone = serializers.CharField(max_length=25)
    codigo = serializers.CharField(max_length=10)


class RecuperarSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class RedefinirSenhaSerializer(serializers.Serializer):
    token = serializers.CharField()
    nova_senha = serializers.CharField(write_only=True)
    confirmar_nova_senha = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["nova_senha"] != attrs["confirmar_nova_senha"]:
            raise serializers.ValidationError({"confirmar_nova_senha": "As novas senhas não coincidem."})
        if len(attrs["nova_senha"]) < 6:
            raise serializers.ValidationError({"nova_senha": "A nova senha deve ter pelo menos 6 caracteres."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        nome = ""
        if self.user.tipo == "PF" and hasattr(self.user, 'perfil_pf'):
            nome = self.user.perfil_pf.nome
        elif self.user.tipo == "PJ" and hasattr(self.user, 'perfil_pj'):
            nome = self.user.perfil_pj.nome_fantasia or self.user.perfil_pj.razao_social

        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'tipo': self.user.tipo,
            'telefone': self.user.telefone,
            'telefone_validado': self.user.telefone_validado,
            'nome': nome or self.user.email.split('@')[0],
        }
        return data
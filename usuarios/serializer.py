from rest_framework import serializers
from .models import Usuario, PessoaFisica, PessoaJuridica, Endereco
from rest_framework_simplejwt.tokens import RefreshToken


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "email",
            "tipo",
        ]


class PessoaFisicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PessoaFisica
        fields = [
            "cpf",
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
    tipo = serializers.ChoiceField(choices=Usuario.TipoUsuario.choices)

    # PF
    nome = serializers.CharField(required=False)
    cpf = serializers.CharField(required=False)
    telefone = serializers.CharField(required=False)

    # PJ
    razao_social = serializers.CharField(required=False)
    cnpj = serializers.CharField(required=False)

    def create(self, validated_data):
        tipo = validated_data["tipo"]

        user = Usuario.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            tipo=tipo
        )

        if tipo == "PF":
            PessoaFisica.objects.create(
                usuario=user,
                nome=validated_data.get("nome", ""),
                cpf=validated_data.get("cpf", ""),
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
            "user": user,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
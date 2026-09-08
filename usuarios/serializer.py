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
            "nome",
            "cpf",
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
    nome = serializers.CharField(required=False, allow_blank=True)
    cpf = serializers.CharField(required=False, allow_blank=True)
    telefone = serializers.CharField(required=False, allow_blank=True)

    # PJ
    razao_social = serializers.CharField(required=False, allow_blank=True)
    cnpj = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value.lower()

    def validate_cpf(self, value):
        if value and PessoaFisica.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value


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
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
            'nome': nome or self.user.email.split('@')[0],
        }
        return data
"""Convierte el modelo Salon a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Salon, SalonHorario


class SalonSerializer(serializers.ModelSerializer):
    horarios = serializers.SerializerMethodField()

    class Meta:
        model = Salon
        fields = ['nombre', 'eslogan', 'direccion', 'ciudad', 'telefono', 'whatsapp', 'correo', 'horarios']

    def get_horarios(self, obj):
        return [{'dias': h.dias, 'horas': h.horas} for h in SalonHorario.objects.order_by('id')]

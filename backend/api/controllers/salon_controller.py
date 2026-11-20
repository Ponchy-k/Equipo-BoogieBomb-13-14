"""CONTROLADOR · Información del salón."""
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Salon
from ..serializers import SalonSerializer


@api_view(['GET'])
def salon(request):
    return Response(SalonSerializer(Salon.objects.get(pk=1)).data)

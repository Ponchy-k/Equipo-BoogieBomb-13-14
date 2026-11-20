"""Utilidades comunes de los controladores."""


class FiltrosMixin:
    """Permite filtrar con ?campo=valor, por ejemplo /api/citas/?fecha=2026-11-12&empleadoId=1"""
    filtros = {}   # nombre en la URL -> campo del modelo

    def get_queryset(self):
        qs = super().get_queryset()
        for param, campo in self.filtros.items():
            valor = self.request.query_params.get(param)
            if valor not in (None, ''):
                qs = qs.filter(**{campo: valor})
        return qs

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'lumina:carrito'
const CartContext = createContext(null)

function leer() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leer)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* sin persistencia */
    }
  }, [items])

  /** producto: { id, nombre, marca, precio, stock, tono } */
  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.productoId === producto.id)
      if (existe) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i,
        )
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          marca: producto.marca,
          precio: producto.precio,
          stock: producto.stock,
          tono: producto.tono,
          cantidad: Math.min(cantidad, producto.stock),
        },
      ]
    })
  }, [])

  const actualizarCantidad = useCallback((productoId, cantidad) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productoId === productoId ? { ...i, cantidad: Math.max(0, Math.min(cantidad, i.stock)) } : i))
        .filter((i) => i.cantidad > 0),
    )
  }, [])

  const quitar = useCallback((productoId) => setItems((prev) => prev.filter((i) => i.productoId !== productoId)), [])
  const vaciar = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const total = items.reduce((a, i) => a + i.precio * i.cantidad, 0)
    const cantidad = items.reduce((a, i) => a + i.cantidad, 0)
    return { items, total, cantidad, agregar, actualizarCantidad, quitar, vaciar }
  }, [items, agregar, actualizarCantidad, quitar, vaciar])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
